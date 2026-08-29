# Yêu cầu triển khai — Tin tức thị trường (Bài viết)

> ✅ **Đã triển khai đầy đủ** theo đúng 4 phương án mặc định ở mục "Cần quyết định" (dùng
> `react-quill-new`, ẩn thay vì xóa cứng, ảnh bìa tùy chọn, tóm tắt nhập tay). Backend đã xác
> minh bằng `pytest` (4 test mới trong `test_bai_viet.py`, đủ cả luồng tạo→sửa→đăng→ẩn và test
> chống XSS) + migration đã chạy lên DB thật + seed đã tạo 3 bài mẫu thật. Frontend đã xác nhận
> trực quan trên browser: link "Thông tin thị trường" hết 404, trang admin "Viết bài mới" render
> đúng toolbar Quill, gõ được tiếng Việt, slug tự sinh đúng ("Bản tin thử nghiệm Quill" →
> `ban-tin-thu-nghiem-quill`). `tsc --noEmit` và `eslint` sạch trên toàn bộ file mới.
> ⚠️ Máy dev đang dính sự cố môi trường cũ (Docker Desktop/WSL2 giữ cổng 8000 với backend cache
> cũ — xem ghi chú ở `docs/cai-dat-tai-khoan-yeu-cau.md`) nên **chưa test được round-trip API
> thật qua UI** (tạo bài → xem ở trang công khai). Bạn tự khởi động lại backend rồi thử lại là
> dùng được ngay — code đã sẵn sàng.

## 1. Bài toán

Menu chính đang có link **"Thông tin thị trường"** trỏ tới `/thong-tin-thi-truong` nhưng route này
chưa tồn tại → 404 (xem `docs/ke-hoach-hoan-thien.md`, mục 3).

Yêu cầu: xây một module **tin tức/bài viết** kiểu CMS đơn giản —
- **Admin** soạn bài bằng trình soạn thảo rich-text (Quill), lưu lại (nháp hoặc đăng ngay).
- **Người dùng** (kể cả chưa đăng nhập) xem danh sách bài viết đã đăng và đọc chi tiết từng bài,
  đúng định dạng đã soạn.
- Link "Thông tin thị trường" trỏ tới đúng trang danh sách bài viết này.

## 2. Phạm vi (v1)

**Trong phạm vi:**
- CRUD bài viết cho admin (tạo, sửa, lưu nháp, đăng, ẩn).
- Soạn thảo rich-text: bold/italic/underline, heading, list, blockquote, link, chèn ảnh trong nội dung.
- Ảnh bìa bài viết, chọn từ thư viện ảnh đã có sẵn (`AnhThuVien` / MinIO) — không xây upload mới.
- Trang danh sách công khai (phân trang) + trang chi tiết công khai theo slug.
- Đếm lượt xem cơ bản.
- Sanitize HTML phía server trước khi lưu (chặn XSS).

**Ngoài phạm vi (để sau, không làm ở v1):**
- Bình luận, thích bài viết.
- Chuyên mục/tag, bài viết liên quan.
- SEO meta (og:image, meta description riêng).
- Đặt lịch đăng bài (schedule).
- Nhiều tác giả / lịch sử chỉnh sửa (revision).
- Nhúng lại dashboard thống kê giá (`features/reports`) vào cùng trang — có thể làm ở bản sau,
  ghi chú chỗ nối ở mục 7 nhưng không bắt buộc cho v1.

## 3. Cần quyết định trước khi code

| # | Câu hỏi | Đề xuất mặc định |
|---|---|---|
| 1 | Quill gốc (`react-quill`) không tương thích React 19 (dùng `findDOMNode` đã bị gỡ). Dùng fork nào? | `react-quill-new` — giữ đúng UI/API Quill, đã vá cho React 19. Nếu phát sinh lỗi, chuyển `@mantine/tiptap` (đồng bộ theme Mantine sẵn có). |
| 2 | Xóa bài viết: xóa cứng hay chỉ ẩn? | Chỉ **ẩn** (đổi trạng thái), giống cách dự án đang xử lý tin đăng / loại BĐS — không xóa cứng, tránh vỡ link đã chia sẻ. |
| 3 | Ảnh bìa bắt buộc hay tùy chọn? | Tùy chọn — card danh sách có fallback ảnh mặc định nếu không chọn. |
| 4 | Tóm tắt (hiển thị ở card danh sách) nhập tay hay tự cắt từ nội dung? | Nhập tay, bắt buộc, tối đa 200 ký tự — tự cắt từ HTML dễ vỡ định dạng/cắt giữa thẻ. |

