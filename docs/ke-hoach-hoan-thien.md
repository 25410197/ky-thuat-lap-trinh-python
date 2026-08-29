# UrbanLease — Đánh giá hệ thống & Kế hoạch hoàn thiện

> Đồ án cuối kỳ — rà toàn bộ backend FastAPI + frontend Next.js so với đề bài gốc, tìm phần đang
> mock/gãy, và lên kế hoạch thêm module Bài viết (CMS + trình soạn thảo) để nâng chất lượng đồ án.

- **Ngày:** 29/08/2026
- **Nhánh lúc scan:** thong-ke-tong-quan
- **Phạm vi:** `be/app`, `fe/src`, `docs/yêu cầu.md`

---

## 1. Tổng quan & kết luận

**Phần lõi theo đề bài đã xong.** Toàn bộ chức năng bắt buộc trong `docs/yêu cầu.md` — tìm/lọc
tin, đăng/sửa/ẩn/xóa tin, yêu thích, và cụm quản trị (duyệt tin, khóa user, loại BĐS, báo cáo,
thống kê) — đều đã có route BE lẫn màn FE tương ứng. Phần "phân tích giá" (bonus) cũng đã làm khá
đầy đủ dưới dạng dashboard thống kê.

Vấn đề nằm ở 4 chỗ cụ thể: hai đường link menu 404, một trang tổng quan admin toàn số liệu giả,
và thiếu test cho 2 router lõi nhất.

| | |
|---|---|
| **8/8** nhóm chức năng đề bài | đã làm |
| **3** đường link menu | dẫn tới trang không tồn tại |
| **1** màn hình admin | 100% dữ liệu giả lập |
| **0** test | cho router `tin_dang.py` / `nguoi_dung.py` |

---

## 2. Đối chiếu với đề bài gốc

Bám sát `docs/yêu cầu.md` — liệt kê đúng những gạch đầu dòng thầy giao, xem đã có ở đâu trong code.

| Yêu cầu | Hiện trạng (file/route) | Trạng thái |
|---|---|---|
| Khách chưa đăng nhập: xem danh sách, tìm kiếm, lọc tỉnh/quận · giá · diện tích · loại hình, xem chi tiết | `danh-sach-nha-cho-thue`, `chi-tiet-tin-dang/[id]` | ✅ Đủ |
| User đăng nhập: đăng / sửa / ẩn / xóa tin, quản lý tin của mình, lưu yêu thích, xem liên hệ người đăng | `features/rental-posts`, `features/favorites` | ✅ Đủ |
| Admin: quản lý người dùng, duyệt/khóa tin, quản lý loại BĐS, thống kê số lượng tin, xử lý báo cáo | `app/quan-tri/*` (5 route con) | ✅ Đủ |
| Bonus — dashboard phân tích giá: TB theo khu vực/loại nhà, giá/m², phân bố giá, khu vực nhiều tin nhất, so sánh quận | `be/api/routes/thong_ke.py`, `features/reports` | ✅ Đủ — nhưng chỉ admin thấy được |

Dòng cuối là điểm đáng chú ý: đề bài không nói rõ dashboard này dành cho ai, nhưng ảnh mockup gốc
(`docs/hình ảnh/Phân tích thị trường - Tiếng Việt.png`) vẽ nó như một trang **công khai** tên
"Thông tin thị trường" trên thanh nav — đúng cái đang bị gãy ở mục kế tiếp.

---

## 3. Chỗ đang mock / gãy

4 phát hiện cụ thể, đã xác minh trong code — không suy đoán.

### 🔴 "Thông tin thị trường" trên menu → 404

Đây đúng là ví dụ bạn nêu. `Header.tsx:15` trỏ tới `/thong-tin-thi-truong`, nhưng không có
`page.tsx` nào ở route đó, và `constants/routes.ts` cũng không khai báo path này. Dashboard phân
tích giá thật sự đang nằm ở `/quan-tri/thong-ke` — chỉ admin vào được. Người dùng thường bấm vào
là ăn trang trắng/404.

> `fe/src/components/layout/Header.tsx:15` · `fe/src/constants/routes.ts`

### 🔴 "Trợ giúp" và "Cài đặt" (admin) cũng 404

