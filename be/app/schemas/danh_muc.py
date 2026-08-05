from pydantic import BaseModel


class LoaiBatDongSanTomTat(BaseModel):
    id: int
    ten: str


class TinhThanhTomTat(BaseModel):
    id: int
    ten: str


class QuanHuyenTomTat(BaseModel):
    id: int
    ten: str
