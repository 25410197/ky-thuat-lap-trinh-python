from datetime import datetime, timezone

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import get_db, get_current_user, get_current_user_optional
from app.models import (
    AnhThuVien,
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
from app.models.enums import TrangThaiTinDang, PhuongThucLienHe, TrangThaiLoaiBatDongSan
from app.schemas.tin_dang import (
    AnhThuVienChonResponse,
    DanhSachTinDang,
    TinDangTomTat,
    TinDangCuaToiResponse,
    DangTinRequest,
    TinDangChiTiet,
    TinDangSuaResponse,
    DanhSachTinChoDuyet,
    TinChoDuyetTomTat,
)

router = APIRouter(prefix="/rental-posts", tags=["tin-dang"])

_TRANG_THAI_SANG_STATUS_EN = {
    TrangThaiTinDang.CHO_DUYET: "pending",
    TrangThaiTinDang.DA_DUYET: "published",
    TrangThaiTinDang.AN: "archived",
    TrangThaiTinDang.TU_CHOI: "rejected",
}


def _trang_thai_sang_status_en(tin: TinDang) -> str:
    if tin.is_deleted:
        return "deleted"
    if tin.is_blocked:
        return "blocked"
    return _TRANG_THAI_SANG_STATUS_EN.get(tin.trang_thai, "pending")


def _kiem_tra_chu_tin(tin: TinDang, nguoi_dung: NguoiDung) -> None:
    if tin.nguoi_dang_id != nguoi_dung.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền chỉnh sửa tin đăng này.",
        )


def _lay_loai_bat_dong_san_hop_le(
    db: Session, ten: str, loai_hien_tai_id: int | None = None
) -> LoaiBatDongSan:
    """Chỉ admin được thêm loại bất động sản (xem `danh_muc.py`) — người đăng tin chỉ được CHỌN
    trong các loại đã có, không được tự tạo loại mới. Loại đang bị ẩn chỉ chấp nhận nếu đó vẫn là
    loại đã lưu sẵn của chính tin đăng (giữ nguyên khi sửa tin), không cho chọn mới."""
    loai_bds = db.query(LoaiBatDongSan).filter(LoaiBatDongSan.ten == ten).first()
    if loai_bds is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Loại bất động sản không tồn tại.",
        )

    la_dang_dung_lai = loai_hien_tai_id is not None and loai_bds.id == loai_hien_tai_id
    if loai_bds.trang_thai != TrangThaiLoaiBatDongSan.HOAT_DONG and not la_dang_dung_lai:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Loại bất động sản này đã bị ẩn, vui lòng chọn loại khác.",
        )
    return loai_bds


