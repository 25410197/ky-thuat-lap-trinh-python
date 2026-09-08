# Kịch Bản Chi Tiết Dành Cho Hải & Tiến (Đã tối ưu luồng quay)

Kịch bản này đã được sắp xếp lại theo **từng Tab (Cửa sổ)** để hạn chế tối đa việc nhảy qua nhảy lại, kết hợp mượt mà cả thao tác của User và Admin cho luồng Tin đăng.

## 🧑‍💻 PHẦN 1: TẠO, DUYỆT VÀ CHỈNH SỬA TIN ĐĂNG (Hải)
**Thời lượng dự kiến:** 3 phút

**Chuẩn bị (Mở sẵn 3 cửa sổ/tab):**
- **Tab 1 (Tab chính):** Trình duyệt thường, chưa đăng nhập (quay Đăng ký/Đăng nhập).
- **Tab 2 (Ẩn danh):** Trình duyệt ẩn danh, chưa đăng nhập (soi tin công khai).
- **Tab 3 (Admin):** Đăng nhập sẵn tài khoản admin (chờ ở `/quan-tri/tin-dang`).
- Chuẩn bị 1 ảnh mẫu trên máy tính để upload.

| Tab / Cửa sổ | Hành động trên màn hình (Visual) | Lời thoại (Voice) |
| :--- | :--- | :--- |
| **Tab 1: User**<br>(0:00 - 0:40) | **1. Mở trang `/dang-ky`**: Dùng autofill điền form và submit.<br>**2. Tại `/dang-nhap`**: Đăng nhập tài khoản vừa tạo.<br>**3. Vào `/danh-sach-nha-cho-thue`**: Gõ tìm "Phòng trọ", chọn khoảng giá và bấm Áp dụng. | *"Backend có 9 nhóm route chính, phân quyền 3 tầng. Ở phần xác thực, form đăng ký gọi `POST /api/auth/register`, còn đăng nhập gọi `POST /api/auth/login`, trả về JWT lưu ở trình duyệt.<br><br>Sang phần Tìm kiếm, mỗi lần đổi bộ lọc, giao diện gọi `GET /api/rental-posts` với query param tương ứng, trả về kết quả ngay lập tức."* |
| **Tab 1: User**<br>(0:40 - 1:10) | **4. Vào `/thu-vien-anh`**: Bấm upload 1 ảnh thật.<br>**5. Bấm Đăng tin mới**: Điền tiêu đề, giá, chọn ảnh vừa up. Bấm Lưu. Giao diện báo tin đang chờ duyệt. | *"Với Thư viện ảnh, file upload được đẩy thẳng lên MinIO. Bây giờ mình sẽ đăng 1 tin mới. Tin vừa tạo mặc định sẽ ở trạng thái 'Chờ duyệt'."* |
| **Tab 3: Admin**<br>(1:10 - 1:30) | **6. Chuyển sang Tab Admin**: F5 trang `/quan-tri/tin-dang`, thấy tin mới. Bấm **Duyệt**. | *"Phía quản trị viên, khi thấy tin mới có thể xem xét và bấm Duyệt. API sẽ cập nhật trạng thái tin thành Đã đăng."* |
| **Tab 1: User**<br>(1:30 - 2:00) | **7. Chuyển lại Tab 1**: F5 trang Quản lý tin, thấy tin đã "Đã đăng". Bấm **Sửa**, đổi tiêu đề (thêm chữ "Giảm giá") và bấm Lưu. Hiện banner "Đang có bản chỉnh sửa chờ duyệt". | *"Quay lại user, tin đã được duyệt. Điểm hay nhất là khi mình sửa 1 tin đang public và bấm Lưu, request `PUT /api/rental-posts/{id}` KHÔNG ghi đè trực tiếp mà tạo ra 1 bản chờ duyệt riêng."* |
| **Tab 2: Ẩn danh**<br>(2:00 - 2:20) | **8. Chuyển sang Tab Ẩn danh**: Paste link chi tiết tin vừa sửa. Thấy tiêu đề/giá vẫn là nội dung cũ. | *"Như các bạn thấy trên tab ẩn danh, khách vãng lai vẫn xem được nội dung cũ, tin công khai đứng yên cho tới khi admin duyệt bản sửa kia."* |
| **Tab 3: Admin**<br>(2:20 - 2:40) | **9. Chuyển sang Tab Admin**: Thấy tin có badge "Chỉnh sửa". Bấm **Duyệt**. | *"Admin xử lý bản sửa này, khi duyệt, nội dung mới sẽ được áp đè lên tin công khai và xóa bản chờ."* |
| **Tab 2: Ẩn danh**<br>(2:40 - 2:50) | **10. Chuyển sang Tab Ẩn danh**: F5 lại trang chi tiết. Đã cập nhật nội dung "Giảm giá". | *"F5 lại tab khách vãng lai, nội dung mới đã chính thức được lên sóng."* |
| **Tab 3: Admin**<br>(2:50 - 3:10) | **11. Chuyển sang Tab Admin**: Vào `/quan-tri/loai-bat-dong-san`, thử thêm mới 1 loại hoặc bấm Ẩn/Hiện. | *"Cuối cùng là phần danh mục, admin có thể dễ dàng thêm hoặc ẩn các loại bất động sản. Đây là nhóm chức năng đăng nhập, tin đăng, thư viện ảnh và danh mục. Phần quản lý người dùng và các module còn lại bạn tiếp theo sẽ demo."* |

