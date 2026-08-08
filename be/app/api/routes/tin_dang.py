from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import get_db, get_current_user
from app.models import (
    PhuongXa,
    PhuongXaMoi,
    QuanHuyen,
    TinDang,
    NguoiDung,
    LoaiBatDongSan,
    TinhThanh,
    TienIch,
    HinhAnhTinDang,
    phuong_xa_anh_xa,
)
from app.models.enums import TrangThaiTinDang, PhuongThucLienHe
from app.schemas.tin_dang import (
    DanhSachTinDang,
    TinDangTomTat,
    TinDangCuaToiResponse,
    DangTinRequest,
    TinDangChiTiet,
    TinDangSuaResponse,
)

router = APIRouter(prefix="/rental-posts", tags=["tin-dang"])

_TRANG_THAI_SANG_STATUS_EN = {
    TrangThaiTinDang.CHO_DUYET: "pending",
    TrangThaiTinDang.DA_DUYET: "published",
    TrangThaiTinDang.BI_KHOA: "rejected",
    TrangThaiTinDang.AN: "archived",
    TrangThaiTinDang.DA_XOA: "deleted",
}


def _kiem_tra_chu_tin(tin: TinDang, nguoi_dung: NguoiDung) -> None:
    if tin.nguoi_dang_id != nguoi_dung.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền chỉnh sửa tin đăng này.",
        )


@router.get("", response_model=DanhSachTinDang)
def danh_sach_tin_dang(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    q: str | None = Query(None, description="Tìm theo tiêu đề hoặc địa chỉ"),
    loai_bat_dong_san_id: int | None = Query(None),
    tinh_thanh_id: int | None = Query(None),
    quan_huyen_id: int | None = Query(None, description="Lọc theo quận/huyện — địa giới CŨ (trước sáp nhập)"),
    phuong_xa_moi_id: int | None = Query(None, description="Lọc theo xã/phường — địa giới MỚI (sau sáp nhập)"),
    gia_tu: float | None = Query(None, ge=0),
    gia_den: float | None = Query(None, ge=0),
    dien_tich_tu: float | None = Query(None, ge=0),
    dien_tich_den: float | None = Query(None, ge=0),
    db: Session = Depends(get_db),
) -> DanhSachTinDang:
    dieu_kien = [TinDang.trang_thai == TrangThaiTinDang.DA_DUYET]

    if q:
        tu_khoa = f"%{q.strip()}%"
        dieu_kien.append(or_(TinDang.tieu_de.ilike(tu_khoa), TinDang.dia_chi_chi_tiet.ilike(tu_khoa)))
    if loai_bat_dong_san_id is not None:
        dieu_kien.append(TinDang.loai_bat_dong_san_id == loai_bat_dong_san_id)
    if gia_tu is not None:
        dieu_kien.append(TinDang.gia_thue >= gia_tu)
    if gia_den is not None:
        dieu_kien.append(TinDang.gia_thue <= gia_den)
    if dien_tich_tu is not None:
        dieu_kien.append(TinDang.dien_tich >= dien_tich_tu)
    if dien_tich_den is not None:
        dieu_kien.append(TinDang.dien_tich <= dien_tich_den)

    if quan_huyen_id is not None:
        dieu_kien.append(
            TinDang.phuong_xa_id.in_(select(PhuongXa.id).where(PhuongXa.quan_huyen_id == quan_huyen_id))
        )
    elif phuong_xa_moi_id is not None:
        dieu_kien.append(
            TinDang.phuong_xa_id.in_(
                select(phuong_xa_anh_xa.c.phuong_xa_id).where(
                    phuong_xa_anh_xa.c.phuong_xa_moi_id == phuong_xa_moi_id
                )
            )
        )
    elif tinh_thanh_id is not None:
        dieu_kien.append(
            TinDang.phuong_xa_id.in_(
                select(PhuongXa.id)
                .join(QuanHuyen, PhuongXa.quan_huyen_id == QuanHuyen.id)
                .where(QuanHuyen.tinh_thanh_id == tinh_thanh_id)
            )
        )

    bo_loc = and_(*dieu_kien)

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
        status_en = _TRANG_THAI_SANG_STATUS_EN.get(tin.trang_thai, "pending")

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

    xa_moi = db.get(PhuongXaMoi, du_lieu.phuongXaMoiId)
    if xa_moi is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy xã/phường.")
    if not xa_moi.phuong_xa_cu:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Xã/phường này chưa có dữ liệu địa giới tương ứng, vui lòng chọn xã/phường khác.",
        )
    phuong = xa_moi.phuong_xa_cu[0]

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

    db.add(
        HinhAnhTinDang(
            tin_dang_id=tin_moi.id,
            duong_dan_anh=du_lieu.anhChinh,
            thu_tu_hien_thi=0,
            la_anh_dai_dien=True,
        )
    )
    for i, url in enumerate(du_lieu.anhPhu, start=1):
        db.add(
            HinhAnhTinDang(
                tin_dang_id=tin_moi.id,
                duong_dan_anh=url,
                thu_tu_hien_thi=i,
                la_anh_dai_dien=False,
            )
        )
        
    db.commit()

    return {"message": "Đăng tin thành công!", "id": tin_moi.id}