def _tao_hinh_anh_tu_thu_vien(
    db: Session, tin_dang_id: int, nguoi_dung: NguoiDung, anh_chinh_id: int, anh_phu_id: list[int]
) -> None:
    """Kiểm tra các ID ảnh có thuộc thư viện của người dùng không, rồi tạo dòng nối HinhAnhTinDang."""
    tat_ca_id = [anh_chinh_id, *anh_phu_id]
    anh_theo_id = {
        anh.id: anh
        for anh in db.query(AnhThuVien)
        .filter(AnhThuVien.id.in_(tat_ca_id), AnhThuVien.nguoi_dung_id == nguoi_dung.id)
        .all()
    }
    thieu = [id_ for id_ in tat_ca_id if id_ not in anh_theo_id]
    if thieu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy ảnh trong thư viện của bạn.",
        )

    db.add(
        HinhAnhTinDang(
            tin_dang_id=tin_dang_id,
            anh_thu_vien_id=anh_chinh_id,
            thu_tu_hien_thi=0,
            la_anh_dai_dien=True,
        )
    )
    for i, anh_id in enumerate(anh_phu_id, start=1):
        db.add(
            HinhAnhTinDang(
                tin_dang_id=tin_dang_id,
                anh_thu_vien_id=anh_id,
                thu_tu_hien_thi=i,
                la_anh_dai_dien=False,
            )
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
    dieu_kien = [TinDang.trang_thai == TrangThaiTinDang.DA_DUYET, TinDang.is_blocked == False, TinDang.is_deleted == False]

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
            joinedload(TinDang.hinh_anh).joinedload(HinhAnhTinDang.anh_thu_vien),
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
                (anh.anh_thu_vien.duong_dan_anh for anh in tin.hinh_anh if anh.la_anh_dai_dien),
                tin.hinh_anh[0].anh_thu_vien.duong_dan_anh if tin.hinh_anh else None,
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
    # Lấy tất cả tin do người dùng này đăng — trừ tin đã xóa mềm (chỉ giữ trong DB cho thống kê,
    # không hiện lại ở đây).
    rows = (
        db.query(TinDang)
        .options(
            joinedload(TinDang.phuong_xa)
            .joinedload(PhuongXa.quan_huyen)
            .joinedload(QuanHuyen.tinh_thanh),
            joinedload(TinDang.hinh_anh).joinedload(HinhAnhTinDang.anh_thu_vien),
        )
        .filter(TinDang.nguoi_dang_id == nguoi_dung.id, TinDang.is_deleted == False)
        .order_by(TinDang.ngay_dang.desc())
        .all()
    )

    ket_qua = []
    for tin in rows:
        status_en = _trang_thai_sang_status_en(tin)

        anh_dai_dien = next(
            (anh.anh_thu_vien.duong_dan_anh for anh in tin.hinh_anh if anh.la_anh_dai_dien), None
        )
        if not anh_dai_dien and tin.hinh_anh:
            anh_dai_dien = tin.hinh_anh[0].anh_thu_vien.duong_dan_anh

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
    loai_bds = _lay_loai_bat_dong_san_hop_le(db, du_lieu.propertyType)

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
        trang_thai=TrangThaiTinDang.CHO_DUYET,
        is_blocked=False,
        is_deleted = False
    )
    db.add(tin_moi)
    db.flush()

    _tao_hinh_anh_tu_thu_vien(db, tin_moi.id, nguoi_dung, du_lieu.anhChinhId, du_lieu.anhPhuId)

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
            joinedload(TinDang.hinh_anh).joinedload(HinhAnhTinDang.anh_thu_vien),
            joinedload(TinDang.tien_ich),
        )
        .filter(TinDang.id == tin_dang_id)
        .first()
    )
    if tin is None or tin.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng.")
    _kiem_tra_chu_tin(tin, nguoi_dung)

    anh_sap_xep = sorted(tin.hinh_anh, key=lambda anh: (not anh.la_anh_dai_dien, anh.thu_tu_hien_thi))
    anh_chinh_row = next((anh for anh in anh_sap_xep if anh.la_anh_dai_dien), None) or (
        anh_sap_xep[0] if anh_sap_xep else None
    )
    anh_chinh = AnhThuVienChonResponse(id=anh_chinh_row.anh_thu_vien_id, url=anh_chinh_row.anh_thu_vien.duong_dan_anh)
    anh_phu = [
        AnhThuVienChonResponse(id=anh.anh_thu_vien_id, url=anh.anh_thu_vien.duong_dan_anh)
        for anh in anh_sap_xep
        if not anh.la_anh_dai_dien
    ]

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
        status=_trang_thai_sang_status_en(tin),
    )


@router.put("/{tin_dang_id}")
def cap_nhat_tin_dang(
    tin_dang_id: int,
    du_lieu: DangTinRequest,
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
):
    tin = db.get(TinDang, tin_dang_id)
    if tin is None or tin.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng.")
    _kiem_tra_chu_tin(tin, nguoi_dung)

    loai_bds = _lay_loai_bat_dong_san_hop_le(
        db, du_lieu.propertyType, loai_hien_tai_id=tin.loai_bat_dong_san_id
    )

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
    _tao_hinh_anh_tu_thu_vien(db, tin.id, nguoi_dung, du_lieu.anhChinhId, du_lieu.anhPhuId)

    db.commit()

    return {"message": "Cập nhật tin đăng thành công!", "id": tin.id}



@router.delete("/{tin_dang_id}", status_code=200)
def xoa_tin_dang(
    tin_dang_id: int,
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
):
    tin = db.get(TinDang, tin_dang_id)
    if tin is None or tin.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng.")
    _kiem_tra_chu_tin(tin, nguoi_dung)

    # Xóa mềm: chỉ đánh dấu is_deleted/deleted_at, không xóa khỏi database và không đổi trang_thai
    # (giữ nguyên trạng thái duyệt gốc) — giữ nguyên dữ liệu cho báo cáo/thống kê sau này.
    tin.is_deleted = True
    tin.deleted_at = datetime.now(timezone.utc)
    db.commit()

    return {"message": "Xóa tin đăng thành công!"}


