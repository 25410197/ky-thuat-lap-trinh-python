# Kịch bản họp nhóm — Rà tính năng & chốt việc còn lại (UrbanLease)

> Dùng để chủ trì buổi họp chia sẻ lại toàn bộ tính năng BE + FE hiện có cho nhóm, đối chiếu với
> bảng tiêu chí thầy giao, và chốt việc còn lại + người phụ trách trước khi nộp. Thời lượng đề
> xuất: **45–60 phút**. Team lead trình bày, các thành viên theo dõi trên máy mình (`git pull` +
> chạy stack trước buổi họp).

## Chuẩn bị trước buổi họp

- [ ] Cả nhóm `git pull` nhánh `main` mới nhất trước giờ họp.
- [ ] Team lead chạy sẵn stack (`start-be.bat` + `npm run dev`, hoặc `docker compose -f infra/compose.yaml up -d --build`) để demo trực tiếp thay vì chỉ nói chay.
- [ ] Mở sẵn 3 file làm tài liệu tham chiếu, chia sẻ màn hình lần lượt:
  - `docs/ke-hoach-nop-do-an.md` — bảng 6 tiêu chí + trạng thái
  - `outputs/kich-ban-demo.md` — kịch bản demo 10 phút (dùng để đi nhanh qua tính năng)
  - `docs/ke-hoach-hoan-thien.md` — các lỗi đã fix / còn tồn

---

## Agenda (45–60 phút)

| # | Thời lượng | Nội dung |
|---|---|---|
| 1 | 5' | Mở đầu — mục tiêu buổi họp, nhắc bảng tiêu chí thầy giao |
| 2 | 20' | Đi nhanh qua tính năng hiện có (BE + FE), demo trực tiếp |
| 3 | 15' | Rà từng tiêu chí trong bảng chấm — cái nào xong, cái nào còn thiếu |
| 4 | 10' | Phân công việc còn lại + deadline |
| 5 | 5' | Chốt lịch quay demo / thời điểm nộp |

---

## 1) Mở đầu — 5'

Nhắc lại đúng bảng tiêu chí thầy giao để cả nhóm cùng nhìn một chuẩn:

| Tiêu chí | Yêu cầu |
|---|---|
| Source code / Input-Dataset | — |
| Report (docx) | Dưới 20 trang |
| Khai báo sử dụng AI | prompt, md, skill |
| Slide | 10 trang |
| Demo | Trực tiếp hoặc video |
| Git | Lịch sử commit |

Mục tiêu buổi họp: cả nhóm nắm được **hệ thống hiện làm được gì** (vì nhiều bạn chỉ code phần
mình phụ trách, chưa xem tổng thể) và **còn thiếu gì trước khi nộp**.

---

## 2) Đi nhanh qua tính năng hiện có — 20'

Đi theo đúng 3 nhóm người dùng + phần điểm cộng, demo trực tiếp trên trình duyệt (tận dụng luôn
outline trong `outputs/kich-ban-demo.md`, không cần nói y nguyên lời thoại — mục đích ở đây là cho
nhóm xem, không phải quay video):

**a. Khách chưa đăng nhập**
- Trang chủ — danh sách tin đăng mới nhất đã duyệt
- Tìm kiếm theo tên/địa chỉ + lọc theo tỉnh/quận, khoảng giá, diện tích, loại hình
- Trang chi tiết tin đăng

**b. Người dùng đã đăng nhập**
- Đăng tin mới (upload ảnh lưu MinIO)
- Quản lý tin của mình: sửa / ẩn / xóa (`features/rental-posts`)
- Tin yêu thích (`features/favorites`)
- Cài đặt tài khoản: sửa hồ sơ, đổi mật khẩu

**c. Quản trị viên** (`app/quan-tri/*`)
- Duyệt / khóa tin đăng, xử lý tin bị báo cáo (`bao_cao.py`)
- Quản lý người dùng: khóa/mở khóa tài khoản (`nguoi_dung.py`)
- Quản lý danh mục loại bất động sản (`danh_muc.py`)
- Trang Tổng quan — **đã nối API thật** `GET /api/thong-ke/tong-quan` (không còn số liệu giả)

