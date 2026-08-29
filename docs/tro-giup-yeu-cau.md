# Yêu cầu triển khai — Trợ giúp

> ✅ **Đã triển khai đầy đủ.** Ghi chú triển khai thực tế ở cuối file.

## 1. Bài toán

`Header.tsx:16` có link **"Trợ giúp"** trỏ `/tro-giup`, route này chưa tồn tại → 404
(xem `docs/ke-hoach-hoan-thien.md`, mục 3). Link nằm trên menu chính, ai cũng thấy kể cả chưa
đăng nhập.

## 2. Phạm vi

Đây là trang **nội dung tĩnh**, không cần model/API/DB — giữ effort thấp, đúng với vai trò một
trang hỗ trợ cho đồ án (không cần hệ thống ticket hỗ trợ thật).

**Trong phạm vi:**
- 1 trang public, nội dung viết cứng trong component.
- FAQ dạng accordion (câu hỏi thường gặp).
- Khối thông tin liên hệ hỗ trợ.

**Ngoài phạm vi:**
- Form gửi yêu cầu hỗ trợ / ticket (không có backend xử lý, không có ai đọc).
- Chat trực tuyến, chatbot.
- Quản lý FAQ động qua trang admin (nội dung ít thay đổi, không đáng để xây CRUD).

## 3. Nội dung trang

### 3.1. Câu hỏi thường gặp (accordion — dùng `Accordion` của Mantine)

Nhóm theo 3 vai trò đúng với `docs/yêu cầu.md`, mỗi câu 2–4 câu trả lời, tiếng Việt tự nhiên:

**Với người tìm nhà**
- Tìm nhà theo khu vực/giá/diện tích như thế nào?
- Xem thông tin liên hệ chủ nhà ở đâu? *(trả lời: cần đăng nhập, theo đúng luồng đã có ở
  `RentalPostDetailView.tsx`)*
- Lưu tin yêu thích để xem lại sau bằng cách nào?
- Phát hiện tin đăng sai sự thật/lừa đảo thì báo cáo ở đâu? *(trỏ tới nút báo cáo đã có ở trang
  chi tiết tin)*

**Với người đăng tin cho thuê**
- Đăng tin cho thuê cần chuẩn bị gì (ảnh, mô tả tối thiểu 30 ký tự...)?
- Vì sao tin đăng của tôi đang ở trạng thái "Chờ duyệt"?
- Sửa/ẩn/xóa tin đã đăng như thế nào?
- Quản lý ảnh tin đăng ở "Thư viện ảnh" ra sao?

**Chung**
- Đăng ký/đăng nhập tài khoản như thế nào?
- Quên mật khẩu thì làm sao? *(ghi chú: xem `docs/cai-dat-tai-khoan-yeu-cau.md` — nếu tính năng
  đổi mật khẩu chưa làm thì FAQ này tạm thời trả lời "liên hệ hỗ trợ qua email")*

### 3.2. Khối liên hệ hỗ trợ

Card tĩnh cuối trang: email hỗ trợ (dùng email seed admin hoặc email dự án), khung giờ phản hồi dự
kiến. Không cần form — chỉ hiển thị `mailto:` link.

## 4. Frontend

Không cần feature folder riêng vì không có logic — đặt thẳng trong `components/` hoặc `features/home`
(tương tự cách `HomeView.tsx` được tổ chức).

- `fe/src/features/help/components/HelpView.tsx` — component chính, chứa `Accordion` FAQ + khối liên hệ.
- `fe/src/app/(public)/tro-giup/page.tsx` — render `HelpView`.
- `fe/src/constants/routes.ts` — thêm `troGiup: "/tro-giup"`.
- `fe/src/components/layout/Header.tsx` — sửa `NAV_LINKS` dùng `ROUTES.troGiup` thay vì hardcode string.

Layout gợi ý: tiêu đề trang → `Accordion` 3 nhóm FAQ (mỗi nhóm có `Text` label nhỏ phân nhóm) →
card liên hệ. Dùng `AppButton`/`AppInput` nếu cần, nhưng trang này gần như chỉ có `Text` + `Accordion`.

## 5. Acceptance — hoàn thành khi

- [ ] Link "Trợ giúp" trên menu chính không còn 404.
- [ ] Trang hiển thị đủ 3 nhóm FAQ (mục 3.1), mỗi câu mở/đóng được (accordion hoạt động).
- [ ] Khối liên hệ hiển thị email hỗ trợ, bấm vào mở ứng dụng mail (`mailto:`).
- [ ] Trang xem được cả khi chưa đăng nhập (không bị `RouteGuard` chặn).
- [ ] Không có lỗi chính tả tiếng Việt trong nội dung FAQ (rà lại theo quy ước dự án).

## 6. Checklist file cần tạo/sửa

- [x] `fe/src/features/help/components/HelpView.tsx`
- [x] `fe/src/app/(public)/tro-giup/page.tsx`
- [x] `fe/src/constants/routes.ts`
- [x] `fe/src/components/layout/Header.tsx`

## 7. Ghi chú triển khai thực tế (đã làm)

- 3 nhóm FAQ đúng mục 3.1, mỗi nhóm 1 `Accordion` riêng (tránh trùng `value` giữa các nhóm).
- Sửa lại 1 câu so với bản nháp cho khớp tính năng thật: "Sửa/ẩn/xóa tin đã đăng" → "Sửa/xóa tin
  đã đăng" — kiểm tra `MyListingsTable.tsx` chỉ có 2 hành động Sửa và Xóa, không có "ẩn tin".
- "Quên mật khẩu": xác nhận chưa có route/link nào cho reset mật khẩu qua email (chỉ có đổi mật
  khẩu khi đã đăng nhập và nhớ mật khẩu cũ, xem `cai-dat-tai-khoan-yeu-cau.md`) → giữ câu trả lời
  "liên hệ hỗ trợ qua email" đúng như phương án dự phòng trong spec.
- Email hỗ trợ dùng `admin@example.com` — khớp `SEED_ADMIN_EMAIL` mặc định trong
  `be/.env.example`.
- `/tro-giup` không nằm trong `ROUTE_PREFIX_ROLES` (`permissions.ts`) nên mặc định public, không
  cần sửa gì thêm để qua `RouteGuard`.
- Đã chạy `tsc --noEmit` (0 lỗi) và `eslint` (0 lỗi/cảnh báo) trên toàn bộ file mới/sửa.
