# Yêu cầu triển khai — Trang chủ: bỏ dữ liệu giả, làm nổi bật hơn

> ✅ **Đã triển khai đầy đủ (phần bắt buộc) + dải số liệu tin cậy (mục 6, phần đầu).**
> Ghi chú triển khai thực tế ở cuối file.

## 1. Bài toán

Rà trực tiếp `http://localhost:3000/` bằng browser, phát hiện 2 vấn đề:

### 1.1. Khối "Bất động sản nổi bật" — dữ liệu viết cứng hoàn toàn giả

`HomeView.tsx` có mảng `FEATURED_POSTS` gồm 4 tin với `id: -1` đến `-4`, `anhDaiDien: null` —
đây là lý do 4 card trên trang chủ không có ảnh. Cùng loại lỗi đã ghi ở
`docs/ke-hoach-hoan-thien.md` (mục 3, phần `AdminOverviewView`): **dữ liệu demo/Figma chưa bao
giờ được nối API thật.**

Hậu quả cụ thể: bấm vào 1 trong 4 card này → điều hướng tới
`/chi-tiet-tin-dang/-1` → chờ vài giây → hiện **"Không tìm thấy tin đăng"** vì id âm không tồn
tại trong DB. Trang đầu tiên ai cũng thấy, dẫn thẳng tới ngõ cụt.

> `fe/src/features/home/components/HomeView.tsx:11-58`

### 1.2. Ảnh tin đăng thật — ngẫu nhiên, không liên quan tới bất động sản

Ở trang danh sách thật (`/danh-sach-nha-cho-thue`), ảnh có load (không phải lỗi kỹ thuật) nhưng
`be/app/scripts/seed.py` sinh ảnh bằng
`https://picsum.photos/seed/tin-dang-{id}-{thu_tu}/800/600` — dịch vụ ảnh ngẫu nhiên, seed chỉ
quyết định *giống nhau giữa các lần chạy*, không quyết định *chủ đề ảnh*. Kết quả: ảnh đại diện
tin đăng có thể là đàn guitar, xe cổ, quả mâm xôi, tàu thuyền... — không liên quan gì tới nhà cho
thuê, nhìn thiếu chuyên nghiệp khi demo. Ngoài ra ảnh phụ thuộc dịch vụ ngoài, tải chậm lần đầu và
**không có ảnh nếu demo lúc không có mạng**.

> `be/app/scripts/seed.py:369-371`

## 2. Phạm vi

**Trong phạm vi:**
- Trang chủ lấy tin đăng thật từ API thay vì mảng viết cứng.
- Thay nguồn ảnh seed bằng ảnh có chủ đề bất động sản, ổn định khi demo offline.

**Ngoài phạm vi (nhưng liệt kê ở mục 6 như gợi ý mở rộng, không bắt buộc):**
- Thêm section mới (trust bar số liệu, quick-filter loại hình...) — chỉ làm nếu bạn chốt muốn,
  không phải sửa lỗi nên tách riêng khỏi phần bắt buộc.

## 3. Cần quyết định trước khi code

| # | Câu hỏi | Đề xuất mặc định |
|---|---|---|
| 1 | "Nổi bật" lấy tin theo tiêu chí gì? Backend chưa có khái niệm `featured`. | Dùng **tin mới nhất đã duyệt** — đúng field `ngay_dang` mà `GET /api/rental-posts` đã sort sẵn (`order_by(TinDang.ngay_dang.desc())`), không cần thêm cột/logic "nổi bật" mới. Đổi tiêu đề khối thành "Tin đăng mới nhất" cho đúng bản chất, hoặc giữ "Bất động sản nổi bật" nếu muốn giữ nguyên văn án — không ảnh hưởng logic. |
| 2 | Nguồn ảnh seed thay bằng gì? | **Vẫn dùng picsum nhưng khóa vào tập ảnh nhà/nội thất** bằng cách chỉ định `id` cụ thể (picsum hỗ trợ `/id/{id}/800/600`) thay vì `/seed/{random}/...` — chọn tay ~20 id ảnh nhà/căn hộ/nội thất có thật trên picsum, seed random chọn trong tập này. Ít công hơn tự tải ảnh lên MinIO, vẫn cần mạng lúc seed (không cần mạng lúc demo vì ảnh đã seed sẵn vào DB dưới dạng URL — nhưng browser vẫn phải tải ảnh đó lúc xem, nên **vẫn cần mạng lúc demo trước hội đồng**). Nếu muốn hoàn toàn offline-safe, xem phương án B. |
| 2b | *(phương án B, kỹ hơn)* | Tự chuẩn bị ~15-20 ảnh nhà/phòng trọ/căn hộ thật (tải free stock 1 lần), upload qua thư viện ảnh có sẵn (`AnhThuVien`/MinIO) trong lúc seed thay vì gọi picsum — ảnh nằm trong MinIO nội bộ, không phụ thuộc mạng ngoài lúc demo. Tốn công chuẩn bị ảnh hơn nhưng an toàn nhất cho buổi bảo vệ. |