@router.get("/{tin_dang_id}/chinh-sua", response_model=TinDangSuaResponse)
def lay_tin_dang_de_sua(
    tin_dang_id: int,
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
) -> TinDangSuaResponse:
    tin = (
        db.query(TinDang)
        .options(
            joinedload(TinDang.loai_bat_dong_san),
            joinedload(TinDang.phuong_xa).joinedload(PhuongXa.xa_phuong_moi),
            joinedload(TinDang.hinh_anh),
            joinedload(TinDang.tien_ich),
        )
        .filter(TinDang.id == tin_dang_id)
        .first()
    )
    if tin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng.")
    _kiem_tra_chu_tin(tin, nguoi_dung)

    anh_sap_xep = sorted(tin.hinh_anh, key=lambda anh: (not anh.la_anh_dai_dien, anh.thu_tu_hien_thi))
    anh_chinh = next(
        (anh.duong_dan_anh for anh in anh_sap_xep if anh.la_anh_dai_dien),
        anh_sap_xep[0].duong_dan_anh if anh_sap_xep else "",
    )
    anh_phu = [anh.duong_dan_anh for anh in anh_sap_xep if not anh.la_anh_dai_dien]

    # Tin đăng lưu theo địa giới CŨ (phuong_xa_id) — quy đổi ngược sang xã/phường MỚI để đổ vào form.
    xa_moi = tin.phuong_xa.xa_phuong_moi[0] if tin.phuong_xa.xa_phuong_moi else None

    return TinDangSuaResponse(
        id=tin.id,
        title=tin.tieu_de,
        propertyType=tin.loai_bat_dong_san.ten,
        areaM2=float(tin.dien_tich),
        priceVnd=float(tin.gia_thue),
        provinceId=str(xa_moi.tinh_thanh_id) if xa_moi else "",
        wardId=str(xa_moi.id) if xa_moi else "",
        address=tin.dia_chi_chi_tiet,
        description=tin.mo_ta,
        coverImage=anh_chinh,
        galleryImages=anh_phu,
        amenities=[tien_ich.ten for tien_ich in tin.tien_ich],
        contactName=tin.ten_nguoi_lien_he,
        contactPhone=tin.so_dien_thoai_lien_he,
        contactMethod="call" if tin.phuong_thuc_lien_he_uu_tien == PhuongThucLienHe.GOI_DIEN else "zalo",
        bedrooms=tin.phong_ngu,
        bathrooms=tin.phong_tam,
        status=_TRANG_THAI_SANG_STATUS_EN.get(tin.trang_thai, "pending"),
    )


