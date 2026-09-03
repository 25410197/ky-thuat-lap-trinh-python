# Kịch bản Demo — UrbanLease (10 phút)

> Dùng cho mục "Demo (trực tiếp hoặc video)" trong tiêu chí chấm. Quay màn hình theo đúng thứ tự
> bên dưới rồi dựng lại (cắt bớt thời gian chờ tải trang), có phụ đề hoặc giọng đọc theo lời thoại
> gợi ý. Nếu demo trực tiếp trên lớp thì dùng kịch bản này làm outline nói, không cần đọc y nguyên.

## Chuẩn bị trước khi quay (làm 1 lần)

- [ ] Seed lại dữ liệu sạch: `docker compose -f infra/compose.yaml up -d --build` (hoặc chạy lại
      script seed) để có ~40 tin đăng mẫu, danh mục, tỉnh/quận/phường đầy đủ.
- [ ] Chuẩn bị sẵn 3 tài khoản: 1 admin, 1 user thường (đã có sẵn vài tin đăng + vài tin yêu
      thích để đỡ phải thao tác từ đầu), 1 tài khoản phụ dùng để test khóa/mở khóa.
- [ ] Chuẩn bị sẵn 2-3 ảnh thật (jpg/png, không quá nặng) để upload khi đăng tin cho mượt.
- [ ] Chuẩn bị sẵn 1 tin đăng "chờ duyệt" và 1 tin "bị báo cáo" (tạo trước bằng tài khoản phụ) để
      không phải chờ thao tác trong lúc quay.
- [ ] Đóng các tab/notification không liên quan, để trình duyệt full-screen, zoom 100%.
- [ ] Test tốc độ mạng/server ổn định trước khi quay (tránh loading lâu bị cắt vào bản dựng).

---

## Mốc thời gian (tổng 10:00)

| # | Thời lượng | Khung giờ | Nội dung |
|---|---|---|---|
| 1 | 0:40 | 0:00 – 0:40 | Mở đầu |
| 2 | 2:00 | 0:40 – 2:40 | Khách chưa đăng nhập |
| 3 | 2:30 | 2:40 – 5:10 | Người dùng đã đăng nhập |
| 4 | 2:30 | 5:10 – 7:40 | Quản trị viên |
| 5 | 1:40 | 7:40 – 9:20 | Điểm cộng: Dashboard giá thuê + Tin tức thị trường |
| 6 | 0:40 | 9:20 – 10:00 | Kết |

---

## 1) Mở đầu — 0:40

**Màn hình:** Trang chủ UrbanLease (chưa đăng nhập).

**Nói:**
> "Đây là UrbanLease — website đăng tin và tìm kiếm nhà cho thuê nhóm mình xây dựng cho môn Kỹ
> thuật lập trình Python. Hệ thống phục vụ 3 nhóm người dùng: khách chưa đăng nhập, người dùng đã
> đăng nhập, và quản trị viên. Mình sẽ demo lần lượt theo 3 nhóm này."

---

## 2) Khách chưa đăng nhập — 2:00

**Màn hình:** vẫn ở trạng thái chưa đăng nhập.

1. **Trang chủ** (~20s) — lướt qua danh sách tin đăng mới nhất đã duyệt.
   > "Trang chủ hiển thị các tin đăng mới nhất đã được quản trị viên duyệt."
2. **Tìm kiếm** (~30s) — gõ từ khóa vào ô tìm kiếm (tên/địa chỉ), bấm tìm.
   > "Khách có thể tìm theo tên tin đăng hoặc địa chỉ."
3. **Lọc** (~40s) — mở bộ lọc, chọn tỉnh/quận, khoảng giá, diện tích, loại hình (phòng trọ / căn
   hộ / nhà nguyên căn), áp dụng.
   > "Và lọc chi tiết theo tỉnh/quận, khoảng giá, diện tích, loại hình bất động sản."
4. **Chi tiết tin đăng** (~30s) — click vào 1 tin, xem đầy đủ ảnh, mô tả, giá, diện tích, thông
   tin liên hệ (lưu ý: phần liên hệ người đăng có thể bị ẩn/giới hạn với khách — nếu có, nói rõ).
   > "Trang chi tiết hiển thị đầy đủ thông tin tin đăng."

---

## 3) Người dùng đã đăng nhập — 2:30

**Màn hình:** Đăng nhập bằng tài khoản user thường.