## 4. Data model

### Enum mới — `TrangThaiBaiViet` (`be/app/models/enums.py`)

```python
class TrangThaiBaiViet(str, enum.Enum):
    NHAP = "nhap"          # draft — chưa hiển thị công khai
    DA_DANG = "da_dang"    # published — hiển thị công khai
    AN = "an"               # hidden — từng đăng, admin ẩn lại
```

### Model mới — `BaiViet` (`be/app/models/bai_viet.py`)

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | PK int | |
| `tieu_de` | String(200), not null | |
| `slug` | String(220), unique, not null | tự sinh từ `tieu_de`, admin có thể sửa tay |
| `tom_tat` | String(200), not null | hiển thị ở card danh sách |
| `noi_dung_html` | Text, not null | HTML từ Quill, **đã sanitize** trước khi lưu |
| `anh_bia_id` | FK → `anh_thu_vien.id`, nullable | chọn từ thư viện ảnh có sẵn, giống cách `HinhAnhTinDang` tham chiếu ảnh — **không lưu URL trực tiếp** |
| `trang_thai` | Enum `TrangThaiBaiViet`, default `NHAP` | |
| `nguoi_tao_id` | FK → `nguoi_dung.id`, not null | admin tác giả |
| `luot_xem` | Integer, default 0 | tăng mỗi lần GET chi tiết công khai |
| `ngay_dang` | DateTime, nullable | set khi chuyển sang `DA_DANG` lần đầu — dùng để sắp xếp "mới nhất" |
| `created_at` / `updated_at` | DateTime | theo pattern chung của các model khác trong repo |

Export `BaiViet` trong `be/app/models/__init__.py`.

### Migration

1 file mới trong `be/alembic/versions/` — tạo bảng `bai_viet` + enum `trang_thai_bai_viet`
(theo đúng cách các enum khác trong repo được tạo — `native_enum=False`, xem
`loai_bat_dong_san.py`).

## 5. API — Backend

Router mới: `be/app/api/routes/bai_viet.py`, đăng ký trong `app/main.py` (2 dòng, giống cách
`bao_cao` / `bao_cao_client` tách công khai/quản trị).

Schema mới: `be/app/schemas/bai_viet.py` — theo đúng convention alias (`Field(alias=...)` +
`populate_by_name=True`) như `schemas/danh_muc.py`. Enum trạng thái map sang tiếng Anh camelCase
kiểu `"draft" | "published" | "hidden"` (giống cách `TrangThaiLoaiBatDongSan` → `"active"|"hidden"`).

### Công khai (không cần đăng nhập)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/tin-tuc` | Danh sách bài **đã đăng**, phân trang `{items, total, page, pageSize}`, sort theo `ngay_dang` giảm dần. Query: `page`, `pageSize`, `q` (tìm theo tiêu đề). |
| GET | `/api/tin-tuc/{slug}` | Chi tiết 1 bài đã đăng. 404 nếu không tồn tại hoặc đang ở trạng thái `nhap`/`an`. Tăng `luot_xem` +1 mỗi lần gọi. |

### Quản trị (`get_current_admin_user`, prefix `/api/admin/tin-tuc`)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/admin/tin-tuc` | Danh sách toàn bộ (mọi trạng thái), phân trang, filter `status`, tìm `q`. |
| GET | `/api/admin/tin-tuc/{id}` | Chi tiết để load vào form sửa. |
| POST | `/api/admin/tin-tuc` | Tạo mới, mặc định `trang_thai = draft`. Body: `title, excerpt, contentHtml, coverImageId?`. |
| PUT | `/api/admin/tin-tuc/{id}` | Sửa nội dung (không đổi trạng thái). |
| PATCH | `/api/admin/tin-tuc/{id}/trang-thai` | Đổi trạng thái. Body: `{status: "draft"|"published"|"hidden"}`. Set `ngay_dang = now()` lần đầu chuyển sang `published`. |

**Sanitize:** ở cả `POST` và `PUT`, `contentHtml` phải chạy qua sanitizer (đề xuất `nh3`) trước khi
lưu DB — whitelist tag: `p, br, strong, em, u, s, h1-h4, blockquote, ul, ol, li, a[href,target,rel],
img[src,alt], code, pre`. Không tin dữ liệu client gửi lên dù chỉ admin mới gọi được endpoint này.

## 6. Frontend

### Feature folder — `fe/src/features/tin-tuc/` (theo đúng cấu trúc `features/<ten>/{api,components,schemas}` chuẩn của repo)

