import logging
import os

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.email import render_branded_email, send_email
from app.core.rate_limit import limiter
from app.core.security import (
    create_access_token,
    create_email_verification_token,
    create_password_reset_token,
    get_current_user,
    get_email_verification_email,
    get_password_reset_email,
    hash_password,
    verify_password,
    verify_password_reset_token,
)
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    ResetPasswordRequest,
    SignupRequest,
    SignupResponse,
    TokenResponse,
    UpdateProfileRequest,
    UserResponse,
    VerifyEmailResponse,
)

logger = logging.getLogger("app")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def signup(request: Request, payload: SignupRequest, db: Session = Depends(get_db)) -> SignupResponse:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email, name=payload.name,
        hashed_password=hash_password(payload.password), is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_email_verification_token(user.email)
    verify_link = f"{FRONTEND_URL}/verify-email?token={token}"
    sent = send_email(
        user.email,
        "Verify your FareLens account",
        render_branded_email(
            heading="Welcome to FareLens 👋",
            body_lines=[
                "Thanks for signing up! Click the button below to verify your email "
                "address and activate your account.",
            ],
            cta_text="Verify Email",
            cta_url=verify_link,
            footnote="This link expires in 24 hours. If you didn't create this account, you can ignore this email.",
        ),
    )

    response = SignupResponse()
    if not sent and os.getenv("ENV") != "production":
        response.dev_verification_token = token
    return response


@router.get("/verify-email", response_model=VerifyEmailResponse)
def verify_email(token: str, db: Session = Depends(get_db)) -> VerifyEmailResponse:
    email = get_email_verification_email(token)
    if email is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired verification token")

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired verification token")

    if not user.is_verified:
        user.is_verified = True
        db.commit()
    return VerifyEmailResponse()


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Please verify your email before logging in")

    return TokenResponse(access_token=create_access_token(subject=user.email))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    if payload.name is not None:
        current_user.name = payload.name
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/me/avatar", response_model=UserResponse)
def delete_avatar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    # Only clears the reference on our side — the file itself stays on
    # Cloudinary (deleting it there needs a signed request with the API
    # secret, which is intentionally never exposed to this unsigned-upload
    # frontend). Acceptable for a free-tier personal project; a real
    # production setup would clean it up via a signed backend call.
    current_user.avatar_url = None
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
@limiter.limit("5/minute")
def forgot_password(
    request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)
) -> ForgotPasswordResponse:
    """Always returns the same generic message regardless of whether the
    email exists — prevents using this endpoint to enumerate registered
    accounts. Sends via Brevo when BREVO_API_KEY is configured; otherwise
    (or if the send fails) the token is returned directly outside
    production so the flow stays fully testable without Brevo set up."""
    user = db.query(User).filter(User.email == payload.email).first()
    response = ForgotPasswordResponse()

    if user is not None:
        token = create_password_reset_token(user)
        reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
        sent = send_email(
            user.email,
            "Reset your FareLens password",
            render_branded_email(
                heading="Reset your password",
                body_lines=[
                    f"Hi{(' ' + user.email.split('@')[0]) if user.email else ''},",
                    "We got a request to reset the password for your FareLens account. "
                    "Click the button below to choose a new one.",
                ],
                cta_text="Reset Password",
                cta_url=reset_link,
                footnote=(
                    "This link expires in 15 minutes. If you didn't request a password "
                    "reset, you can safely ignore this email — your password won't change."
                ),
            ),
        )
        if not sent and os.getenv("ENV") != "production":
            response.dev_reset_token = token

    return response


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
def reset_password(
    request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)
) -> None:
    email = get_password_reset_email(payload.token)
    generic_error = HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset token")
    if email is None:
        raise generic_error

    user = db.query(User).filter(User.email == email).first()
    if user is None or not verify_password_reset_token(payload.token, user):
        raise generic_error

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
