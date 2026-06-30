def test_signup_creates_unverified_user_and_returns_dev_token(client):
    response = client.post(
        "/api/v1/auth/signup", json={"email": "alice@example.com", "name": "Alice", "password": "supersecret123"}
    )
    assert response.status_code == 201
    body = response.json()
    assert "access_token" not in body  # signup no longer auto-logs-in
    assert body["dev_verification_token"] is not None


def test_signup_rejects_duplicate_email(client):
    payload = {"email": "bob@example.com", "name": "Bob", "password": "supersecret123"}
    client.post("/api/v1/auth/signup", json=payload)
    response = client.post("/api/v1/auth/signup", json=payload)
    assert response.status_code == 409


def test_signup_rejects_short_password(client):
    response = client.post(
        "/api/v1/auth/signup", json={"email": "carol@example.com", "name": "Carol", "password": "short"}
    )
    assert response.status_code == 422


def test_login_before_verifying_email_is_rejected(client):
    payload = {"email": "dave@example.com", "name": "Dave", "password": "supersecret123"}
    client.post("/api/v1/auth/signup", json=payload)
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 403


def test_verify_email_then_login_succeeds(client):
    payload = {"email": "gina@example.com", "name": "Gina", "password": "supersecret123"}
    signup = client.post("/api/v1/auth/signup", json=payload)
    token = signup.json()["dev_verification_token"]

    verify = client.get("/api/v1/auth/verify-email", params={"token": token})
    assert verify.status_code == 200

    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_verify_email_rejects_garbage_token(client):
    response = client.get("/api/v1/auth/verify-email", params={"token": "not-a-real-token"})
    assert response.status_code == 400


def test_verify_email_is_idempotent(client):
    payload = {"email": "henry@example.com", "name": "Henry", "password": "supersecret123"}
    signup = client.post("/api/v1/auth/signup", json=payload)
    token = signup.json()["dev_verification_token"]

    first = client.get("/api/v1/auth/verify-email", params={"token": token})
    second = client.get("/api/v1/auth/verify-email", params={"token": token})
    assert first.status_code == 200
    assert second.status_code == 200


def test_login_with_wrong_password_fails(client, auth_headers):
    auth_headers(email="erin@example.com")  # signs up + verifies
    response = client.post(
        "/api/v1/auth/login", json={"email": "erin@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_me_requires_authentication(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_returns_current_user(client, auth_headers):
    headers = auth_headers(email="frank@example.com")
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "frank@example.com"
    assert response.json()["is_verified"] is True
    assert response.json()["name"] == "Test User"


def test_signup_stores_name(client, auth_headers):
    headers = auth_headers(email="ivy@example.com", name="Ivy Lane")
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.json()["name"] == "Ivy Lane"


def test_update_profile_requires_auth(client):
    response = client.patch("/api/v1/auth/me", json={"name": "New Name"})
    assert response.status_code == 401


def test_update_profile_changes_name_and_avatar(client, auth_headers):
    headers = auth_headers(email="jack@example.com")
    response = client.patch(
        "/api/v1/auth/me",
        json={"name": "Jack Updated", "avatar_url": "https://res.cloudinary.com/demo/avatar.png"},
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Jack Updated"
    assert body["avatar_url"] == "https://res.cloudinary.com/demo/avatar.png"

    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.json()["name"] == "Jack Updated"


def test_delete_avatar_requires_auth(client):
    response = client.delete("/api/v1/auth/me/avatar")
    assert response.status_code == 401


def test_delete_avatar_clears_avatar_url(client, auth_headers):
    headers = auth_headers(email="kara@example.com")
    client.patch("/api/v1/auth/me", json={"avatar_url": "https://res.cloudinary.com/demo/avatar.png"}, headers=headers)

    response = client.delete("/api/v1/auth/me/avatar", headers=headers)
    assert response.status_code == 200
    assert response.json()["avatar_url"] is None

    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.json()["avatar_url"] is None