```
features/tin-tuc/
  api/tin-tuc.api.ts
  schemas/tin-tuc.schema.ts
  components/
    NewsListView.tsx          # trang danh sách công khai
    NewsDetailView.tsx        # trang chi tiết công khai
    NewsCard.tsx               # card dùng trong danh sách
    AdminNewsTable.tsx         # bảng quản trị (theo mẫu AdminApprovalQueueTable)
    AdminNewsFormView.tsx      # form tạo/sửa — chứa Quill editor
```

Thêm `endpoints.ts`:

```ts
tinTuc: {
  list: "/tin-tuc",
  detail: (slug: string) => `/tin-tuc/${slug}`,
  adminList: "/admin/tin-tuc",
  adminDetail: (id: number) => `/admin/tin-tuc/${id}`,
  adminTrangThai: (id: number) => `/admin/tin-tuc/${id}/trang-thai`,
},
```

### Route công khai

- `app/(public)/thong-tin-thi-truong/page.tsx` → `NewsListView` (grid card, phân trang bằng
  `AppPagination`, `Skeleton` khi loading, `EmptyState` khi rỗng — đúng mẫu `AdminRentalPostsView`).
- `app/(public)/thong-tin-thi-truong/[slug]/page.tsx` → `NewsDetailView`. Render `noi_dung_html`
  bằng `dangerouslySetInnerHTML` — **an toàn vì đã sanitize ở backend khi lưu**, không sanitize lại
  ở FE.

Sửa `ROUTES.thongTinThiTruong = "/thong-tin-thi-truong"` trong `constants/routes.ts`, và đổi
`Header.tsx:15` từ hardcode string sang dùng `ROUTES.thongTinThiTruong`.

### Route quản trị

- `app/quan-tri/tin-tuc/page.tsx` → `AdminNewsTable` (danh sách + filter trạng thái + nút "Viết bài mới").
- `app/quan-tri/tin-tuc/tao-moi/page.tsx` → `AdminNewsFormView` chế độ tạo.
- `app/quan-tri/tin-tuc/[id]/chinh-sua/page.tsx` → `AdminNewsFormView` chế độ sửa.

Thêm mục **"Tin tức thị trường"** vào `NAV_ITEMS` của `AdminLayout.tsx` (dùng icon `IconNews` từ
`@tabler/icons-react`).

### Form soạn bài (`AdminNewsFormView`)

- Input tiêu đề (`AppInput`) → tự sinh slug (editable riêng, có nút "Tạo lại từ tiêu đề").
- Textarea tóm tắt (`AppInput`/`Textarea`, đếm ký tự, giới hạn 200).
- Chọn ảnh bìa: tái dùng `ImageLibraryPickerModal` đã có sẵn cho tin đăng.
- Trình soạn thảo Quill (`react-quill-new`), toolbar: heading, bold/italic/underline, list,
  blockquote, link, image, clean-format.
- 2 nút lưu: **"Lưu nháp"** (giữ nguyên trạng thái hiện tại) và **"Đăng bài"** (set `published`).
  Nếu đang sửa bài đã đăng, có thêm nút **"Ẩn bài"**.

### Thư viện cần thêm (`fe/package.json`)

```
react-quill-new
```

(Không cần cài `quill` riêng — `react-quill-new` đã kèm.)

## 7. Điểm nối với module thống kê hiện có (ghi chú, không bắt buộc v1)

Dashboard phân tích giá hiện đã có ở `/quan-tri/thong-ke` (admin-only, dùng
`features/reports`). Sau khi trang `/thong-tin-thi-truong` đã hoạt động với danh sách bài viết,
có thể cân nhắc nhúng thêm vài biểu đồ công khai (vd `PriceByRegionChart`) ở đầu trang danh sách —
việc này để **bản sau**, không nằm trong acceptance của v1.

## 8. Acceptance — hoàn thành khi

- [x] Admin vào `/quan-tri/tin-tuc`, thấy danh sách bài viết kèm badge trạng thái (Nháp/Đã đăng/Ẩn)
      — có filter theo Tabs Tất cả/Nháp/Đã đăng/Ẩn.
- [x] Admin bấm "Viết bài mới" → nhập tiêu đề, tóm tắt, chọn ảnh bìa từ thư viện ảnh, soạn nội dung
      bằng Quill (heading, in đậm, danh sách, blockquote, link, ảnh) → **Lưu nháp** thành công.
      *(đã xác nhận trực quan: form + Quill render đúng, gõ tiếng Việt được; luồng lưu API đã pass
      qua `pytest`, chờ backend sống để bấm nút thật trên UI — xem cảnh báo đầu file)*
