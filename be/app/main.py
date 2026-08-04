from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
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
    import os
    from fastapi.staticfiles import StaticFiles
    from app.api.routes.upload import router as upload_router
    
    os.makedirs("static/uploads", exist_ok=True)
    application.mount("/static", StaticFiles(directory="static"), name="static")

    application.include_router(health_router, prefix="/api")
    application.include_router(auth_router, prefix="/api")
    application.include_router(tin_dang_router, prefix="/api")
    application.include_router(upload_router, prefix="/api")
    
    return application


app = create_app()
