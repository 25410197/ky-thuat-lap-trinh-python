from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.danh_muc import router as danh_muc_router
from app.api.routes.health import router as health_router
from app.api.routes.nguoi_dung import router as nguoi_dung_router
from app.api.routes.thong_ke import router as thong_ke_router
from app.api.routes.thu_vien_anh import router as thu_vien_anh_router
from app.api.routes.tin_dang import router as tin_dang_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(title=settings.app_name)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(health_router, prefix="/api")
    application.include_router(auth_router, prefix="/api")
    application.include_router(danh_muc_router, prefix="/api")
    application.include_router(tin_dang_router, prefix="/api")
    application.include_router(thu_vien_anh_router, prefix="/api")
    application.include_router(nguoi_dung_router, prefix="/api")
    application.include_router(thong_ke_router, prefix="/api")

    return application


app = create_app()
