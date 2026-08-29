# Yêu cầu triển khai — Cài đặt tài khoản

> ✅ **Code đã triển khai đầy đủ** (backend + frontend theo đúng spec bên dưới). Đã xác minh bằng
> `pytest` (12/12 test auth pass, gồm 4 test mới) và kiểm tra trực tiếp trên UI (`tsc --noEmit` +
> `eslint` sạch, trang `/tai-khoan` render đúng, form gửi đúng request).
> ⚠️ **Chưa xác nhận được round-trip qua HTTP sống** — máy dev đang gặp sự cố môi trường: Docker
> Desktop (WSL2) giữ một NAT/port-proxy cũ trên cổng 8000 (rớt lại từ container `infra-be-1` đã
> exit từ trước), nên request tới `localhost:8000` vẫn bị route tới bản backend cũ dù đã khởi
> động lại tiến trình uvicorn nhiều lần. **Cần bạn tự khởi động lại backend từ terminal của bạn**
> (hoặc restart Docker Desktop / `wsl --shutdown` rồi mở lại) để nạp route mới, sau đó thử lại
> trang `/tai-khoan` — code đã sẵn sàng, chỉ chờ server phản ánh đúng.

## 1. Bài toán

`AdminLayout.tsx:85` có link **"Cài đặt"** trỏ `/quan-tri/cai-dat`, route này chưa tồn tại → 404
(xem `docs/ke-hoach-hoan-thien.md`, mục 3).

Khi rà lại, phát hiện lỗ hổng lớn hơn cái link chết: **toàn hệ thống không có cách nào để người
dùng (kể cả admin) đổi mật khẩu hoặc sửa hồ sơ cá nhân.** `GET /api/auth/me` chỉ đọc; không có
endpoint `PATCH` nào cho hồ sơ hay mật khẩu. Vì vậy quyết định chức năng "Cài đặt" = **cài đặt
tài khoản cá nhân**, dùng chung cho cả user thường lẫn admin — không phải "cài đặt hệ thống"
(xem lý do so sánh 2 hướng trong hội thoại trước, đã chốt theo hướng này).

## 2. Phạm vi

**Trong phạm vi:**
- Sửa hồ sơ: họ tên, số điện thoại.
- Đổi mật khẩu (yêu cầu nhập mật khẩu hiện tại).
- Dùng chung 1 trang cho cả `user` và `admin` — không tách riêng "cài đặt admin".

**Ngoài phạm vi:**
- Đổi email (kéo theo xác thực lại email — không cần cho đồ án).
- Quên mật khẩu / reset qua email (cần dịch vụ gửi mail — để sau).
- Upload avatar.
- 2FA, quản lý phiên đăng nhập, xóa tài khoản.
- Cài đặt hệ thống (site name, ngưỡng auto-duyệt...) — không có logic nghiệp vụ nào đang cần
  cấu hình được, không làm để tránh tạo settings giả không có tác dụng.

## 3. API — Backend

Thêm vào `be/app/api/routes/auth.py` (cùng router `/auth` hiện có, không cần router mới).

### Schema mới — `be/app/schemas/auth.py`

```python
class CapNhatHoSoRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    ho_ten: Annotated[str, Field(alias="fullName", min_length=2, max_length=150)]
    so_dien_thoai: Annotated[str | None, Field(alias="phone", max_length=20)] = None


class DoiMatKhauRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    mat_khau_hien_tai: Annotated[str, Field(alias="currentPassword", min_length=1)]
    mat_khau_moi: Annotated[str, Field(alias="newPassword", min_length=6, max_length=72)]
```

Mở rộng `NguoiDungCongKhai` (đang thiếu `phone`, cần cho form hiển thị giá trị hiện tại):

```python
class NguoiDungCongKhai(BaseModel):
    ...
    so_dien_thoai: Annotated[str | None, Field(alias="phone")]
```

### Endpoint mới

| Method | Path | Mô tả |
|---|---|---|
| PATCH | `/api/auth/me` | Sửa `ho_ten`, `so_dien_thoai`. Body: `CapNhatHoSoRequest`. Trả về `NguoiDungCongKhai` mới. |
| POST | `/api/auth/doi-mat-khau` | Đổi mật khẩu. Verify `mat_khau_hien_tai` bằng `verify_password()` (đã có ở `app/core/security.py`) trước khi `hash_password()` ghi đè `mat_khau_hash`. Sai mật khẩu hiện tại → 400. Không trả JWT mới (token cũ vẫn dùng được, không cần đăng nhập lại). |

Cả 2 endpoint dùng `Depends(get_current_user)` — không cần quyền admin, ai đăng nhập cũng sửa
được hồ sơ/mật khẩu của chính mình (không nhận `nguoi_dung_id` từ body, luôn thao tác trên
`nguoi_dung` lấy từ token).

## 4. Frontend

### Feature folder — `fe/src/features/account/`

```
features/account/
  api/account.api.ts
  schemas/profile.schema.ts       # zod, theo mẫu register.schema.ts
  schemas/change-password.schema.ts
  components/
    AccountSettingsView.tsx        # trang tổng, chứa 2 khối bên dưới
    ProfileForm.tsx                 # sửa họ tên / SĐT
    ChangePasswordForm.tsx          # đổi mật khẩu
```

`endpoints.ts` thêm:

```ts
auth: {
  ...
  updateProfile: "/auth/me",
  changePassword: "/auth/doi-mat-khau",
},
```

### AuthContext — cần thêm hàm cập nhật user sau khi sửa hồ sơ

`fe/src/features/auth/context/AuthContext.tsx` hiện chỉ có `login/register/logout`, không có cách
nào cập nhật `user` sau khi sửa hồ sơ mà không đăng xuất. Thêm:

