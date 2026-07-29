import enum


class VaiTroNguoiDung(str, enum.Enum):
    NGUOI_DUNG = "nguoi_dung"
    QUAN_TRI = "quan_tri"


class TrangThaiNguoiDung(str, enum.Enum):
    CHO_XAC_MINH = "cho_xac_minh"
    HOAT_DONG = "hoat_dong"
    BI_KHOA = "bi_khoa"


class TrangThaiTinDang(str, enum.Enum):
    CHO_DUYET = "cho_duyet"
    DA_DUYET = "da_duyet"
    BI_KHOA = "bi_khoa"
    AN = "an"
    DA_XOA = "da_xoa"


class PhuongThucLienHe(str, enum.Enum):
    GOI_DIEN = "goi_dien"
    NHAN_TIN = "nhan_tin"


class TrangThaiBaoCao(str, enum.Enum):
    CHO_XU_LY = "cho_xu_ly"
    DA_XU_LY = "da_xu_ly"
