from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models import BaoCao, NguoiDung, TinDang
from app.models.enums import TrangThaiBaoCao, TrangThaiTinDang
from app.schemas.bao_cao import BaoCaoCreateRequest

router = APIRouter(prefix="/bao-cao", tags=["bao-cao"])


@router.post("/{tin_dang_id}")
def gui_bao_cao(
    tin_dang_id: int,
    payload: BaoCaoCreateRequest,
    db: Session = Depends(get_db),
    nguoi_dung: NguoiDung = Depends(get_current_user),
):
    tin_dang = db.query(TinDang).filter(TinDang.id == tin_dang_id).first()
    if not tin_dang:
        raise HTTPException(status_code=404, detail="Tin đăng không tồn tại")
    
    if tin_dang.nguoi_dang_id == nguoi_dung.id:
        raise HTTPException(status_code=400, detail="Bạn không thể báo cáo tin đăng của chính mình")
        
    if tin_dang.trang_thai != TrangThaiTinDang.DA_DUYET:
        raise HTTPException(status_code=400, detail="Không thể báo cáo tin đăng này do trạng thái không hợp lệ")

    # Anti-spam: chỉ chặn khi báo cáo trước của người này VẪN đang chờ xử lý.
    # Báo cáo đã được admin xử lý xong (DA_XU_LY/TU_CHOI) thì cho báo cáo lại ngay, không giới hạn thời gian.
    bao_cao_gan_nhat = (
        db.query(BaoCao)
        .filter(BaoCao.tin_dang_id == tin_dang_id, BaoCao.nguoi_bao_cao_id == nguoi_dung.id)
        .order_by(BaoCao.ngay_bao_cao.desc())
        .first()
    )

    if bao_cao_gan_nhat and bao_cao_gan_nhat.trang_thai == TrangThaiBaoCao.CHO_XU_LY:
        raise HTTPException(
            status_code=400,
            detail="Bạn đã gửi báo cáo cho tin đăng này và đang chờ quản trị viên xử lý."
        )

    bao_cao_moi = BaoCao(
        tin_dang_id=tin_dang_id,
        nguoi_bao_cao_id=nguoi_dung.id,
        ly_do=payload.ly_do,
        mo_ta=payload.mo_ta,
        trang_thai=TrangThaiBaoCao.CHO_XU_LY,
        ngay_bao_cao=datetime.now(timezone.utc),
    )
    
    db.add(bao_cao_moi)
    db.commit()
    
    return {"message": "Gửi báo cáo thành công", "baoCaoId": bao_cao_moi.id}
