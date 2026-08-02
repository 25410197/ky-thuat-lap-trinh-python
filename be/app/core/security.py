from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(mat_khau: str) -> str:
    return pwd_context.hash(mat_khau)


def verify_password(mat_khau: str, mat_khau_hash: str) -> bool:
    return pwd_context.verify(mat_khau, mat_khau_hash)
