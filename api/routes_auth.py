from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from auth import hash_password, verify_password, create_access_token, get_current_user
from database import get_session
from models import User, UserRole
from schemas import RegisterRequest, LoginRequest, TokenResponse, UserPublic

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", status_code=201)
def register(body: RegisterRequest, session: Session = Depends(get_session)):
    exists = session.exec(select(User).where(User.email == body.email)).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=body.email, password_hash=hash_password(body.password), role=body.role)
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"id": user.id, "email": user.email, "role": user.role}

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == body.email)).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=UserPublic(id=user.id, email=user.email, role=user.role, created_at=user.created_at))

@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)):
    return UserPublic(id=user.id, email=user.email, role=user.role, created_at=user.created_at)