Cùng kiểu lỗi: `Header.tsx:16` trỏ `/tro-giup`, `AdminLayout.tsx:85` trỏ `/quan-tri/cai-dat` — cả
hai đều không có trang thật. Ít nghiêm trọng hơn mục trên vì không nằm trong yêu cầu đề bài, nhưng
vẫn là link chết hiển thị công khai, dễ bị giảng viên bấm trúng khi chấm.

> `fe/src/components/layout/Header.tsx:16` · `fe/src/components/layout/AdminLayout.tsx:85`

### 🟡 Trang "Tổng quan" của admin (`/quan-tri`) — 100% số liệu giả

Đây là trang đầu tiên admin thấy sau khi đăng nhập. Toàn bộ 3 thẻ số liệu, khối "Tình trạng hệ
thống 99.8%", và 2 dòng cảnh báo hệ thống đều là hằng số viết cứng trong component — comment
trong code còn ghi thẳng: *"Số liệu lấy đúng từ Figma... sẽ nối API thống kê thật ở ticket sau."*
Vé đó chưa bao giờ được làm.

Đáng tiếc là API thật **đã có sẵn** — `GET /api/thong-ke/tong-quan` trả đủ tổng số tin, tin đã
duyệt, giá thuê TB, giá/m² TB. Chỉ thiếu 2 con số để khớp đủ 3 thẻ: tổng người dùng (lấy từ
`total` của list user) và số báo cáo đang chờ xử lý (lấy từ `total` của list báo cáo, lọc trạng
thái). Khối "Tình trạng hệ thống" và cảnh báo API latency là dữ liệu demo kiểu SaaS mẫu, không có
ý nghĩa thật trong đồ án — nên bỏ hẳn thay vì cố làm giả cho thật.

> `fe/src/features/analytics/components/AdminOverviewView.tsx:6-27` · `be/app/api/routes/thong_ke.py:35`

### 🟡 Thiếu test cho 2 router lõi nhất

`be/tests/` có 7 file, phủ auth, báo cáo, danh mục loại BĐS, thống kê, thư viện ảnh, tin yêu
thích — nhưng **không có** `test_tin_dang.py` (CRUD/duyệt tin đăng — đối tượng trung tâm của cả
hệ thống) lẫn `test_nguoi_dung.py` (khóa/mở khóa user). Với đồ án cuối kỳ, giảng viên thường soi
coverage của đúng phần lõi này đầu tiên.

> `be/tests/` (7 file, 1544 dòng) — thiếu tin_dang, nguoi_dung

---

## 4. Tính năng mới — Bài viết thị trường

Đúng yêu cầu bạn nêu: admin soạn bài (trình soạn thảo rich-text kiểu Quill), người dùng xem danh
sách + chi tiết. Đề xuất dùng module này để lấp luôn route `/thong-tin-thi-truong` đang gãy —
biến trang thống kê hiện có (admin-only) + bài viết mới thành một khu vực **công khai** "Thông
tin thị trường" hoàn chỉnh, thay vì hai mảnh rời rạc.

> **Một điểm cần bạn quyết trước khi code:** stack hiện tại là React 19 + Mantine 9. Thư viện
> Quill gốc (`react-quill`) dùng `findDOMNode` — đã bị gỡ khỏi React 19, nên sẽ lỗi runtime. Có 2
> lối: dùng fork cộng đồng `react-quill-new` (giữ đúng giao diện/API Quill, đã vá cho React 19),
> hoặc chuyển sang `@mantine/tiptap` + `@tiptap/react` (đồng bộ theme Mantine sẵn có, không cần
> CSS override). Nếu không bắt buộc phải là Quill, khuyên dùng phương án Tiptap vì khớp design
> system sẵn của dự án (`components/ui/`).

### Kiến trúc đề xuất — theo đúng pattern `loai_bat_dong_san` đã có sẵn trong repo

**Backend**
- Model `BaiViet`: id, tieu_de, slug, noi_dung_html, anh_bia, trang_thai (nháp/đã đăng), luot_xem, id_nguoi_tao, created_at
- Migration alembic mới trong `alembic/versions/`
- Router `bai_viet.py`: admin CRUD (`/api/admin/bai-viet`) + public list/detail (`/api/bai-viet`), theo đúng convention phân trang `{items,total,page,pageSize}`
- Đăng ký router mới trong `app/main.py`, export model trong `models/__init__.py`

