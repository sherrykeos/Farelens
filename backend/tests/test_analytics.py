def test_fare_calendar_empty_route_returns_empty_list(client):
    response = client.get(
        "/api/v1/prices/calendar",
        params={"source_city": "Chennai", "destination_city": "Kolkata"},
    )
    assert response.status_code == 200
    assert response.json() == []


def test_fare_calendar_rejects_same_source_and_destination(client):
    response = client.get(
        "/api/v1/prices/calendar",
        params={"source_city": "Delhi", "destination_city": "Delhi"},
    )
    assert response.status_code == 422


def test_fare_calendar_returns_seeded_data_and_flags_anomaly(client, seed_price_history):
    seed_price_history()
    response = client.get(
        "/api/v1/prices/calendar",
        params={"source_city": "Delhi", "destination_city": "Mumbai", "flight_class": "Economy"},
    )
    assert response.status_code == 200
    days = response.json()
    assert len(days) == 7
    anomaly_days = [d for d in days if d["is_anomaly"]]
    assert len(anomaly_days) == 1
    assert anomaly_days[0]["price"] == 15000


def test_cheapest_date_with_no_data_returns_404(client):
    response = client.get(
        "/api/v1/prices/cheapest-date",
        params={"source_city": "Chennai", "destination_city": "Kolkata"},
    )
    assert response.status_code == 404


def test_cheapest_date_returns_lowest_price(client, seed_price_history):
    seed_price_history()
    response = client.get(
        "/api/v1/prices/cheapest-date",
        params={"source_city": "Delhi", "destination_city": "Mumbai"},
    )
    assert response.status_code == 200
    assert response.json()["price"] == 4900


def test_anomalies_detects_seeded_price_spike(client, seed_price_history):
    seed_price_history()
    response = client.get(
        "/api/v1/prices/anomalies",
        params={"source_city": "Delhi", "destination_city": "Mumbai"},
    )
    assert response.status_code == 200
    anomalies = response.json()
    assert len(anomalies) == 1
    assert anomalies[0]["price"] == 15000
    assert anomalies[0]["severity"] in ("moderate", "high")


def test_anomalies_with_too_little_data_returns_empty(client, seed_price_history):
    seed_price_history(prices=[5000, 5100])
    response = client.get(
        "/api/v1/prices/anomalies",
        params={"source_city": "Delhi", "destination_city": "Mumbai"},
    )
    assert response.status_code == 200
    assert response.json() == []


def test_popular_routes_reflects_real_watchlists(client, auth_headers):
    headers = auth_headers(email="popularity@example.com")
    client.post(
        "/api/v1/watchlists",
        json={"source_city": "Delhi", "destination_city": "Mumbai", "target_price": 5000},
        headers=headers,
    )
    response = client.get("/api/v1/routes/popular")
    assert response.status_code == 200
    routes = response.json()
    assert any(r["source_city"] == "Delhi" and r["destination_city"] == "Mumbai" for r in routes)


def test_market_analytics_returns_real_aggregates(client, seed_price_history):
    seed_price_history()
    response = client.get("/api/v1/analytics/market")
    assert response.status_code == 200
    body = response.json()
    assert body["data_points"] >= 7
    assert "Economy" in body["avg_price_by_class"]


def test_fare_calendar_includes_confidence_range(client, seed_price_history):
    seed_price_history()
    response = client.get(
        "/api/v1/prices/calendar",
        params={"source_city": "Delhi", "destination_city": "Mumbai", "flight_class": "Economy"},
    )
    day = response.json()[0]
    assert day["confidence_low"] < day["price"] < day["confidence_high"]
    assert "airline" in day and "stops" in day and "duration" in day


def test_fare_calendar_filters_by_airline(client, seed_price_history):
    # Same date, two airlines, two different prices — without a filter the
    # cheapest (SpiceJet) should win; filtering to Vistara should return
    # the more expensive Vistara-only price instead.
    seed_price_history(
        prices=[5000, 8000],
        airlines=["SpiceJet", "Vistara"],
        stops_list=["zero", "zero"],
    )

    unfiltered = client.get(
        "/api/v1/prices/cheapest-date",
        params={"source_city": "Delhi", "destination_city": "Mumbai"},
    ).json()
    assert unfiltered["airline"] == "SpiceJet"
    assert unfiltered["price"] == 5000

    filtered = client.get(
        "/api/v1/prices/cheapest-date",
        params={"source_city": "Delhi", "destination_city": "Mumbai", "airline": "Vistara"},
    ).json()
    assert filtered["airline"] == "Vistara"
    assert filtered["price"] == 8000


def test_fare_calendar_filters_by_stops(client, seed_price_history):
    seed_price_history(
        prices=[6000, 9000],
        airlines=["Vistara", "Vistara"],
        stops_list=["zero", "two_or_more"],
    )

    response = client.get(
        "/api/v1/prices/calendar",
        params={"source_city": "Delhi", "destination_city": "Mumbai", "stops": "two_or_more"},
    )
    days = response.json()
    assert all(d["stops"] == "two_or_more" for d in days)
    assert any(d["price"] == 9000 for d in days)


def test_airline_comparison_returns_one_row_per_airline_sorted_by_price(client):
    from datetime import date, timedelta

    from app.core.database import SessionLocal
    from app.models.price_history import PriceHistory

    travel_date = date.today() + timedelta(days=15)
    db = SessionLocal()
    try:
        for airline, price, stops in [
            ("Vistara", 9000, "zero"),
            ("AirAsia", 4500, "zero"),
            ("Indigo", 6000, "zero"),
            ("AirAsia", 4000, "one"),  # same airline, different stops, cheaper — must win
        ]:
            db.add(PriceHistory(
                source_city="Chennai", destination_city="Bangalore", flight_class="Economy",
                travel_date=travel_date, price=price, airline=airline, stops=stops,
            ))
        db.commit()
    finally:
        db.close()

    response = client.get(
        "/api/v1/prices/airline-comparison",
        params={
            "source_city": "Chennai", "destination_city": "Bangalore",
            "travel_date": str(travel_date),
        },
    )
    assert response.status_code == 200
    rows = response.json()

    # One row per distinct airline, not per price_history row.
    assert len(rows) == 3
    airlines = [r["airline"] for r in rows]
    assert sorted(airlines) == ["AirAsia", "Indigo", "Vistara"]

    # Sorted cheapest-first, and AirAsia's two rows collapsed to its cheaper one.
    assert rows[0]["airline"] == "AirAsia"
    assert rows[0]["price"] == 4000
    assert rows[-1]["airline"] == "Vistara"


def test_airline_comparison_rejects_same_source_and_destination(client):
    from datetime import date

    response = client.get(
        "/api/v1/prices/airline-comparison",
        params={"source_city": "Delhi", "destination_city": "Delhi", "travel_date": str(date.today())},
    )
    assert response.status_code == 422
