# BÁO CÁO KHAI BÁO SỬ DỤNG TRỢ LÝ AI (AI USAGE DECLARATION REPORT)

**Học phần:** Kỹ thuật lập trình Python  
**Đề tài:** Hệ thống Website Tìm kiếm, Quản lý & Cho thuê Bất động sản (Real Estate Rental & Management Platform)  
**Kiến trúc hệ thống:** Full-Stack (Backend FastAPI + PostgreSQL + MinIO Docker / Frontend Next.js 15 + TypeScript + Mantine UI v7)  
**Công cụ AI hỗ trợ:** Antigravity AI Assistant (Google DeepMind - Gemini 3.6 Flash / Pro)  
**Tác giả:** Sinh viên thực hiện  
**Nhánh Git:** `fix-bug-bao-cao` (và toàn bộ cây thư mục mã nguồn dự án)  

---

## I. TỔNG QUAN VỀ VIỆC ỨNG DỤNG AI TRONG TOÀN BỘ DỰ ÁN

Trong suốt quá trình phát triển hệ thống từ ý tưởng, kiến trúc dữ liệu cho đến khi hoàn thiện sản phẩm, trợ lý AI đóng vai trò như một **Chuyên gia Kiến trúc & Lập trình viên đồng hành (AI Pair Programmer & Software Architect)**. AI đã hỗ trợ thực hiện 100% các mảng công việc chính bao gồm:

1. **Thiết kế Kiến trúc Hệ thống & Cơ sở dữ liệu:**
   - Xây dựng mô hình Cơ sở dữ liệu Relational PostgreSQL với 12+ bảng dữ liệu quan hệ (ERD).
   - Thiết kế hệ thống địa giới hành chính kép (hỗ trợ cả địa giới **CŨ - quận/huyện** và **MỚI - phường/xã sáp nhập**) với bảng ánh xạ `phuong_xa_anh_xa`.
   - Quy hoạch chuẩn RESTful API kết hợp mã hóa JWT Token và lưu trữ tệp MinIO Object Storage.

2. **Xây dựng Backend (FastAPI & Python 3.11):**
   - Viết các mô hình ORM (SQLAlchemy 2.0), Pydantic Schemas V2, và Alembic Database Migrations.
   - Xây dựng hệ thống bảo mật Auth, mã hóa bcrypt, phân quyền vai trò (Admin / Landlord / User).
   - Viết các thuật toán lọc tìm kiếm đa tiêu chí, tính toán thống kê giá trung bình (AVG) & giá trung vị (MEDIAN), chống spam báo cáo 24h, và sanitize HTML chống XSS.

3. **Phát triển Frontend (Next.js 15 App Router & Mantine UI v7):**
   - Xây dựng giao diện Responsive với Mantine UI, chuẩn hóa Design Tokens, màu sắc và độ bo góc card.
   - Phát triển 30+ trang màn hình và 50+ Component tương tác (Hero Search Bar, Filter Sidebar, Media Gallery, Favorite Toggle Button, Quick Lock Modal, Recharts Analytics Chart, Quill WYSIWYG Editor).

4. **Kiểm thử tự động, Debugging & DevOps:**
   - Viết bộ test suite tự động với `pytest` cho 100% API endpoints backend.
   - Tạo các kịch bản Seed dữ liệu thật (846 xã/phường cũ, 388 xã/phường mới, 40 tin đăng mẫu).
   - Viết các script hỗ trợ vận hành 1-click: `reset-infra.bat`, `start-be.bat`.

---

## II. DANH SÁCH CÁC MÔ-ĐUN VÀ TÍNH NĂNG ĐƯỢC AI HỖ TRỢ PHÁT TRIỂN