## 4. Nguồn dữ liệu thật cho mục 1.1 (không cần API mới)

`GET /api/rental-posts` (public, không cần đăng nhập) đã lọc đúng `trang_thai = da_duyet`,
không tính tin bị khóa/xóa, sort theo `ngay_dang` giảm dần, và trả `anhDaiDien` — đúng 100% những
gì trang chủ cần. FE cũng đã có sẵn hàm gọi:

```ts
// fe/src/features/rental-posts/api/rental-posts.api.ts — ĐÃ CÓ, chỉ cần gọi lại
rentalPostsApi.list({ page: 1, pageSize: 4 })
```

Không cần sửa backend, không cần thêm field `featured`/`badge` trong DB.

## 5. Frontend

### `HomeView.tsx` — đổi từ hằng số sang fetch thật

- Xóa mảng `FEATURED_POSTS` viết cứng.
- Chuyển `HomeView` sang lấy dữ liệu qua `useEffect` + `useState` (đúng pattern
  `RentalPostListView.tsx` đang dùng), gọi `rentalPostsApi.list({ page: 1, pageSize: 4 })`.
- Loading: hiện `Skeleton` (Mantine) ở 4 vị trí card trong lúc chờ — không để trống hoặc giật
  layout.
- Rỗng (DB chưa có tin đã duyệt nào): ẩn hẳn khối "Bất động sản nổi bật" thay vì hiện 4 card
  trống — tránh trang chủ trông vỡ khi mới cài đặt lần đầu (trước khi seed).
- `badge` ("Nổi bật"/"Mới") hiện đang gắn cứng theo từng phần tử giả — bỏ badge cố định, có thể
  giữ badge "Mới" cho tin có `ngayDang` trong vòng 7 ngày gần nhất (tính ở FE, không cần field
  DB mới), hoặc bỏ hẳn badge nếu muốn đơn giản nhất.
- `PropertyCard` không cần sửa gì — component này vốn đã nhận đúng shape `RentalPost` thật (field
  `anhDaiDien`, `giaThue`, `dienTich`...), 4 card giả trước đây cũng dùng chung shape đó, chỉ là
  dữ liệu nguồn sai.

### Seed (mục 1.2, theo phương án đã chọn ở mục 3.2)

**Phương án khóa id picsum (mặc định):** sửa `be/app/scripts/seed.py:369-371`, thay
`f"https://picsum.photos/seed/tin-dang-{tin_dang.id}-{thu_tu}/800/600"` bằng chọn ngẫu nhiên
1 id trong danh sách id ảnh nhà/nội thất đã chọn tay:

```python
PICSUM_ID_NHA_O = [1029, 1031, 1040, 106, 1067, ...]  # ~20 id ảnh nhà/nội thất/kiến trúc thật trên picsum
...
url = f"https://picsum.photos/id/{rng.choice(PICSUM_ID_NHA_O)}/800/600"
```

**Phương án MinIO (nếu chọn 2b):** thêm bước upload ~15-20 ảnh tĩnh (đặt trong
`be/app/scripts/assets/` hoặc tương tự) lên MinIO qua `get_minio_client()` lúc `seed.py` chạy,
`AnhThuVien.duong_dan_anh = build_public_url(...)` thay vì URL picsum.

## 6. Gợi ý mở rộng (không bắt buộc — chỉ làm nếu bạn chốt muốn "nổi bật" hơn nữa)

- **Dải số liệu tin cậy** ngay dưới hero: 3-4 con số thật lấy từ `GET /api/thong-ke/tong-quan`
  (vd "X tin đăng đang hoạt động", "Y tỉnh/thành") — dữ liệu đã có sẵn, không cần API mới, tương
  tự cách `docs/admin-tong-quan-yeu-cau.md` đề xuất tái dùng endpoint này.
- **Lối tắt theo loại hình** (phòng trọ/căn hộ/nhà nguyên căn) ngay dưới ô tìm kiếm — link thẳng
  tới `/danh-sach-nha-cho-thue?loai_bat_dong_san_id=...`, dùng `GET /loai-bat-dong-san` (đã có).

Không đưa 2 gợi ý này vào acceptance bắt buộc — tách riêng để không trộn "sửa lỗi" với "làm thêm".

## 7. Acceptance — hoàn thành khi