---

## 🧑‍💻 PHẦN 2: BÁO CÁO, THỐNG KÊ VÀ TIN TỨC (Tiến)
**Thời lượng dự kiến:** 2 phút 30 giây (Quay liền mạch)

**Chuẩn bị (Mở sẵn 3 cửa sổ/tab & Slide):**
- **Tab 1 (User):** Đăng nhập sẵn 1 tài khoản thường.
- **Tab 2 (Admin):** Đăng nhập sẵn tài khoản admin.
- **Tab 3 (Ẩn danh):** Trình duyệt ẩn danh (để xem trang tin tức).
- **Slide:** Bật sẵn slide Kiến trúc hệ thống.

| Tab / Cửa sổ | Hành động trên màn hình (Visual) | Lời thoại (Voice) |
| :--- | :--- | :--- |
| **Tab 1: User**<br>(0:00 - 0:40) | **1. Trang danh sách tin**: Bấm icon Trái tim lưu 1-2 tin. Vào `/yeu-thich` xem lại.<br>**2. Mở chi tiết 1 tin của người khác**: Bấm "Báo cáo vi phạm", chọn lý do, Gửi.<br>**3. Bấm Báo cáo lần 2** ngay tin đó -> Báo lỗi đỏ "Đang chờ quản trị viên xử lý". | *"Tiếp theo là Yêu thích, người dùng có thể lưu các tin ưng ý và quản lý trong trang cá nhân.<br><br>Về Báo cáo vi phạm, khi phát hiện tin ảo, người dùng gửi báo cáo. Cơ chế chống spam của backend sẽ chặn báo cáo liên tục cùng 1 tin, yêu cầu chờ admin xử lý xong báo cáo trước đó."* |
| **Tab 2: Admin**<br>(0:40 - 1:40) | **4. Chuyển sang Tab Admin**: Vào `/quan-tri/bao-cao`, thấy báo cáo vừa rồi, bấm Duyệt/Từ chối.<br>**5. Vào `/quan-tri/thong-ke`**: Scroll xem số liệu tổng quan, rê chuột qua các biểu đồ.<br>**6. Vào `/quan-tri/tin-tuc`**: Bấm Viết bài mới, gõ tiêu đề, bôi đậm vài chữ ở nội dung, bấm Đăng. | *"Ở phía admin, khi báo cáo được xử lý xong thì người dùng mới có thể báo cáo lại tin đó.<br><br>Kế tiếp, nhóm xây dựng Dashboard thống kê giúp admin theo dõi hoạt động và tham khảo mặt bằng giá thuê.<br><br>Với tính năng Tin tức, admin dùng rich-text để đăng bài. Nội dung HTML được backend làm sạch bằng thư viện `nh3` để chống XSS."* |
| **Tab 3: Ẩn danh**<br>(1:40 - 2:00) | **7. Chuyển sang Tab Ẩn danh**: Vào `/thong-tin-thi-truong`, click bài viết vừa đăng để xem. | *"Sau khi đăng, bất kỳ ai kể cả khách chưa đăng nhập đều có thể đọc bài viết ở trang Thông tin thị trường bên ngoài."* |
| **Màn hình Slide**<br>(2:00 - 2:30) | **8. Bật slide Kiến trúc tổng quan** (fullscreen). | *"Tóm lại, hệ thống dùng Next.js ở Frontend, FastAPI ở Backend, PostgreSQL và MinIO. Nhóm vừa demo trực tiếp các module Backend trọng tâm. Cảm ơn thầy cô và các bạn đã theo dõi, nhóm đã sẵn sàng nhận câu hỏi."* |

### 💡 Tips để quay mượt nhất:
- **Setup sẵn các tab cạnh nhau:** Đặt Tab User, Tab Admin, Tab Ẩn danh nằm liền kề trên thanh trình duyệt (hoặc dùng Alt+Tab / Cmd+Tab giữa các cửa sổ) để khi nói xong 1 ý là bấm chuyển sang màn hình kia được ngay mà không cần tìm kiếm.
- **Thực hành khớp mồm (Dry-run):** Hãy mở 3 tab lên, vừa thao tác vừa đọc lời thoại 1-2 lần để tay quen với luồng nhảy tab này.