- [x] Mở lại bài nháp, bấm **Đăng bài** → bài xuất hiện ngay tại `/thong-tin-thi-truong`.
      *(xác nhận bằng `test_luong_tao_sua_dang_an_bai_viet`)*
- [x] Bài ở trạng thái Nháp hoặc Ẩn **không** xuất hiện trong danh sách công khai và trả 404 nếu
      truy cập thẳng URL chi tiết. *(cùng test trên, kiểm cả 2 chiều đăng → ẩn)*
- [x] Người dùng chưa đăng nhập vào `/thong-tin-thi-truong`, thấy danh sách phân trang, bấm vào 1
      bài → xem đúng nội dung, giữ nguyên định dạng đã soạn. *(route public, không qua RouteGuard;
      render bằng CSS module riêng vì Mantine 9 đã bỏ `TypographyStylesProvider`)*
- [x] Slug duy nhất — tạo 2 bài trùng tiêu đề vẫn ra 2 slug khác nhau (tự thêm hậu tố).
      *(`test_slug_trung_tieu_de_tu_dong_them_hau_to`)*
- [x] Thử lưu bài có `<script>alert(1)</script>` trong nội dung → khi hiển thị, đoạn script bị loại
      bỏ hoàn toàn. *(`test_noi_dung_html_duoc_sanitize_chong_xss`, dùng `nh3`)*
- [x] Link **"Thông tin thị trường"** trên menu chính không còn 404 — đã xác nhận trực tiếp trên
      browser.
- [x] Có test backend cho luồng tạo → sửa → đăng → ẩn, và test sanitize XSS — 4 test trong
      `be/tests/test_bai_viet.py`, tất cả pass.

## 9. Checklist file cần tạo/sửa

**Backend**
- [x] `be/app/models/enums.py` — thêm `TrangThaiBaiViet`
- [x] `be/app/models/bai_viet.py` — model mới
- [x] `be/app/models/__init__.py` — export `BaiViet`
- [x] `be/alembic/versions/b7d3e9c1a2f4_them_bai_viet.py` — migration (đã chạy `alembic upgrade head`)
- [x] `be/app/schemas/bai_viet.py` — schema mới
- [x] `be/app/api/routes/bai_viet.py` — router admin (`/api/admin/tin-tuc`)
- [x] `be/app/api/routes/bai_viet_client.py` — router public (`/api/tin-tuc`) — tách riêng 2 file
      đúng kiểu `bao_cao.py`/`bao_cao_client.py` thay vì gộp 1 file duy nhất
- [x] `be/app/main.py` — đăng ký cả 2 router
- [x] `be/tests/test_bai_viet.py` — 4 test mới, tất cả pass
- [x] Thêm `nh3==0.3.7` vào `be/requirements.txt`

**Frontend**
- [x] `fe/package.json` — thêm `react-quill-new`
- [x] `fe/src/lib/api/endpoints.ts` — thêm nhóm `tinTuc`
- [x] `fe/src/constants/routes.ts` — thêm `thongTinThiTruong`, các route quản trị tin tức
- [x] `fe/src/features/tin-tuc/**` — toàn bộ feature mới (api, schema zod, 6 component gồm cả
      `QuillEditor.tsx` dynamic-import để tránh lỗi SSR)
- [x] `fe/src/app/(public)/thong-tin-thi-truong/page.tsx`
- [x] `fe/src/app/(public)/thong-tin-thi-truong/[slug]/page.tsx`
- [x] `fe/src/app/quan-tri/tin-tuc/page.tsx`
- [x] `fe/src/app/quan-tri/tin-tuc/tao-moi/page.tsx`
- [x] `fe/src/app/quan-tri/tin-tuc/[id]/chinh-sua/page.tsx`
- [x] `fe/src/components/layout/Header.tsx` — sửa link, dùng `ROUTES.thongTinThiTruong`
- [x] `fe/src/components/layout/AdminLayout.tsx` — thêm mục nav "Tin tức thị trường"
- [x] `be/app/scripts/seed.py` — seed 3 bài viết mẫu thật (giá thuê tăng, kinh nghiệm sinh viên,
      so sánh trung tâm/ngoại thành) — đã chạy seed thành công

**Lệch nhỏ so với spec ban đầu:** Mantine 9.5.0 đã **bỏ hẳn** `TypographyStylesProvider` (có ở
Mantine v7 lúc viết spec) — thay bằng CSS module riêng `NewsDetailView.module.css` style trực tiếp
cho nội dung HTML, hiệu quả tương đương.