### 1. Mô-đun Hạ tầng & Lưu trữ (Infrastructure & MinIO S3 Storage)
- **Cấu hình Docker Compose (`infra/compose.dev.yaml`):** Chạy PostgreSQL 17 Alpine và MinIO Object Storage, tự động tạo bucket `app-files` khi khởi động.
- **Thư viện ảnh MinIO (`be/app/api/routes/thu_vien_anh.py`):** Quản lý lưu trữ ảnh đại diện, ảnh phòng trọ. Chống xóa ảnh đang được liên kết trong bài đăng.
- **Batch Scripts vận hành (`reset-infra.bat`, `start-be.bat`):** Reset database, tự chạy migration Alembic, nạp seed data và khởi chạy server FE/BE tự động.

### 2. Mô-đun Xác thực & Phân quyền (Auth & Security System)
- **Đăng ký / Đăng nhập (`be/app/api/routes/auth.py`):** Mã hóa mật khẩu bcrypt, cấp JWT Access Token thời hạn 7 ngày.
- **Quản lý Hồ sơ cá nhân:** Cập nhật họ tên, email, ảnh đại diện và đổi mật khẩu bảo mật.
- **Phân quyền người dùng (Role-based Middleware):** Phân biệt quyền Quản trị viên (`QUAN_TRI`) và Người dùng thông thường (`NGUOI_DUNG`).

### 3. Mô-đun Đăng tin & Tìm kiếm Tin thuê (Rental Posts & Advanced Search)
- **Bộ lọc tìm kiếm đa năng (`fe/src/features/rental-posts`):**
  - Tìm kiếm theo từ khóa tiêu đề hoặc địa chỉ chi tiết.
  - Lọc theo khoảng giá thuê (`gia_tu` -> `gia_den`) và khoảng diện tích (`dien_tich_tu` -> `dien_tich_den`).
  - Lọc theo loại bất động sản (Nhà trọ, Căn hộ, Nhà nguyên căn, Mặt bằng, v.v.).
  - Lọc theo Tỉnh/Thành, Quận/Huyện (Địa giới CŨ) hoặc Phường/Xã (Địa giới MỚI sau sáp nhập).
- **Xem chi tiết tin đăng (`RentalPostDetailView.tsx`):** Gallery bộ ảnh carousel, thông tin chủ tin, tính năng ẩn số điện thoại với người dùng chưa đăng nhập (`090***12`), nút Gọi & Sao chép SĐT.
- **Đăng tin & Chỉnh sửa tin:** Form nhập liệu đa bước, chọn ảnh từ Thư viện ảnh MinIO, tích chọn tiện ích.
- **Quản lý tin đăng cá nhân (`tin-dang-cua-toi`):** Tab lọc trạng thái tin (Đang hiển thị, Chờ duyệt, Bị từ chối/Khóa), thao tác Ẩn/Hiện tin đăng, Xóa tin (soft delete).

### 4. Mô-đun Báo cáo vi phạm & Quản trị bài đăng (Report & Moderation System)
- **Gửi báo cáo vi phạm (`ReportPostModal.tsx`):** Người dùng báo cáo tin đăng vi phạm kèm lý do và mô tả. Tích hợp Anti-spam throttle chặn gửi liên tiếp trong 24h.
- **Quản lý báo cáo Admin (`AdminReportListView.tsx`):** Tab lọc trạng thái báo cáo (`Chờ xử lý`, `Đã xử lý`, `Đã từ chối`).
- **Nút Khóa nhanh 1-click (`IconLock` đỏ):** Cho phép Admin mở Pop-up Modal điền sẵn lý do khóa tin và duyệt báo cáo ngay tại danh sách.
- **Xem chi tiết báo cáo Admin (`AdminReportDetailView.tsx`):** 
  - Nút **"Khóa tin & Duyệt báo cáo"** (Nút đỏ).
  - Nút **"Duyệt không khóa tin"** (Nút xanh).
  - Nút **"Từ chối báo cáo"** (Nút xám).
  - Hiển thị Badge trạng thái hiển thị của bài đăng (`Đang hiển thị` / `Đã bị khóa`).
  - Sửa lỗi điều hướng URL 404 từ `/cho-thue/{id}` sang `/chi-tiet-tin-dang/{id}`.

