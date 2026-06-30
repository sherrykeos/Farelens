from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str | None = None
    avatar_url: str | None = None
    role: str
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    avatar_url: str | None = Field(default=None, max_length=500)


class SignupResponse(BaseModel):
    detail: str = "Account created. Check your email to verify it before logging in."
    # Only populated when ENV != production (no real Brevo key configured,
    # or Brevo send failed) — see app/core/email.py. Never sent in a real
    # deployment with Brevo wired up.
    dev_verification_token: str | None = None


class VerifyEmailResponse(BaseModel):
    detail: str = "Email verified — you can now log in."


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    detail: str = "If that email is registered, a password reset link has been sent."
    # Only populated when ENV != production (no email provider wired yet —
    # see app/core/security.py). Never sent in a real deployment.
    dev_reset_token: str | None = None


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
