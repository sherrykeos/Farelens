import os

import pytest
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
# Force the dev-mode fallback (token returned in the API response) instead
# of real Brevo sends — tests must stay fast, offline, and deterministic,
# and must not burn real email-send quota every run.
os.environ["BREVO_API_KEY"] = ""

from app.core.database import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(autouse=True, scope="session")
def _setup_test_db():
    Base.metadata.create_all(bind=engine)
    # Rate limiting is exercised in test_rate_limit.py with its own fresh
    # client; disabling it here avoids the whole suite tripping the limit
    # since TestClient requests all share one fake IP.
    app.state.limiter.enabled = False
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if os.path.exists("test.db"):
        os.remove("test.db")


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture()
def valid_predict_payload() -> dict:
    return {
        "airline": "Vistara",
        "source_city": "Delhi",
        "destination_city": "Mumbai",
        "departure_time": "Morning",
        "arrival_time": "Afternoon",
        "stops": "one",
        "class": "Economy",
        "duration": 2.5,
        "days_left": 10,
    }


@pytest.fixture()
def seed_price_history():
    from datetime import date, timedelta

    from app.models.price_history import PriceHistory

    def _seed(
        source_city="Delhi", destination_city="Mumbai", flight_class="Economy", prices=None,
        airlines=None, stops_list=None,
    ):
        if prices is None:
            prices = [5000, 5100, 4900, 5050, 4950, 5200, 15000]  # last one is a deliberate outlier
        airlines = airlines or ["Vistara"] * len(prices)
        stops_list = stops_list or ["zero"] * len(prices)
        db = SessionLocal()
        today = date.today()
        try:
            for i, price in enumerate(prices):
                db.add(PriceHistory(
                    source_city=source_city,
                    destination_city=destination_city,
                    flight_class=flight_class,
                    travel_date=today + timedelta(days=i + 1),
                    price=price,
                    airline=airlines[i],
                    stops=stops_list[i],
                    source="model_estimate",
                ))
            db.commit()
        finally:
            db.close()

    yield _seed

    db = SessionLocal()
    try:
        from app.models.price_history import PriceHistory as PH
        db.query(PH).delete()
        db.commit()
    finally:
        db.close()


@pytest.fixture()
def auth_headers(client):
    def _make(email: str = "test@example.com", password: str = "supersecret123", name: str = "Test User") -> dict:
        signup = client.post("/api/v1/auth/signup", json={"email": email, "name": name, "password": password})
        verify_token = signup.json()["dev_verification_token"]
        client.get("/api/v1/auth/verify-email", params={"token": verify_token})
        response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    return _make