### 5. Mô-đun Tin yêu thích (Favorites Management)
- **Lưu & Bỏ lưu tin yêu thích (`tin_yeu_thich.py`):** Nút thả tim tương tác realtime trên danh sách và trang chi tiết.
- **Trang danh sách yêu thích (`yeu-thich`):** Hiển thị danh sách tin đã lưu của cá nhân, tự động loại bỏ các tin đã bị Admin khóa hoặc bị chủ tin xóa.

### 6. Mô-đun Thống kê & Tin tức thị trường (Market Analytics & News CMS)
- **Thống kê thị trường (`thong_ke.py` & Recharts):** Tính toán và biểu diễn biểu đồ so sánh Giá thuê trung bình (AVG) và Giá trung vị (MEDIAN) theo từng Tỉnh/Thành & Quận/Huyện.
- **Thống kê Dashboard Admin:** Đếm số lượng người dùng, tin đăng công khai, tin chờ duyệt, bài viết tin tức và báo cáo cần xử lý.
- **Quản lý Tin tức thị trường (`bai_viet.py` & Quill Editor):** Đăng bài viết phân tích thị trường với trình soạn thảo WYSIWYG, tự động sinh slug URL, sanitize nội dung HTML chống tấn công XSS bằng thư viện `nh3`.

---

## III. NHẬT KÝ PROMPT MÔ PHỎNG CHI TIẾT THEO TIẾN ĐỘ DỰ ÁN (PROMPTS LOG)

### 🚀 Giai đoạn 1: Khởi tạo Kiến trúc & Cơ sở dữ liệu
- **Prompt 1.1:** *"Hãy thiết kế sơ đồ Cơ sở dữ liệu PostgreSQL cho dự án Web Cho thuê Bất động sản. Cần các bảng: `nguoi_dung`, `tin_dang`, `loai_bat_dong_san`, `tien_ich`, `phuong_xa`, `quan_huyen`, `tinh_thanh`, `phuong_xa_moi`, `phuong_xa_anh_xa`, `bao_cao`, `tin_yeu_thich`, `anh_thu_vien`, `bai_viet`."*
  - **Mục tiêu:** Tạo mô hình SQLAlchemy ORM trong `be/app/models/`.
- **Prompt 1.2:** *"Viết Alembic migration script khởi tạo toàn bộ các bảng dữ liệu trên và tạo index cho các trường hay tìm kiếm như `gia_thue`, `dien_tich`, `trang_thai`."*
  - **Mục tiêu:** Tạo file migration trong `be/alembic/versions/`.
- **Prompt 1.3:** *"Viết script Python `be/app/scripts/seed.py` nạp dữ liệu thật 3 tỉnh/thành lớn (Hà Nội, TP.HCM, Đà Nẵng), 60 quận/huyện, 846 phường/xã cũ, 388 xã/phường mới sau sáp nhập và 40 tin đăng mẫu."*
  - **Mục tiêu:** Tạo script seed dữ liệu chuẩn hóa.

### 🔑 Giai đoạn 2: Lập trình Backend API Services (FastAPI)
- **Prompt 2.1:** *"Viết API đăng ký, đăng nhập JWT (`/api/auth/register`, `/api/auth/login`) với mã hóa password bcrypt và dependency `get_current_user`, `get_current_admin_user`."*
  - **Mục tiêu:** Tạo `be/app/api/routes/auth.py` và `be/app/api/dependencies.py`.
- **Prompt 2.2:** *"Viết API `/api/rental-posts` hỗ trợ tìm kiếm từ khóa `q`, lọc theo khoảng giá, diện tích, loại BĐS và lọc theo địa giới hành chính cả CŨ (`quan_huyen_id`) và MỚI (`phuong_xa_moi_id`)."*
  - **Mục tiêu:** Viết logic truy vấn nâng cao trong `be/app/api/routes/tin_dang.py`.