@router.put("/{tin_dang_id}")
def cap_nhat_tin_dang(
    tin_dang_id: int,
    du_lieu: DangTinRequest,
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
):
    tin = db.get(TinDang, tin_dang_id)
    if tin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng.")
    _kiem_tra_chu_tin(tin, nguoi_dung)

    loai_bds = db.query(LoaiBatDongSan).filter(LoaiBatDongSan.ten == du_lieu.propertyType).first()
    if not loai_bds:
        loai_bds = LoaiBatDongSan(ten=du_lieu.propertyType)
        db.add(loai_bds)
        db.flush()

    xa_moi = db.get(PhuongXaMoi, du_lieu.phuongXaMoiId)
    if xa_moi is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy xã/phường.")
    if not xa_moi.phuong_xa_cu:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Xã/phường này chưa có dữ liệu địa giới tương ứng, vui lòng chọn xã/phường khác.",
        )
    phuong = xa_moi.phuong_xa_cu[0]

    danh_sach_tien_ich = []
    for ten_ti in du_lieu.amenities:
        ti = db.query(TienIch).filter(TienIch.ten == ten_ti).first()
        if not ti:
            ti = TienIch(ten=ten_ti)
            db.add(ti)
            db.flush()
        danh_sach_tien_ich.append(ti)

    phuong_thuc = PhuongThucLienHe.GOI_DIEN if du_lieu.contactMethod == "call" else PhuongThucLienHe.NHAN_TIN

    tin.tieu_de = du_lieu.title
    tin.mo_ta = du_lieu.description
    tin.gia_thue = du_lieu.priceVnd
    tin.dien_tich = du_lieu.areaM2
    tin.phong_ngu = du_lieu.bedrooms
    tin.phong_tam = du_lieu.bathrooms
    tin.dia_chi_chi_tiet = du_lieu.address
    tin.loai_bat_dong_san_id = loai_bds.id
    tin.phuong_xa_id = phuong.id
    tin.ten_nguoi_lien_he = du_lieu.contactName
    tin.so_dien_thoai_lien_he = du_lieu.contactPhone
    tin.phuong_thuc_lien_he_uu_tien = phuong_thuc
    tin.tien_ich = danh_sach_tien_ich

    # Tin đã duyệt mà bị sửa nội dung thì phải duyệt lại từ đầu.
    if tin.trang_thai == TrangThaiTinDang.DA_DUYET:
        tin.trang_thai = TrangThaiTinDang.CHO_DUYET

    tin.hinh_anh.clear()
    db.flush()
    db.add(
        HinhAnhTinDang(
            tin_dang_id=tin.id,
            duong_dan_anh=du_lieu.anhChinh,
            thu_tu_hien_thi=0,
            la_anh_dai_dien=True,
        )
    )
    for i, url in enumerate(du_lieu.anhPhu, start=1):
        db.add(
            HinhAnhTinDang(
                tin_dang_id=tin.id,
                duong_dan_anh=url,
                thu_tu_hien_thi=i,
                la_anh_dai_dien=False,
            )
        )

    db.commit()

    return {"message": "Cập nhật tin đăng thành công!", "id": tin.id}


@router.get("/{tin_dang_id}", response_model=TinDangChiTiet)
def chi_tiet_tin_dang(tin_dang_id: int, db: Session = Depends(get_db)) -> TinDangChiTiet:
    tin = (
        db.query(TinDang)
        .options(
            joinedload(TinDang.loai_bat_dong_san),
            joinedload(TinDang.phuong_xa)
            .joinedload(PhuongXa.quan_huyen)
            .joinedload(QuanHuyen.tinh_thanh),
            joinedload(TinDang.hinh_anh),
            joinedload(TinDang.tien_ich),
        )
        .filter(TinDang.id == tin_dang_id, TinDang.trang_thai == TrangThaiTinDang.DA_DUYET)
        .first()
    )
    if tin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng")

    tin.luot_xem += 1
    db.commit()

    anh_sap_xep = sorted(tin.hinh_anh, key=lambda anh: (not anh.la_anh_dai_dien, anh.thu_tu_hien_thi))

    return TinDangChiTiet(
        id=tin.id,
        tieu_de=tin.tieu_de,
        mo_ta=tin.mo_ta,
        gia_thue=float(tin.gia_thue),
        dien_tich=float(tin.dien_tich),
        dia_chi_chi_tiet=tin.dia_chi_chi_tiet,
        loai_bat_dong_san=tin.loai_bat_dong_san.ten,
        phuong_xa=tin.phuong_xa.ten,
        quan_huyen=tin.phuong_xa.quan_huyen.ten,
        tinh_thanh=tin.phuong_xa.quan_huyen.tinh_thanh.ten,
        hinh_anh=[anh.duong_dan_anh for anh in anh_sap_xep],
        tien_ich=[tien_ich.ten for tien_ich in tin.tien_ich],
        ten_nguoi_lien_he=tin.ten_nguoi_lien_he,
        so_dien_thoai_lien_he=tin.so_dien_thoai_lien_he,
        phuong_thuc_lien_he_uu_tien=tin.phuong_thuc_lien_he_uu_tien.value,
        luot_xem=tin.luot_xem,
        ngay_dang=tin.ngay_dang,
    )