**Frontend — Admin**
- `features/bai-viet/`: api, components, hooks, schemas — theo cấu trúc feature chuẩn của repo
- Form soạn bài dùng Tiptap/Quill, upload ảnh bìa qua `features/image-library` (đã có sẵn MinIO)
- Bảng danh sách bài viết + trạng thái, theo mẫu `AdminApprovalQueueTable.tsx`
- Route mới `app/quan-tri/bai-viet`, thêm vào `NAV_ITEMS` của `AdminLayout.tsx`

**Frontend — Người dùng**
- Route công khai `app/(public)/thong-tin-thi-truong/` — danh sách bài viết + nhúng lại các biểu đồ từ `features/reports` đã có
- Trang chi tiết `[slug]/page.tsx` — render HTML từ Tiptap/Quill an toàn (sanitize trước khi `dangerouslySetInnerHTML`)
- Sửa `ROUTES.thongTinThiTruong` trong `constants/routes.ts`, trỏ lại link trong `Header.tsx:15`

**An toàn nội dung**
- Sanitize HTML phía server trước khi lưu (vd `bleach` / `nh3`) — chặn XSS từ nội dung bài viết
- Giới hạn quyền tạo/sửa bài chỉ admin (`get_current_admin_user`, đã có sẵn)

---

## 5. Lộ trình triển khai

3 giai đoạn, làm theo thứ tự — mỗi giai đoạn tự chốt được, không phải chờ hết mới demo.

### P0 — Vá chỗ gãy (~1 buổi)

- [ ] **Nối trang Tổng quan admin với API thật** — thay `STATS` tĩnh bằng `GET /api/thong-ke/tong-quan`
      + tổng user + báo cáo chờ xử lý. Bỏ khối "Tình trạng hệ thống" và cảnh báo giả.
      _(`AdminOverviewView.tsx`)_
- [ ] **Xóa hoặc thay 3 link 404** — Trợ giúp / Cài đặt: xóa khỏi menu nếu chưa làm nội dung, hoặc
      làm trang tối giản. Thông tin thị trường: giữ lại, trỏ sang module bài viết ở P1.
      _(`Header.tsx`, `AdminLayout.tsx`)_
- [ ] **Bổ sung test cho tin_dang & nguoi_dung** — tối thiểu: tạo/sửa/xóa/ẩn tin, luồng duyệt tin,
      khóa/mở khóa user, phân quyền admin-only.
      _(`be/tests/test_tin_dang.py`, `test_nguoi_dung.py` — mới)_

### P1 — Module Bài viết thị trường (~2–3 buổi)

- [ ] **Backend: model + migration + router** — BaiViet, CRUD admin + list/detail public, sanitize
      HTML khi lưu.
- [ ] **Admin: form soạn bài** — cài `@mantine/tiptap` (hoặc `react-quill-new` nếu giữ Quill), upload
      ảnh bìa, danh sách + trạng thái đăng.
- [ ] **Public: trang danh sách + chi tiết** — gộp với thống kê thị trường hiện có thành 1 khu vực
      `/thong-tin-thi-truong` hoàn chỉnh, sửa lại link trong Header.

### P2 — Hoàn thiện điểm cộng (~1 buổi)

- [ ] **Rà chính tả toàn bộ UI & nội dung mẫu** — theo đúng yêu cầu bắt buộc trong git-convention.md
      của workspace; lỗi chính tả bị trừ nặng.
- [ ] **README hướng dẫn chạy + tài khoản demo** — một lệnh `docker compose up` chạy được toàn bộ,
      kèm tài khoản admin/user mẫu để giảng viên test nhanh.
- [ ] **Seed dữ liệu cho module bài viết** — vài bài mẫu thật (không lorem) để trang danh sách
      không trống khi demo.

---

## 6. Checklist trước khi nộp

- [ ] Không còn link nào trên nav trỏ tới trang 404.
- [ ] Trang "Tổng quan" admin hiển thị số liệu thật, không còn hằng số viết cứng.
- [ ] `python -m pytest` pass toàn bộ, có test cho `tin_dang.py` và `nguoi_dung.py`.
- [ ] Module Bài viết: admin đăng được bài có ảnh + rich text, người dùng xem được danh sách và chi tiết.
- [ ] Rà chính tả tiếng Việt toàn bộ giao diện và dữ liệu seed (yêu cầu bắt buộc theo quy ước dự án).