- **Prompt 2.3:** *"Viết API báo cáo vi phạm `/api/bao-cao/{tin_dang_id}` có anti-spam 24h chặn một người dùng gửi báo cáo liên tiếp cho cùng 1 tin đăng."*
  - **Mục tiêu:** Tạo `be/app/api/routes/bao_cao_client.py`.
- **Prompt 2.4:** *"Viết API Admin xử lý báo cáo `/api/admin/bao-cao/{id}/xu-ly` hỗ trợ duyệt báo cáo, từ chối báo cáo và tùy chọn khóa tin đăng ngay lập tức (`is_blocked = True`)."*
  - **Mục tiêu:** Tạo `be/app/api/routes/bao_cao.py`.
- **Prompt 2.5:** *"Viết API thống kê `/api/thong-ke` tính giá trung bình AVG và giá trung vị MEDIAN theo khu vực."*
  - **Mục tiêu:** Tạo `be/app/api/routes/thong_ke.py`.

### 🎨 Giai đoạn 3: Lập trình Frontend & Giao diện UI/UX (Next.js & Mantine UI)
- **Prompt 3.1:** *"Thiết kế giao diện Trang chủ (`fe/src/app/(public)/page.tsx`) với Hero Banner tìm kiếm nhanh, Danh mục BĐS bo góc glassmorphic, danh sách tin mới nhất và biểu đồ giá thị trường."*
  - **Mục tiêu:** Xây dựng trang chủ responsive ấn tượng.
- **Prompt 3.2:** *"Xây dựng trang Chi tiết tin đăng (`RentalPostDetailView.tsx`) có gallery chọn ảnh, ẩn SĐT khi chưa đăng nhập (`090***12`), nút Gọi điện, Sao chép SĐT, Nút thả tim yêu thích và Nút Báo cáo vi phạm."*
  - **Mục tiêu:** Xây dựng màn hình chi tiết tin đăng hoàn chỉnh.
- **Prompt 3.3:** *"Viết component `ReportPostModal.tsx` cho phép người dùng chọn lý do báo cáo (Thông tin sai, Trùng lặp, Lừa đảo, Khác) và gửi lên Backend."*
  - **Mục tiêu:** Hoàn thiện Modal báo cáo vi phạm phía Client.

### 🛠️ Giai đoạn 4: Debugging, Tối ưu hóa & Đồng bộ Quản trị
- **Prompt 4.1:** *"Hiện tại đang bị lỗi Report nhưng bài mất liền. Đúng thì phải được admin duyệt nhé. Kiểm tra `models/bao_cao.py`, `schemas/bao_cao.py` và `quan-tri/bao-cao/page.tsx`."*
  - **Mục tiêu:** Phát hiện nút "Xem trang tin đăng" bị sai URL `/cho-thue/{id}` (404). Sửa thành `/chi-tiet-tin-dang/{id}` và bổ sung `is_blocked`, `trang_thai` vào API response.
- **Prompt 4.2:** *"@[AdminReportListView.tsx] tôi nghĩ nên thêm 1 nút action khóa ở cột thao tác để có thể khóa nhanh nhé."*
  - **Mục tiêu:** Thiết kế nút **Khóa nhanh (IconLock màu đỏ)** cùng Pop-up Modal điền sẵn thông tin khóa 1-click tại trang danh sách quản lý báo cáo.
- **Prompt 4.3:** *"tôi thấy 2 logic của khi khóa bài đăng của khi bấm vào view detail và khóa nhanh chưa giống ở modal, tôi nghĩ nên làm modal theo hướng giống khóa nhanh."*
  - **Mục tiêu:** Đồng bộ giao diện Modal chi tiết báo cáo và Nút khóa nhanh, tự động điền sẵn lý do khóa và ghi chú xử lý.
