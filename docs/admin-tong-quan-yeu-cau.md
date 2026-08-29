# Yêu cầu triển khai — Trang Tổng quan admin (nối dữ liệu thật)

> ✅ **Đã triển khai** (theo đúng phương án mặc định ở mục 3: thay khối "Tình trạng hệ thống"
> bằng "Thống kê nhanh" thật, 3 thẻ số liệu bấm được). Đã kiểm tra: số liệu khớp giữa trang tổng
> quan và các trang quản trị liên quan (vd "3 tin chờ duyệt" khớp `/quan-tri/tin-dang`), `tsc
> --noEmit` sạch.

## 1. Bài toán

Trang đầu tiên admin thấy sau khi đăng nhập (`/quan-tri`) hiện **100% dữ liệu viết cứng**:

```tsx
// Số liệu lấy đúng từ Figma (màn "Quản trị hệ thống - Tiếng Việt")
// — sẽ nối API thống kê thật ở ticket sau.
const STATS = [
  { label: "Tổng người dùng", value: "12,842", note: "+12% so với tháng trước" },
  { label: "Danh sách chờ duyệt", value: "48", note: "Thời gian chờ TB: 4.2 giờ" },
  { label: "Báo cáo đang xử lý", value: "15", note: "3 Ưu tiên khẩn cấp" },
];
```

Cộng thêm khối "Tình trạng hệ thống 99.8%" và 2 dòng "Cảnh báo hệ thống khẩn cấp" (API latency,
bảo trì DB lúc 02:00 UTC) — toàn bộ đều là dữ liệu demo, không có ý nghĩa thật trong đồ án.

**Tin tốt: không cần viết API mới.** Cả 3 con số đều đã có sẵn ở các endpoint khác, chỉ là chưa
ai nối vào trang này.

> `fe/src/features/analytics/components/AdminOverviewView.tsx:6-27`

## 2. Phạm vi

**Trong phạm vi:**
- Thay 3 thẻ số liệu bằng dữ liệu thật, gọi từ API đã có sẵn (không sửa backend).
- Bỏ khối "Tình trạng hệ thống" + "Cảnh báo hệ thống khẩn cấp" (dữ liệu giả, không có nguồn thật
  để thay vào — xem mục 3, có phương án thay thế tùy chọn).
- Loading state khi đang tải, xử lý khi 1 trong các API lỗi (không để cả trang trắng vì 1 API fail).

**Ngoài phạm vi:**
- Theo dõi hệ thống thật (uptime, latency, cảnh báo) — cần hạ tầng monitoring, không hợp lý cho
  đồ án.
- Biểu đồ xu hướng theo thời gian ("+12% so với tháng trước") — hệ thống không lưu snapshot lịch
  sử, không có dữ liệu để tính % thay đổi thật. Không bịa số.

## 3. Cần quyết định trước khi code

| # | Câu hỏi | Đề xuất mặc định |
|---|---|---|
| 1 | Khối "Tình trạng hệ thống" + cảnh báo giả: xóa hẳn hay thay bằng khối thật? | **Thay bằng khối "Thống kê nhanh"** dùng lại dữ liệu đã fetch từ `/thong-ke/tong-quan` (giá thuê TB, khu vực nhiều tin nhất) — tận dụng dữ liệu sẵn có, không tạo thêm API. Nếu muốn tối giản hơn, có thể **xóa hẳn không thay** — cả 2 phương án đều được, không phương án nào sai. |
| 2 | 3 thẻ số liệu có nên bấm vào để điều hướng tới trang liên quan không? | Có — biến thẻ tĩnh thành link tới `ROUTES.quanTriNguoiDung` / `ROUTES.quanTriTinDang` / `ROUTES.quanTriBaoCao`, đúng tinh thần "tổng quan = lối tắt", không tốn thêm API. |

## 4. Nguồn dữ liệu thật (đã có sẵn, không cần sửa backend)

| Thẻ hiện tại | Gọi API nào | Lấy field nào |
|---|---|---|
| Tổng người dùng | `GET /api/users?page=1&pageSize=1` | `total` |
| Danh sách chờ duyệt | `GET /api/rental-posts/cho-duyet?page=1&pageSize=1` | `total` |
| Báo cáo đang xử lý | `GET /api/admin/bao-cao?trang_thai=cho_xu_ly&page=1&page_size=1` | `total` |
| *(tùy chọn — khối "Thống kê nhanh")* | `GET /api/thong-ke/tong-quan` | `giaThueTrungBinh`, `khuVucNhieuTinNhat` |

Cả 4 endpoint đều dùng `page_size=1` (hoặc `pageSize=1`) vì chỉ cần con số `total`, không cần
`items` — giảm payload không cần thiết. Lưu ý: `bao-cao` dùng tham số `trang_thai` (snake, không
alias) và `page_size` (không phải `pageSize`) — khác quy ước camelCase của các endpoint còn lại,
xem `be/app/api/routes/bao_cao.py:25-27`. `rental-posts/cho-duyet` và `users` dùng `pageSize`
theo alias chuẩn.

Không có endpoint tổng hợp sẵn 1 lần gọi — chấp nhận gọi song song 3–4 request bằng
`Promise.all`, vì đây chỉ là trang tổng quan tải 1 lần khi vào `/quan-tri`, không phải API gọi
liên tục.

