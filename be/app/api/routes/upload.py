import os
import uuid
from typing import List
from fastapi import APIRouter, File, UploadFile

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = "static/uploads"

@router.post("/images")
async def upload_images(files: List[UploadFile] = File(...)):
    urls = []
    for file in files:
        file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
        new_filename = f"{uuid.uuid4().hex}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, new_filename)
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
            
        urls.append(f"/static/uploads/{new_filename}")
        
    return {"urls": urls}
