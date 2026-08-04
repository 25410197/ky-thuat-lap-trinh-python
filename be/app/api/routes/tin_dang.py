from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import get_db, get_current_user
from app.models import PhuongXa, QuanHuyen, TinDang, NguoiDung, LoaiBatDongSan, TinhThanh, TienIch, HinhAnhTinDang
from app.models.enums import TrangThaiTinDang, PhuongThucLienHe
from app.schemas.tin_dang import DanhSachTinDang, TinDangTomTat, TinDangCuaToiResponse, DangTinRequest


router = APIRouter(prefix="/rental-posts", tags=["tin-dang"])


@router.get("", response_model=DanhSachTinDang)
def danh_sach_tin_dang(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
) -> DanhSachTinDang:
    bo_loc = TinDang.trang_thai == TrangThaiTinDang.DA_DUYET

    total = db.query(func.count(TinDang.id)).filter(bo_loc).scalar() or 0

    rows = (
        db.query(TinDang)
        .options(
            joinedload(TinDang.loai_bat_dong_san),
            joinedload(TinDang.phuong_xa)
            .joinedload(PhuongXa.quan_huyen)
            .joinedload(QuanHuyen.tinh_thanh),
            joinedload(TinDang.hinh_anh),
            joinedload(TinDang.tien_ich),
        )
        .filter(bo_loc)
        .order_by(TinDang.ngay_dang.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = [
        TinDangTomTat(
            id=tin.id,
            tieu_de=tin.tieu_de,
            gia_thue=float(tin.gia_thue),
            dien_tich=float(tin.dien_tich),
            dia_chi_chi_tiet=tin.dia_chi_chi_tiet,
            loai_bat_dong_san=tin.loai_bat_dong_san.ten,
            phuong_xa=tin.phuong_xa.ten,
            quan_huyen=tin.phuong_xa.quan_huyen.ten,
            tinh_thanh=tin.phuong_xa.quan_huyen.tinh_thanh.ten,
            anh_dai_dien=next(
                (anh.duong_dan_anh for anh in tin.hinh_anh if anh.la_anh_dai_dien),
                tin.hinh_anh[0].duong_dan_anh if tin.hinh_anh else None,
            ),
            tien_ich=[tien_ich.ten for tien_ich in tin.tien_ich],
            ngay_dang=tin.ngay_dang,
        )
        for tin in rows
    ]

    return DanhSachTinDang(items=items, total=total, page=page, page_size=page_size)

@router.get("/me", response_model=list[TinDangCuaToiResponse])
def danh_sach_tin_dang_cua_toi(
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user)
) -> list[TinDangCuaToiResponse]:
    # Lấy tất cả tin do người dùng này đăng
    rows = (
        db.query(TinDang)
        .options(
            joinedload(TinDang.phuong_xa)
            .joinedload(PhuongXa.quan_huyen)
            .joinedload(QuanHuyen.tinh_thanh),
            joinedload(TinDang.hinh_anh),
        )
        .filter(TinDang.nguoi_dang_id == nguoi_dung.id)
        .order_by(TinDang.ngay_dang.desc())
        .all()
    )

    ket_qua = []
    for tin in rows:
        status_map = {
            "cho_duyet": "pending",
            "da_duyet": "published",
            "bi_khoa": "rejected",
            "an": "archived",
            "da_xoa": "archived"
        }
        status_en = status_map.get(tin.trang_thai, "pending")

        anh_dai_dien = next((anh.duong_dan_anh for anh in tin.hinh_anh if anh.la_anh_dai_dien), None)
        if not anh_dai_dien and tin.hinh_anh:
            anh_dai_dien = tin.hinh_anh[0].duong_dan_anh

        ket_qua.append(TinDangCuaToiResponse(
            id=str(tin.id),
            title=tin.tieu_de,
            description=tin.mo_ta,
            priceVnd=float(tin.gia_thue),
            address=tin.dia_chi_chi_tiet,
            city=tin.phuong_xa.quan_huyen.tinh_thanh.ten if tin.phuong_xa else "",
            bedrooms=tin.phong_ngu,
            bathrooms=tin.phong_tam,
            areaM2=float(tin.dien_tich),
            coverImageUrl=anh_dai_dien,
            status=status_en,
            ownerId=str(tin.nguoi_dang_id),
            createdAt=tin.ngay_dang.isoformat()
        ))
        
    return ket_qua

@router.post("", status_code=201)
def tao_tin_dang_moi(
    du_lieu: DangTinRequest,
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user)
):
    loai_bds = db.query(LoaiBatDongSan).filter(LoaiBatDongSan.ten == du_lieu.propertyType).first()
    if not loai_bds:
        loai_bds = LoaiBatDongSan(ten=du_lieu.propertyType)
        db.add(loai_bds)
        db.flush()

    tinh = db.query(TinhThanh).filter(TinhThanh.ten == du_lieu.province).first()
    if not tinh:
        tinh = TinhThanh(ten=du_lieu.province)
        db.add(tinh)
        db.flush()
        
    quan = db.query(QuanHuyen).filter(QuanHuyen.ten == f"Trực thuộc {du_lieu.province}", QuanHuyen.tinh_thanh_id == tinh.id).first()
    if not quan:
        quan = QuanHuyen(ten=f"Trực thuộc {du_lieu.province}", tinh_thanh_id=tinh.id)
        db.add(quan)
        db.flush()

    phuong = db.query(PhuongXa).filter(PhuongXa.ten == du_lieu.ward, PhuongXa.quan_huyen_id == quan.id).first()
    if not phuong:
        phuong = PhuongXa(ten=du_lieu.ward, quan_huyen_id=quan.id)
        db.add(phuong)
        db.flush()

    danh_sach_tien_ich = []
    for ten_ti in du_lieu.amenities:
        ti = db.query(TienIch).filter(TienIch.ten == ten_ti).first()
        if not ti:
            ti = TienIch(ten=ten_ti)
            db.add(ti)
            db.flush()
        danh_sach_tien_ich.append(ti)
        
    phuong_thuc = PhuongThucLienHe.GOI_DIEN if du_lieu.contactMethod == "call" else PhuongThucLienHe.NHAN_TIN
    
    tin_moi = TinDang(
        tieu_de=du_lieu.title,
        mo_ta=du_lieu.description,
        gia_thue=du_lieu.priceVnd,
        dien_tich=du_lieu.areaM2,
        phong_ngu=du_lieu.bedrooms,
        phong_tam=du_lieu.bathrooms,
        dia_chi_chi_tiet=du_lieu.address,
        loai_bat_dong_san_id=loai_bds.id,
        phuong_xa_id=phuong.id,
        nguoi_dang_id=nguoi_dung.id,
        ten_nguoi_lien_he=du_lieu.contactName,
        so_dien_thoai_lien_he=du_lieu.contactPhone,
        phuong_thuc_lien_he_uu_tien=phuong_thuc,
        tien_ich=danh_sach_tien_ich,
        trang_thai=TrangThaiTinDang.CHO_DUYET
    )
    db.add(tin_moi)
    db.flush()

    for i, url in enumerate(du_lieu.images):
        anh = HinhAnhTinDang(
            tin_dang_id=tin_moi.id,
            duong_dan_anh=url,
            thu_tu_hien_thi=i,
            la_anh_dai_dien=(i == 0)
        )
        db.add(anh)
        
    db.commit()

    return {"message": "Đăng tin thành công!", "id": tin_moi.id}