**d. Điểm cộng**
- Dashboard phân tích giá thuê: TB theo khu vực/loại nhà, giá/m², phân bố giá (`thong_ke.py`,
  `features/reports`)
- Module Tin tức thị trường: admin soạn bài rich-text (`bai_viet.py`), trang công khai
  `/thong-tin-thi-truong` ai cũng xem được

**Lưu ý khi trình bày:** nhấn mạnh quy ước dữ liệu xuyên suốt BE↔FE để thành viên mới/ít đụng phần
kia cũng hiểu — DB/enum lưu tiếng Việt, JSON trả ra ngoài là tiếng Anh camelCase (vd
`VaiTroNguoiDung.QUAN_TRI` ↔ `"admin"`); danh sách luôn phân trang `{items, total, page, pageSize}`.

---

## 3) Rà từng tiêu chí — 15'

Trạng thái cập nhật tới thời điểm họp (đối chiếu `docs/ke-hoach-nop-do-an.md` +
`docs/ke-hoach-hoan-thien.md`):

| Tiêu chí | Trạng thái | Còn thiếu |
|---|---|---|
| Source code / Dataset | ✅ Có repo + `be/app/scripts/seed.py` (~40 tin đăng mẫu) | Chốt hình thức nộp (link repo hay zip), kiểm tra `.env` thật không bị commit |
| Report (docx) | 🟡 Bản nháp xong (`outputs/BaoCao_UrbanLease.docx`, 18 trang) | Điền tên Khoa/Ngành/GV, phần đảm nhận từng người (Bảng 1.1), thay 4 chỗ placeholder ảnh chụp màn hình, update mục lục |
| Khai báo sử dụng AI | ⬜ Chưa làm | Liệt kê công cụ AI đã dùng, trích prompt tiêu biểu, nêu rõ phần người viết vs. AI hỗ trợ |
| Slide | ✅ Xong (`outputs/Slide_UrbanLease.pptx`, 10 trang) | Có thể thay icon bằng screenshot thật ở trang 7–9 nếu kịp |
| Demo | 🟡 Có kịch bản (`outputs/kich-ban-demo.md`, 10 phút) | Chuẩn bị dữ liệu/tài khoản theo checklist đầu file, quay từng đoạn rồi dựng |
| Git | ✅ 41 commit, nhiều nhánh feature đã merge | Kiểm tra `main` đã merge đủ tính năng mới nhất, push nốt nhánh còn dở |

**Việc kỹ thuật còn tồn (từ `ke-hoach-hoan-thien.md`, cần nói rõ để phân công ở mục 4):**
- Thiếu test cho 2 router lõi: `tin_dang.py` (CRUD/duyệt tin) và `nguoi_dung.py` (khóa/mở khóa
  user) — `be/tests/` hiện có 8 file nhưng chưa có 2 file này.
- Rà chính tả tiếng Việt toàn bộ UI + dữ liệu seed trước khi nộp (yêu cầu bắt buộc, trừ điểm nặng
  nếu sai).

---

## 4) Phân công việc còn lại — 10'

Điền trực tiếp khi họp:

| Việc | Tiêu chí liên quan | Người phụ trách | Hạn |
|---|---|---|---|
| Khai báo sử dụng AI (liệt kê tool + prompt tiêu biểu) | Khai báo AI | | |
| Hoàn thiện Report (điền thông tin bìa, phần đảm nhận, ảnh chụp màn hình) | Report | | |
| Viết `test_tin_dang.py`, `test_nguoi_dung.py` | Source code | | |
| Rà chính tả toàn bộ UI + dữ liệu seed | Report / Demo | | |
| Chuẩn bị tài khoản/dữ liệu demo theo checklist | Demo | | |
| Quay + dựng video demo | Demo | | |
| Kiểm tra `main` đã merge đủ, push nhánh còn dở | Git | | |
| Chốt hình thức nộp source code (link/zip), check `.env` | Source code | | |

---

## 5) Chốt lịch — 5'

- [ ] Deadline hoàn thiện Report + Khai báo AI: `<điền>`
- [ ] Ngày quay demo: `<điền>`
- [ ] Deadline nộp bài: `<điền>`
- [ ] Buổi họp chốt cuối cùng (review lần cuối trước khi nộp): `<điền>`