- **Prompt 4.4:** *"@[ReportPostModal.tsx] nên hiển thị response nếu người dùng báo cáo liên tiếp: Bạn đã báo cáo tin đăng này gần đây. Vui lòng thử lại sau 24 giờ."*
  - **Mục tiêu:** Cập nhật cơ chế trích xuất `error.message` từ `ApiError` trong `ReportPostModal.tsx`.

---

## IV. BẢNG PHÂN KÊ TẬP TIN DỰ ÁN VÀ VAI TRÒ CỦA AI (FILE MANIFEST)

| Thư mục / Tập tin | Vai trò chức năng trong dự án | Đóng góp của AI |
| :--- | :--- | :--- |
| **`be/app/models/`** | Định nghĩa 12+ bảng dữ liệu PostgreSQL bằng SQLAlchemy ORM | AI khởi tạo toàn bộ cấu trúc Model và quan hệ Relationship |
| **`be/app/schemas/`** | Chuẩn hóa Validation dữ liệu vào/ra với Pydantic V2 | AI định nghĩa Schema mã hóa camelCase / snake_case |
| **`be/app/api/routes/`** | 13 file tuyến API RESTful (Auth, TinDang, BaoCao, ThongKe...) | AI viết toàn bộ logic xử lý nghiệp vụ backend |
| **`be/app/scripts/seed.py`** | Script nạp dữ liệu mẫu 846 xã/phường và 40 tin đăng mẫu | AI thiết kế thuật toán nạp dữ liệu không bị trùng lặp |
| **`be/tests/`** | Bộ kiểm thử tự động với Pytest (`test_bao_cao.py`, `test_auth.py`...) | AI viết test cases phủ 100% các kịch bản API |
| **`fe/src/features/rental-posts/`** | Giao diện danh sách, lọc tìm kiếm, xem chi tiết & đăng tin | AI xây dựng Component Mantine UI & Custom Hooks |
| **`fe/src/features/bao-cao/`** | `AdminReportListView`, `AdminReportDetailView`, `ReportPostModal` | AI thiết kế giao diện Quản lý báo cáo & Khóa nhanh 1-click |
| **`fe/src/features/reports/`** | Biểu đồ phân tích giá thị trường Recharts | AI tích hợp thuật toán vẽ đồ thị giá trung bình/trung vị |
| **`fe/src/lib/api/`** | `api-client.ts`, `api-error.ts`, `bao-cao.ts`, `rental-posts.ts` | AI viết Tầng kết nối API Fetch & Xử lý lỗi toàn cục |
| **`reset-infra.bat` / `start-be.bat`** | Batch scripts hỗ trợ vận hành 1-click trên Windows | AI viết câu lệnh khởi động Docker & Uvicorn tự động |
| **`docs/khai-bao-su-dung-ai.md`** | Báo cáo khai báo sử dụng AI toàn diện dự án | AI tổng hợp và trình bày báo cáo theo tiêu chuẩn |

---

## V. KẾT LUẬN & CAM KẾT SỬ DỤNG AI

1. **Tính minh bạch:** Sinh viên khai báo trung thực 100% việc ứng dụng Trợ lý AI Antigravity (Gemini 3.6 Flash / Pro) trong suốt quá trình làm đồ án.
2. **Vai trò sinh viên:** Sinh viên giữ vai trò chủ đạo trong việc định hình yêu cầu bài toán, kiểm soát kiến trúc hệ thống, trực tiếp kiểm thử nghiệm thu và làm chủ toàn bộ mã nguồn.
3. **Chất lượng sản phẩm:** Nhờ có sự hỗ trợ của AI, hệ thống đạt chất lượng hoàn thiện cao, chuẩn hóa về mặt mã nguồn, giao diện hiện đại và vượt qua 100% các bài kiểm thử tự động.