1. **Đăng nhập** (~15s).
2. **Đăng tin mới** (~50s) — vào form đăng tin, điền tiêu đề/mô tả/giá/diện tích/loại hình/địa
   chỉ, upload 1-2 ảnh (từ thư viện ảnh lưu ở MinIO), lưu.
   > "Người dùng đăng tin cho thuê kèm nhiều ảnh, ảnh được lưu ở MinIO."
3. **Quản lý tin của mình** (~35s) — vào trang "Tin của tôi", sửa 1 tin đã có, ẩn hoặc xóa 1 tin
   khác.
   > "Người dùng quản lý được tin của mình: chỉnh sửa, ẩn hoặc xóa."
4. **Tin yêu thích** (~25s) — quay lại danh sách, bấm lưu yêu thích 1 tin, vào trang "Tin yêu
   thích" để xem lại.
   > "Có thể lưu tin yêu thích để xem lại sau."
5. **Cài đặt tài khoản** (~25s) — vào trang cài đặt, sửa hồ sơ hoặc đổi mật khẩu.
   > "Và tự quản lý hồ sơ, đổi mật khẩu ở trang cài đặt tài khoản."

---

## 4) Quản trị viên — 2:30

**Màn hình:** Đăng xuất, đăng nhập lại bằng tài khoản admin.

1. **Đăng nhập admin** (~15s).
2. **Duyệt / khóa tin đăng** (~45s) — vào trang quản trị, danh sách tin chờ duyệt, duyệt 1 tin,
   khóa 1 tin khác (đã chuẩn bị sẵn ở bước chuẩn bị).
   > "Quản trị viên duyệt tin trước khi hiển thị công khai, hoặc khóa tin vi phạm."
3. **Xử lý tin bị báo cáo** (~25s) — vào danh sách báo cáo, xem lý do, xử lý 1 báo cáo mẫu.
4. **Quản lý người dùng** (~30s) — vào danh sách người dùng, khóa tài khoản phụ đã chuẩn bị, rồi
   thử đăng nhập bằng tài khoản đó ở tab ẩn danh để cho thấy bị chặn (403).
   > "Quản trị viên khóa được tài khoản vi phạm — tài khoản bị khóa sẽ không đăng nhập được nữa."
5. **Quản lý danh mục loại bất động sản** (~15s) — xem/thêm nhanh 1 danh mục.
6. **Dashboard thống kê tổng quan** (~20s) — xem số lượng tin, người dùng, tin chờ duyệt.
   > "Và có dashboard thống kê tổng quan để theo dõi hoạt động hệ thống."

---

## 5) Điểm cộng — 1:40

1. **Dashboard phân tích giá thuê** (~55s) — vào trang thống kê giá, xem biểu đồ giá trung bình
   theo khu vực/loại nhà, giá theo m², phân bố giá, khu vực nhiều tin nhất.
   > "Ngoài yêu cầu bắt buộc, nhóm làm thêm dashboard phân tích giá thuê — giúp người dùng tham
   > khảo mặt bằng giá trước khi thuê hoặc cho thuê."
2. **Tin tức thị trường** (~45s) — với tài khoản admin: vào soạn 1 bài viết nhanh bằng trình
   soạn thảo rich-text, đăng bài; sau đó mở tab ẩn danh (khách chưa đăng nhập) vào trang tin tức
   công khai xem lại bài vừa đăng.
   > "Và module Tin tức thị trường — admin đăng bài, ai cũng xem được kể cả khách chưa đăng
   > nhập."

---

## 6) Kết — 0:40

**Màn hình:** quay lại trang chủ hoặc slide Kết luận.

> "Như vậy UrbanLease đã đáp ứng đủ 3 nhóm chức năng theo yêu cầu môn học, cùng 2 phần bổ sung là
> dashboard phân tích giá và module tin tức thị trường. Cảm ơn thầy/cô và các bạn đã theo dõi."

---

## Ghi chú quay/dựng

- Quay từng đoạn riêng theo 6 mục trên rồi ghép lại — dễ quay lại đoạn nào bị lỗi mà không phải
  quay từ đầu.
- Có thể tăng tốc độ phần chuyển trang/loading khi dựng (x1.5–x2) nếu bị chậm, để không lố giờ.
- Nếu thời gian lớp cho phép demo trực tiếp: dùng đúng outline này để nói, không cần video —
  nhưng vẫn nên có bản quay sẵn dự phòng (đã note ở mục 5 "Demo" trong kế hoạch) phòng khi lỗi
  mạng/server lúc demo trực tiếp.
