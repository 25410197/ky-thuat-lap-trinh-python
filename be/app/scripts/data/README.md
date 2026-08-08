# Nguồn dữ liệu hành chính (tỉnh/huyện/xã)

Dữ liệu trong 3 file JSON ở thư mục này được lấy từ **Provinces Open API**:
https://provinces.open-api.vn/ (dự án mở, cộng đồng duy trì — không phải nguồn chính thức
của Tổng cục Thống kê, nhưng tổng hợp từ dữ liệu hành chính công khai).

Lấy dữ liệu ngày: 2026-08-08. Chỉ lấy cho 3 tỉnh/thành: **Hà Nội** (code 1), **Đà Nẵng**
(code 48), **TP. Hồ Chí Minh** (code 79) — đúng phạm vi seed hiện có của dự án.

## File và endpoint tương ứng

- `dia_chinh_cu.json` — cấu trúc **trước sáp nhập 07/2025** (3 cấp: tỉnh → quận/huyện → phường/xã).
  Lấy từ `GET https://provinces.open-api.vn/api/v1/p/{code}?depth=3` cho từng tỉnh (1, 48, 79).

- `dia_chinh_moi.json` — cấu trúc **sau sáp nhập 07/2025** (2 cấp: tỉnh → xã/phường, không còn
  quận/huyện). Lấy từ `GET https://provinces.open-api.vn/api/v2/p/{code}?depth=2`.
  Lưu ý: ở mode này, TP.HCM/Đà Nẵng đã gộp thêm địa giới các tỉnh khác (vd. TP.HCM gộp thêm
  Bình Dương, Bà Rịa – Vũng Tàu) nên số xã/phường lớn hơn nhiều so với 3 tỉnh cũ.

- `anh_xa_cu_moi.json` — bảng ánh xạ N-N giữa phường/xã cũ và xã/phường mới, lấy từ
  `GET https://provinces.open-api.vn/api/v2/w/{ma_xa_moi}/to-legacies/` gọi cho từng
  xã/phường mới (388 lượt gọi). Là quan hệ N-N thật sự: dữ liệu cho thấy một số phường/xã
  cũ được ghi nhận thuộc về nhiều hơn 1 xã/phường mới (ví dụ do lịch sử tách/nhập nhiều đợt),
  nên không ép về quan hệ 1-N.

## Giới hạn đã biết

- Đây là dữ liệu cộng đồng tổng hợp (không phải văn bản pháp lý gốc), có thể có sai lệch nhỏ
  so với Nghị quyết sáp nhập chính thức.
- 7 phường/xã cũ (đều thuộc TP.HCM cũ: Bình Thạnh P.14, Bình Thạnh P.19, Phú Nhuận P.15,
  Quận 11 P.10, Quận 11 P.11, Quận 6 P.1, Quận 6 P.2) không tìm được ánh xạ sang xã/phường
  mới trong dữ liệu nguồn — các phường này sẽ không xuất hiện khi lọc theo mode mới.