@router.get("/cho-duyet", response_model=DanhSachTinChoDuyet)
def danh_sach_tin_dang_cho_duyet(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)) -> DanhSachTinChoDuyet:

    filter = (TinDang.trang_thai == TrangThaiTinDang.CHO_DUYET)
    total = db.query(func.count(TinDang.id)).filter(filter).scalar() or 0

    rows = (
        db.query(TinDang)
        .options(
            joinedload(TinDang.nguoi_dang),
            joinedload(TinDang.loai_bat_dong_san),
            joinedload(TinDang.hinh_anh).joinedload(HinhAnhTinDang.anh_thu_vien),
        )
        .filter(filter)
        .order_by(TinDang.ngay_dang)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = [
        TinChoDuyetTomTat(
            id=tin.id,
            tieu_de=tin.tieu_de,
            loai_bat_dong_san=tin.loai_bat_dong_san.ten,
            hinh_anh=[
                anh.anh_thu_vien.duong_dan_anh
                for anh in sorted(tin.hinh_anh, key=lambda a: (not a.la_anh_dai_dien, a.thu_tu_hien_thi))
                if anh.anh_thu_vien
            ],
            ngay_dang=tin.ngay_dang,
            trang_thai=tin.trang_thai.value,
            nguoi_dang=tin.nguoi_dang.ho_ten,
        )
        for tin in rows
    ]

    return DanhSachTinChoDuyet(items=items, total=total, page=page, page_size=page_size)

@router.get("/chi-tiet-tin-duyet/{tin_dang_id}", response_model=TinDangChiTiet, status_code=200)
def chi_tiet_tin_dang_cho_duyet(
    tin_dang_id: int,
    db: Session = Depends(get_db)
) -> TinDangChiTiet:    
    tin = (
        db.query(TinDang)
        .options(
            joinedload(TinDang.loai_bat_dong_san),
            joinedload(TinDang.phuong_xa)
            .joinedload(PhuongXa.quan_huyen)
            .joinedload(QuanHuyen.tinh_thanh),
            joinedload(TinDang.hinh_anh).joinedload(HinhAnhTinDang.anh_thu_vien),
            joinedload(TinDang.tien_ich)
        )
        .filter(TinDang.id == tin_dang_id)
        .first()
    )
    if tin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng.")
    if tin.trang_thai != TrangThaiTinDang.CHO_DUYET:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tin đăng không ở trạng thái chờ duyệt.",
        )

    anh_sap_xep = sorted(tin.hinh_anh, key=lambda a: (not a.la_anh_dai_dien, a.thu_tu_hien_thi))
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
        hinh_anh=[anh.anh_thu_vien.duong_dan_anh for anh in anh_sap_xep if anh.anh_thu_vien],
        tien_ich=[tien_ich.ten for tien_ich in tin.tien_ich],
        ten_nguoi_lien_he=tin.ten_nguoi_lien_he,
        so_dien_thoai_lien_he=tin.so_dien_thoai_lien_he,
        phuong_thuc_lien_he_uu_tien=tin.phuong_thuc_lien_he_uu_tien.value,
        luot_xem=tin.luot_xem,
        ngay_dang=tin.ngay_dang,
        is_blocked=tin.is_blocked,
        nguoi_dang_id=tin.nguoi_dang_id,
    )

@router.get("/tin-bi-khoa", response_model=DanhSachTinChoDuyet)
def danh_sach_tin_bi_khoa(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)) -> DanhSachTinChoDuyet:

    filter = (TinDang.is_blocked == True) & (TinDang.is_deleted == False)
    total = db.query(func.count(TinDang.id)).filter(filter).scalar() or 0

    rows = (
        db.query(TinDang)
        .options(
            joinedload(TinDang.nguoi_dang),
            joinedload(TinDang.loai_bat_dong_san),
            joinedload(TinDang.hinh_anh).joinedload(HinhAnhTinDang.anh_thu_vien),
        )
        .filter(filter)
        .order_by(TinDang.ngay_dang)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = [
        TinChoDuyetTomTat(
            id=tin.id,
            tieu_de=tin.tieu_de,
            loai_bat_dong_san=tin.loai_bat_dong_san.ten,
            hinh_anh=[
                anh.anh_thu_vien.duong_dan_anh
                for anh in sorted(tin.hinh_anh, key=lambda a: (not a.la_anh_dai_dien, a.thu_tu_hien_thi))
                if anh.anh_thu_vien
            ],
            ngay_dang=tin.ngay_dang,
            trang_thai=tin.trang_thai.value,
            nguoi_dang=tin.nguoi_dang.ho_ten,
        )
        for tin in rows
    ]

    return DanhSachTinChoDuyet(items=items, total=total, page=page, page_size=page_size)

@router.post("/mo-khoa-tin/{tin_dang_id}", status_code=200)
def mo_khoa_tin(
    tin_dang_id: int,
    db: Session = Depends(get_db)
):
    tin = db.get(TinDang, tin_dang_id)
    if tin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng.")
    
    if not tin.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tin đăng không ở trạng thái bị khóa.",
        )
    tin.is_blocked = False
    tin.ly_do_khoa = None
    db.commit()
    return {"message": "Mở khóa tin đăng thành công!"}

