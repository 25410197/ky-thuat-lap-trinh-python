import re
import unicodedata
from datetime import datetime, timezone

import nh3
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import get_current_admin_user, get_db
from app.models import BaiViet, NguoiDung
from app.schemas.bai_viet import (
    BaiVietDoiTrangThaiRequest,
    BaiVietQuanTriChiTiet,
    BaiVietQuanTriTomTat,
    BaiVietSuaRequest,
    BaiVietTaoRequest,
    DanhSachBaiVietQuanTri,
    trang_thai_tu_status,
)

router = APIRouter(prefix="/tin-tuc", tags=["bai-viet"])

CAC_THE_CHO_PHEP = {
    "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4",
    "blockquote", "ul", "ol", "li", "a", "img", "code", "pre",
}
CAC_THUOC_TINH_CHO_PHEP = {
    "a": {"href", "target", "rel"},
    "img": {"src", "alt"},
}


def sanitize_html(html: str) -> str:
    return nh3.clean(html, tags=CAC_THE_CHO_PHEP, attributes=CAC_THUOC_TINH_CHO_PHEP, link_rel=None)


def _slugify(text: str) -> str:
    text = text.strip().lower().replace("đ", "d").replace("Đ", "d")
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text or "bai-viet"


def _slug_duy_nhat(db: Session, slug_goc: str, bo_qua_id: int | None = None) -> str:
    slug = slug_goc
    hau_to = 2
    while True:
        truy_van = db.query(BaiViet.id).filter(BaiViet.slug == slug)
        if bo_qua_id is not None:
            truy_van = truy_van.filter(BaiViet.id != bo_qua_id)
        if truy_van.first() is None:
            return slug
        slug = f"{slug_goc}-{hau_to}"
        hau_to += 1


def _tim_bai_viet_hoac_404(db: Session, bai_viet_id: int) -> BaiViet:
    bai_viet = (
        db.query(BaiViet)
        .options(joinedload(BaiViet.anh_bia))
        .filter(BaiViet.id == bai_viet_id)
        .first()
    )
    if bai_viet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy bài viết.")
    return bai_viet


@router.get("", response_model=DanhSachBaiVietQuanTri)
def danh_sach_bai_viet_quan_tri(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: str | None = Query(None, description="Tìm theo tiêu đề"),
    trang_thai: str | None = Query(None, description="draft | published | hidden"),
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
) -> DanhSachBaiVietQuanTri:
    truy_van = db.query(BaiViet).options(joinedload(BaiViet.anh_bia))
    if q:
        truy_van = truy_van.filter(BaiViet.tieu_de.ilike(f"%{q.strip()}%"))
    if trang_thai:
        trang_thai_enum = trang_thai_tu_status(trang_thai)
        if trang_thai_enum is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Trạng thái không hợp lệ. Chỉ chấp nhận draft, published, hidden.",
            )
        truy_van = truy_van.filter(BaiViet.trang_thai == trang_thai_enum)

    total = truy_van.with_entities(func.count(BaiViet.id)).scalar() or 0
    rows = (
        truy_van.order_by(BaiViet.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    items = [BaiVietQuanTriTomTat.tu_model(row) for row in rows]
    return DanhSachBaiVietQuanTri(items=items, total=total, page=page, page_size=page_size)


@router.get("/{bai_viet_id}", response_model=BaiVietQuanTriChiTiet)
def chi_tiet_bai_viet_quan_tri(
    bai_viet_id: int,
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
) -> BaiVietQuanTriChiTiet:
    bai_viet = _tim_bai_viet_hoac_404(db, bai_viet_id)
    return BaiVietQuanTriChiTiet.tu_model(bai_viet)


@router.post("", response_model=BaiVietQuanTriChiTiet, status_code=status.HTTP_201_CREATED)
def tao_bai_viet(
    du_lieu: BaiVietTaoRequest,
    db: Session = Depends(get_db),
    admin: NguoiDung = Depends(get_current_admin_user),
) -> BaiVietQuanTriChiTiet:
    slug_goc = _slugify(du_lieu.slug or du_lieu.tieu_de)
    slug = _slug_duy_nhat(db, slug_goc)

    bai_viet = BaiViet(
        tieu_de=du_lieu.tieu_de.strip(),
        slug=slug,
        tom_tat=du_lieu.tom_tat.strip(),
        noi_dung_html=sanitize_html(du_lieu.noi_dung_html),
        anh_bia_id=du_lieu.anh_bia_id,
        nguoi_tao_id=admin.id,
    )
    db.add(bai_viet)
    db.commit()
    db.refresh(bai_viet)
    return BaiVietQuanTriChiTiet.tu_model(bai_viet)


@router.put("/{bai_viet_id}", response_model=BaiVietQuanTriChiTiet)
def sua_bai_viet(
    bai_viet_id: int,
    du_lieu: BaiVietSuaRequest,
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
) -> BaiVietQuanTriChiTiet:
    bai_viet = _tim_bai_viet_hoac_404(db, bai_viet_id)

    bai_viet.tieu_de = du_lieu.tieu_de.strip()
    bai_viet.tom_tat = du_lieu.tom_tat.strip()
    bai_viet.noi_dung_html = sanitize_html(du_lieu.noi_dung_html)
    bai_viet.anh_bia_id = du_lieu.anh_bia_id

    if du_lieu.slug:
        slug_goc = _slugify(du_lieu.slug)
        if slug_goc != bai_viet.slug:
            bai_viet.slug = _slug_duy_nhat(db, slug_goc, bo_qua_id=bai_viet.id)

    db.commit()
    db.refresh(bai_viet)
    return BaiVietQuanTriChiTiet.tu_model(bai_viet)


@router.patch("/{bai_viet_id}/trang-thai", response_model=BaiVietQuanTriChiTiet)
def doi_trang_thai_bai_viet(
    bai_viet_id: int,
    du_lieu: BaiVietDoiTrangThaiRequest,
    db: Session = Depends(get_db),
    _admin: NguoiDung = Depends(get_current_admin_user),
) -> BaiVietQuanTriChiTiet:
    bai_viet = _tim_bai_viet_hoac_404(db, bai_viet_id)

    trang_thai_moi = du_lieu.to_enum()
    if trang_thai_moi.value == "da_dang" and bai_viet.ngay_dang is None:
        bai_viet.ngay_dang = datetime.now(timezone.utc)

    bai_viet.trang_thai = trang_thai_moi
    db.commit()
    db.refresh(bai_viet)
    return BaiVietQuanTriChiTiet.tu_model(bai_viet)