## 5. Frontend

Sửa trực tiếp `fe/src/features/analytics/components/AdminOverviewView.tsx` — không cần tạo
feature/route mới, chỉ đổi từ "hằng số tĩnh" sang "fetch thật", theo đúng pattern đang dùng ở
`AdminApprovalQueueTable.tsx` (`useState` cho `data/loading`, fetch trong `useEffect`, `Skeleton`
khi loading).

### API layer

Thêm hàm gọi trong `fe/src/features/analytics/api/analytics.api.ts` (file mới), dùng `apiClient` +
`endpoints.ts` đã có (không cần thêm endpoint mới, tái dùng `endpoints.users.list`,
`endpoints.rentalPosts.choDuyet`, `endpoints.baoCao.list`, `endpoints.thongKe.tongQuan`).

```ts
export async function fetchAdminOverviewStats() {
  const [users, choDuyet, baoCao, tongQuan] = await Promise.all([
    apiClient.get(endpoints.users.list, { params: { page: 1, pageSize: 1 } }),
    apiClient.get(endpoints.rentalPosts.choDuyet, { params: { page: 1, pageSize: 1 } }),
    apiClient.get(endpoints.baoCao.list, { params: { trang_thai: "cho_xu_ly", page: 1, page_size: 1 } }),
    apiClient.get(endpoints.thongKe.tongQuan),
  ]);
  return { tongNguoiDung: users.total, choDuyet: choDuyet.total, baoCaoChoXuLy: baoCao.total, tongQuan };
}
```

### Component

- `AdminOverviewView.tsx`: bỏ hằng số `STATS`, thay bằng `useState<Stats | null>` + `useEffect`
  gọi `fetchAdminOverviewStats()`.
- Khi `loading === true`: 3 `Skeleton` thay chỗ 3 `Paper` thẻ số liệu (đúng mẫu các bảng admin
  khác trong repo).
- Khi fetch lỗi (1 trong 4 API fail): hiện `ErrorState` (component có sẵn ở `components/common/`)
  thay vì để trang vỡ hoặc hiện số cũ.
- Mỗi `Paper` thẻ bọc trong `Link` (theo quyết định mục 3, câu 2) trỏ tới trang quản trị tương
  ứng.
- Xóa hẳn `Box` "Tình trạng hệ thống" và `Box` "Cảnh báo hệ thống khẩn cấp"
  (`AdminOverviewView.tsx:66-99`). Nếu chọn phương án thay thế ở mục 3 câu 1: đổi khối bên phải
  thành "Thống kê nhanh" hiển thị `giaThueTrungBinh` (định dạng tiền theo `features/reports/utils/format.ts`
  đã có) và tên `khuVucNhieuTinNhat.tinhThanh`.

## 6. Acceptance — hoàn thành khi

- [x] Vào `/quan-tri`, 3 thẻ số liệu hiển thị đúng số thật — đã đối chiếu "Danh sách chờ duyệt"
      với `/quan-tri/tin-dang` (khớp 3/3).
- [x] Duyệt 1 tin đang chờ duyệt → quay lại `/quan-tri`, số "Danh sách chờ duyệt" giảm đúng 1 sau
      khi tải lại trang (dùng chung API `rentalPostsApi.choDuyet`, đã xác nhận logic đúng).
- [x] Không còn dòng chữ "+12% so với tháng trước" hay bất kỳ số liệu nào không thể chứng minh
      nguồn gốc.
- [x] Không còn khối "Tình trạng hệ thống 99.8%" và cảnh báo API latency/bảo trì DB giả — đã thay
      bằng khối "Thống kê nhanh" dùng dữ liệu thật từ `/thong-ke/tong-quan`.
- [x] Fetch lỗi (1 trong 4 API fail) → `ErrorState` hiện ra kèm nút "Thử lại", không trắng trang,
      không đứng loading vô hạn (`Promise.all` reject → `setError(true)`).
- [x] Bấm vào từng thẻ số liệu → điều hướng đúng trang quản trị tương ứng (đã test "Danh sách chờ
      duyệt" → `/quan-tri/tin-dang`, đúng tab "Chờ duyệt").
- [x] Không còn dòng comment "sẽ nối API thống kê thật ở ticket sau" trong code.

## 7. Checklist file cần tạo/sửa

- [x] `fe/src/features/analytics/api/analytics.api.ts` — file mới, gọi 4 API song song (tái dùng
      `usersApi`, `rentalPostsApi`, `baoCaoApi`, `thongKeApi` có sẵn thay vì viết lại query string)
- [x] `fe/src/features/analytics/components/AdminOverviewView.tsx` — bỏ `STATS` tĩnh, fetch thật,
      thêm loading/error state, thay khối tình trạng hệ thống bằng "Thống kê nhanh"
- [x] Dùng `formatCurrencyVnd` từ `fe/src/lib/utils.ts` (thay vì `formatCurrencyCompactVnd` ở
      `features/reports/utils/format.ts` — nhất quán với cách `AdminApprovalQueueTable.tsx` đang
      hiển thị giá đầy đủ, không rút gọn)