@router.post("/duyet-tin-dang/{tin_dang_id}", status_code=200)
def duyet_tin_dang(
    tin_dang_id: int,
    db: Session = Depends(get_db)
):
    tin = db.get(TinDang, tin_dang_id)
    if tin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng.")
    
    if tin.trang_thai != TrangThaiTinDang.CHO_DUYET:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tin đăng không ở trạng thái chờ duyệt.",
        )

    tin.trang_thai = TrangThaiTinDang.DA_DUYET
    db.commit()
    return {"message": "Duyệt tin đăng thành công!"}

@router.post("/tu-choi-tin-dang/{tin_dang_id}", status_code=200)
def tu_choi_tin_dang(
    tin_dang_id: int,
    db: Session = Depends(get_db),
    ly_do: str | None = Query(None)
):
    tin = db.get(TinDang, tin_dang_id)
    if tin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng.")
    
    if tin.trang_thai != TrangThaiTinDang.CHO_DUYET:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tin đăng không ở trạng thái chờ duyệt.",
        )

    tin.trang_thai = TrangThaiTinDang.TU_CHOI
    tin.ly_do_khoa = ly_do
    db.commit()
    return {"message": "Từ chối tin đăng thành công!"}

@router.post("/khoa-tin-dang/{tin_dang_id}", status_code=200)
def khoa_tin_dang(
    tin_dang_id: int,
    db: Session = Depends(get_db),
    ly_do: str = Body(..., embed=True)
):
    tin = db.get(TinDang, tin_dang_id)
    if tin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng.")
    tin.is_blocked = True
    tin.ly_do_khoa = ly_do
    db.commit()
    return {"message": "Khoá tin đăng thành công!"}

@router.get("/{tin_dang_id}", response_model=TinDangChiTiet)
def chi_tiet_tin_dang(
    tin_dang_id: int, 
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung | None = Depends(get_current_user_optional)
) -> TinDangChiTiet:
    tin = (
        db.query(TinDang)
        .options(
            joinedload(TinDang.loai_bat_dong_san),
            joinedload(TinDang.phuong_xa)
            .joinedload(PhuongXa.quan_huyen)
            .joinedload(QuanHuyen.tinh_thanh),
            joinedload(TinDang.hinh_anh).joinedload(HinhAnhTinDang.anh_thu_vien),
            joinedload(TinDang.tien_ich),
        )
        .filter(TinDang.id == tin_dang_id)
        .first()
    )
    if tin is None or tin.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng")

    # Tin bị khóa hoặc chưa/không còn công khai (chờ duyệt, bị từ chối, đã ẩn) chỉ chủ tin/admin xem được —
    # tránh lộ nội dung cho thành viên khác hoặc khách vãng lai truy cập thẳng bằng ID.
    if tin.is_blocked or tin.trang_thai != TrangThaiTinDang.DA_DUYET:
        from app.models.enums import VaiTroNguoiDung

        la_chu_tin = nguoi_dung is not None and tin.nguoi_dang_id == nguoi_dung.id
        la_admin = nguoi_dung is not None and nguoi_dung.vai_tro == VaiTroNguoiDung.QUAN_TRI

        if not (la_chu_tin or la_admin):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin đăng")

    tin.luot_xem += 1
    db.commit()

    anh_sap_xep = sorted(tin.hinh_anh, key=lambda anh: (not anh.la_anh_dai_dien, anh.thu_tu_hien_thi))

    # Ẩn sđt nếu chưa đăng nhập
    sdt = tin.so_dien_thoai_lien_he
    if sdt and nguoi_dung is None:
        sdt = sdt[:3] + "***" + sdt[-2:] if len(sdt) >= 5 else "***"

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
        hinh_anh=[anh.anh_thu_vien.duong_dan_anh for anh in anh_sap_xep],
        tien_ich=[tien_ich.ten for tien_ich in tin.tien_ich],
        ten_nguoi_lien_he=tin.ten_nguoi_lien_he,
        so_dien_thoai_lien_he=sdt or "",
        phuong_thuc_lien_he_uu_tien=tin.phuong_thuc_lien_he_uu_tien.value,
        luot_xem=tin.luot_xem,
        ngay_dang=tin.ngay_dang,
        is_blocked=tin.is_blocked,
        nguoi_dang_id=tin.nguoi_dang_id
    )