- [ ] Trang chủ không còn mảng dữ liệu viết cứng nào cho khối tin đăng.
- [ ] 4 card ở "Bất động sản nổi bật"/"Tin đăng mới nhất" hiển thị đúng tin thật đang có trong DB,
      khớp với 4 tin mới nhất ở `/danh-sach-nha-cho-thue`.
- [ ] Bấm vào bất kỳ card nào trên trang chủ → vào đúng trang chi tiết tin đó, không còn ai dẫn
      tới "Không tìm thấy tin đăng".
- [ ] Ảnh đại diện các tin đăng (trang chủ lẫn danh sách) đều là ảnh nhà/căn hộ/nội thất — không
      còn ảnh không liên quan (đàn guitar, xe cổ...).
- [ ] Chạy lại `python -m app.scripts.seed` nhiều lần vẫn ra ảnh chủ đề đúng (không lệ thuộc may
      rủi của random seed cũ).
- [ ] DB rỗng (chưa seed) → trang chủ không vỡ layout, khối tin đăng ẩn gọn gàng hoặc hiện
      `EmptyState`.

## 8. Checklist file cần tạo/sửa

- [ ] `fe/src/features/home/components/HomeView.tsx` — bỏ `FEATURED_POSTS`, fetch thật, thêm
      loading/empty state
- [ ] `be/app/scripts/seed.py` — đổi nguồn ảnh (mục 5, theo phương án đã chọn)
- [ ] *(nếu chọn phương án MinIO)* thêm thư mục ảnh mẫu tĩnh vào `be/app/scripts/assets/`
- [ ] *(nếu làm thêm mục 6)* `fe/src/features/home/api/home.api.ts` — gọi `thong-ke/tong-quan`
      và `loai-bat-dong-san`

## 9. Ghi chú triển khai thực tế (đã làm)

- **`HomeView.tsx`**: bỏ `FEATURED_POSTS`, gọi `rentalPostsApi.list({ page: 1, pageSize: 4 })` qua
  `useEffect`. Loading hiện 4 `Skeleton`. DB rỗng → ẩn hẳn khối tin đăng (không hiện tiêu đề lẫn
  grid). Đổi tiêu đề "Bất động sản nổi bật" → "Tin đăng mới nhất" (đúng bản chất — tin mới nhất đã
  duyệt). Badge "Mới" tính ở FE cho tin có `ngayDang` trong 7 ngày gần nhất. Không gọi API riêng
  cho `home.api.ts` — dùng thẳng `rentalPostsApi`/`thongKeApi` đã có sẵn.
- **Dải số liệu tin cậy** (mục 6, phần 1 — làm thêm): thêm block ngay dưới hero, gọi
  `thongKeApi.tongQuan()` (đã có, không thêm API mới), hiện 3 số: tổng tin đang hoạt động, số
  tỉnh/thành có tin, giá thuê trung bình. Ẩn hẳn nếu gọi API lỗi (không có Alert lỗi ở trang chủ để
  tránh vỡ trải nghiệm). **Không làm** phần "lối tắt theo loại hình" (mục 6, phần 2) — cần
  `RentalPostListView` đọc thêm query param từ URL (`useSearchParams`) mà trang danh sách hiện chưa
  hỗ trợ, nằm ngoài phạm vi sửa lỗi của ticket này; có thể làm riêng nếu cần.
- **Seed ảnh** (mục 1.2): chọn phương án khóa id picsum (mục 3, câu 2). Đã tự tải + xem trực tiếp
  ~113 ảnh picsum (id 0-449, xem bằng ảnh thật, không đoán) để chọn tay 23 id ảnh nhà/căn
  hộ/nội thất/kiến trúc/phố cổ có thật — xem `PICSUM_ID_NHA_O` ở đầu `be/app/scripts/seed.py`.
  `rng.choice(...)` chọn ngẫu nhiên trong tập này mỗi lần seed thay vì `/seed/{random}/...`.
- **Bug phát sinh khi test lại seed** (ngoài phạm vi gốc nhưng phải sửa để seed chạy được): xóa
  toàn bộ `AnhThuVien` trong `_xoa_du_lieu_cu()` làm vỡ khóa ngoại `bai_viet.anh_bia_id` nếu đã có
  bài viết tin tức dùng ảnh làm ảnh bìa (gặp khi test module Tin tức trước đó). Đã sửa: loại trừ
  ảnh đang được `bai_viet.anh_bia_id` tham chiếu khỏi lượt xóa.
- **Đã chạy thật**: `python -m app.scripts.seed` (2 lần liên tiếp, xác nhận ra ảnh đúng chủ đề, ảnh
  bìa bài viết cũ không bị mất), `pytest` (63/64 pass, 1 fail có từ trước không liên quan), `tsc
  --noEmit` (0 lỗi).
