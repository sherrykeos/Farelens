def test_forgot_password_returns_token_in_dev_mode(client):
    client.post("/api/v1/auth/signup", json={"email": "reset1@example.com", "name": "Reset One", "password": "oldpassword123"})
    response = client.post("/api/v1/auth/forgot-password", json={"email": "reset1@example.com"})
    assert response.status_code == 200
    assert response.json()["dev_reset_token"] is not None


def test_forgot_password_unknown_email_returns_generic_response(client):
    response = client.post("/api/v1/auth/forgot-password", json={"email": "nobody@example.com"})
    assert response.status_code == 200
    assert response.json()["dev_reset_token"] is None


def test_reset_password_with_valid_token_changes_password(client):
    signup = client.post("/api/v1/auth/signup", json={"email": "reset2@example.com", "name": "Reset Two", "password": "oldpassword123"})
    client.get("/api/v1/auth/verify-email", params={"token": signup.json()["dev_verification_token"]})
    token = client.post("/api/v1/auth/forgot-password", json={"email": "reset2@example.com"}).json()["dev_reset_token"]

    response = client.post("/api/v1/auth/reset-password", json={"token": token, "new_password": "newpassword123"})
    assert response.status_code == 204

    old_login = client.post("/api/v1/auth/login", json={"email": "reset2@example.com", "name": "Reset Two", "password": "oldpassword123"})
    assert old_login.status_code == 401

    new_login = client.post("/api/v1/auth/login", json={"email": "reset2@example.com", "password": "newpassword123"})
    assert new_login.status_code == 200


def test_reset_password_rejects_garbage_token(client):
    response = client.post("/api/v1/auth/reset-password", json={"token": "not-a-real-token", "new_password": "newpassword123"})
    assert response.status_code == 400


def test_reset_password_token_cannot_be_reused_after_password_changed(client):
    client.post("/api/v1/auth/signup", json={"email": "reset3@example.com", "name": "Reset Three", "password": "oldpassword123"})
    token = client.post("/api/v1/auth/forgot-password", json={"email": "reset3@example.com"}).json()["dev_reset_token"]

    first_use = client.post("/api/v1/auth/reset-password", json={"token": token, "new_password": "newpassword123"})
    assert first_use.status_code == 204

    second_use = client.post("/api/v1/auth/reset-password", json={"token": token, "new_password": "anotherpassword123"})
    assert second_use.status_code == 400