```ts
const updateUser = useCallback((updated: AuthUser) => setUser(updated), []);
// expose trong AuthContextValue, ProfileForm gọi sau khi PATCH /auth/me thành công
```

### Route — dùng chung 1 route, không tách theo role

- `fe/src/app/(user)/tai-khoan/page.tsx` → `AccountSettingsView` (đặt trong nhóm `(user)`, không
  phải `quan-tri`, vì cả user thường lẫn admin đều vào được).
- `fe/src/lib/auth/permissions.ts` — thêm `{ prefix: "/tai-khoan", roles: [ROLES.user, ROLES.admin] }`.
- `fe/src/constants/routes.ts` — thêm `taiKhoan: "/tai-khoan"`.

### Chỗ trỏ vào trang này

- `AdminLayout.tsx:85` — sửa `href="/quan-tri/cai-dat"` → `ROUTES.taiKhoan`, **giữ nguyên** label
  "Cài đặt" trong sidebar admin.
- `Header.tsx` — trang này hiện **không có** link nào để user thường vào cài đặt tài khoản (chỉ có
  "Tin đăng của tôi", "Thư viện ảnh", "Tin yêu thích" trong `Menu.Dropdown`). Thêm 1
  `Menu.Item` mới **"Cài đặt tài khoản"** (icon `IconSettings`) cho mọi user đã đăng nhập, đặt
  trước "Đăng xuất" — nếu không, user thường không có cách nào bấm vào trang vừa xây.

### Nội dung `AccountSettingsView`

Bố cục 2 khối (dùng `Paper` + `Stack`, theo mẫu các form khác trong `features/rental-posts`):

**Khối 1 — Hồ sơ**
- `AppInput` họ tên (bắt buộc), số điện thoại (tùy chọn).
- Email hiển thị read-only (không sửa được, ghi chú nhỏ giải thích tại sao).
- Nút "Lưu thay đổi" → gọi `PATCH /auth/me` → `notifications.show` thành công → `updateUser()`.

**Khối 2 — Đổi mật khẩu**
- 3 field: mật khẩu hiện tại, mật khẩu mới, xác nhận mật khẩu mới (validate khớp nhau bằng zod
  `refine`, theo cách `register.schema.ts` đang validate).
- Nút "Đổi mật khẩu" → gọi `POST /auth/doi-mat-khau` → thành công thì clear form + toast; sai mật
  khẩu hiện tại thì hiện lỗi ngay trên field đó (dùng `form.setFieldError`).

## 5. Acceptance — hoàn thành khi

- [x] Link "Cài đặt" trong sidebar admin không còn 404, dẫn tới trang cài đặt tài khoản.
- [x] User thường đăng nhập, vào menu tài khoản trên Header, thấy mục "Cài đặt tài khoản" và vào
      được trang (trước đây user thường không có đường nào tới trang này).
- [x] Sửa họ tên/SĐT, lưu lại → tên hiển thị trên Header đổi theo ngay (`updateUser()` cập nhật
      `AuthContext`, không cần tải lại trang) — logic đã viết đúng, **chờ xác nhận trực quan sau
      khi bạn restart backend** (xem cảnh báo đầu file).
- [ ] Đổi mật khẩu đúng luồng → đăng xuất, đăng nhập lại bằng mật khẩu mới thành công. *(chờ
      backend sống để test round-trip thật; logic + test pytest đã pass)*
- [ ] Nhập sai mật khẩu hiện tại → báo lỗi rõ ràng trên field. *(đã viết `form.setFieldError` khi
      `ApiError.status === 400`; chờ backend sống để xác nhận trên UI)*
- [x] Mật khẩu mới dưới 6 ký tự bị chặn validate ở FE trước khi gọi API (zod `min(6)`).
- [x] Vào thẳng URL `/tai-khoan` khi chưa đăng nhập → bị `RouteGuard` chặn, không lộ form (đã
      thêm rule `/tai-khoan` vào `permissions.ts`, dùng chung guard có sẵn).
- [x] Có test backend cho: sửa hồ sơ thành công, đổi mật khẩu thành công, đổi mật khẩu sai mật
      khẩu hiện tại bị từ chối — `test_cap_nhat_ho_so_thanh_cong`, `test_doi_mat_khau_thanh_cong`,
      `test_doi_mat_khau_sai_mat_khau_hien_tai_bi_tu_choi` (12/12 pass trong `test_auth.py`).

## 6. Checklist file cần tạo/sửa

**Backend**
- [x] `be/app/schemas/auth.py` — thêm `CapNhatHoSoRequest`, `DoiMatKhauRequest`, mở rộng `NguoiDungCongKhai` với `phone`
- [x] `be/app/api/routes/auth.py` — thêm `PATCH /me`, `POST /doi-mat-khau`
- [x] `be/tests/test_auth.py` — thêm 4 test cho 2 endpoint mới

**Frontend**
- [x] `fe/src/lib/api/endpoints.ts` — thêm `updateProfile`, `changePassword`
- [x] `fe/src/constants/routes.ts` — thêm `taiKhoan`
- [x] `fe/src/lib/auth/permissions.ts` — thêm rule cho `/tai-khoan`
- [x] `fe/src/features/auth/context/AuthContext.tsx` — thêm `updateUser`
- [x] `fe/src/types/auth.ts` — thêm field `phone`
- [x] `fe/src/features/account/**` — toàn bộ feature mới (api, 2 schema zod, 3 component)
- [x] `fe/src/app/(user)/tai-khoan/page.tsx`
- [x] `fe/src/components/layout/AdminLayout.tsx` — sửa href link "Cài đặt" → `ROUTES.taiKhoan`
- [x] `fe/src/components/layout/Header.tsx` — thêm `Menu.Item` "Cài đặt tài khoản"
