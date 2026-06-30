import hashlib
import os
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User

_DEV_DEFAULT_SECRET = "dev-only-insecure-secret-change-me"
SECRET_KEY = os.getenv("JWT_SECRET_KEY", _DEV_DEFAULT_SECRET)
if os.getenv("ENV") == "production" and SECRET_KEY == _DEV_DEFAULT_SECRET:
    raise RuntimeError(
        "JWT_SECRET_KEY env var must be set in production — refusing to start "
        "with the insecure default secret."
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24h, fine for a portfolio project
PASSWORD_RESET_EXPIRE_MINUTES = 15
PASSWORD_RESET_TOKEN_TYPE = "password_reset"
EMAIL_VERIFICATION_EXPIRE_MINUTES = 60 * 24  # 24h to click the link
EMAIL_VERIFICATION_TOKEN_TYPE = "email_verification"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        subject = payload.get("sub")
        if subject is None:
            raise JWTError("Token missing subject")
        return subject
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def _password_fingerprint(hashed_password: str) -> str:
    """Short digest of the current password hash, embedded in reset tokens
    so a token automatically stops working the instant the password is
    changed — no separate token-revocation table needed."""
    return hashlib.sha256(hashed_password.encode("utf-8")).hexdigest()[:16]


def create_password_reset_token(user: User) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=PASSWORD_RESET_EXPIRE_MINUTES)
    payload = {
        "sub": user.email,
        "type": PASSWORD_RESET_TOKEN_TYPE,
        "pwd_fp": _password_fingerprint(user.hashed_password),
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_password_reset_token(token: str, user: User) -> bool:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return False
    if payload.get("type") != PASSWORD_RESET_TOKEN_TYPE:
        return False
    if payload.get("sub") != user.email:
        return False
    if payload.get("pwd_fp") != _password_fingerprint(user.hashed_password):
        return False
    return True


def get_password_reset_email(token: str) -> str | None:
    """Extract the email claim without verifying the fingerprint (the
    fingerprint check needs the user record, looked up by this email)."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
    if payload.get("type") != PASSWORD_RESET_TOKEN_TYPE:
        return None
    return payload.get("sub")


def create_email_verification_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=EMAIL_VERIFICATION_EXPIRE_MINUTES)
    payload = {"sub": email, "type": EMAIL_VERIFICATION_TOKEN_TYPE, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_email_verification_email(token: str) -> str | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
    if payload.get("type") != EMAIL_VERIFICATION_TOKEN_TYPE:
        return None
    return payload.get("sub")


def get_current_user(
    token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email = decode_access_token(token)
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
