import io
import uuid
from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.core.minio_client import build_public_url, get_minio_client

router = APIRouter(prefix="/upload", tags=["upload"])

DINH_DANG_CHO_PHEP = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}
DUNG_LUONG_TOI_DA = 5 * 1024 * 1024
SO_LUONG_TOI_DA_MOI_LAN = 20


@router.post("/images")
async def upload_images(files: List[UploadFile] = File(...)):
    if len(files) > SO_LUONG_TOI_DA_MOI_LAN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Chỉ được tải lên tối đa {SO_LUONG_TOI_DA_MOI_LAN} ảnh mỗi lần.",
        )

    settings = get_settings()
    client = get_minio_client()
    urls = []

    for file in files:
        if file.content_type not in DINH_DANG_CHO_PHEP:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Định dạng ảnh không hợp lệ: {file.filename}. Chỉ chấp nhận JPEG, PNG, WEBP.",
            )

        content = await file.read()
        if len(content) > DUNG_LUONG_TOI_DA:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ảnh {file.filename} vượt quá dung lượng tối đa 5MB.",
            )

        file_ext = DINH_DANG_CHO_PHEP[file.content_type]
        object_name = f"{uuid.uuid4().hex}.{file_ext}"

        client.put_object(
            settings.minio_bucket,
            object_name,
            data=io.BytesIO(content),
            length=len(content),
            content_type=file.content_type,
        )

        urls.append(build_public_url(object_name))

    return {"urls": urls}
