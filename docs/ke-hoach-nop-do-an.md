# Kế hoạch nộp đồ án — Kỹ thuật lập trình Python (UrbanLease)

> File check-list dùng để làm dần. Cập nhật trạng thái bằng cách tick `[x]` hoặc sửa trực tiếp
> nội dung bên dưới. Dựa trên bảng tiêu chí thầy giao (6 mục) + hiện trạng repo tính đến 31/08/2026.

## Tổng quan tiêu chí thầy giao

| Tiêu chí | Yêu cầu | Trạng thái hiện tại |
|---|---|---|
| Source code / Input-Dataset | — | ✅ Đã có (repo + seed data) |
| Report (docx) | Dưới 20 trang | 🟡 Bản nháp xong (outputs/BaoCao_UrbanLease.docx, 18 trang) |
| Khai báo sử dụng AI | prompt, md, skill | ✅ Đã có (docs/khai-bao-su-dung-ai.md) |
| Slide | 10 trang | ✅ Đã có (outputs/Slide_UrbanLease.pptx, 10 trang) |
| Demo | Trực tiếp hoặc video | 🟡 Đã có kịch bản (outputs/kich-ban-demo.md, 10 phút) — chưa quay |
| Git | Lịch sử commit | ✅ Đã có (41 commit, 4 thành viên) |

Thứ tự đề xuất: **Report → Slide → Khai báo AI → Kịch bản Demo → double-check Git**
(Slide và Khai báo AI rút gọn/tham chiếu lại từ Report nên làm Report trước sẽ nhanh hơn).
Còn lại: Khai báo AI, kịch bản Demo, double-check Git.

---

## 1. Source code / Input-Dataset

- [x] Repo GitHub: `https://github.com/25410197/ky-thuat-lap-trinh-python`
- [x] Dataset mẫu: `be/app/scripts/seed.py` — sinh tài khoản admin/thành viên, loại BĐS,
      tiện ích, tỉnh/quận/phường, ~40 tin đăng mẫu (an toàn chạy lại nhiều lần).
- [ ] Quyết định hình thức nộp: link repo hay export .zip?
- [ ] Nếu export zip: nhớ loại `node_modules/`, `.venv/`, `.next/` trước khi nén (dung lượng lớn,
      không cần thiết vì có thể cài lại từ `requirements.txt` / `package.json`).
- [ ] Kiểm tra `.env` thật không bị commit nhầm (chỉ có `.env.example`).

## 2. Report (docx, dưới 20 trang)

> 🟡 Đã có bản nháp: `outputs/BaoCao_UrbanLease.docx` (18 trang, theo đúng mẫu
> `template/UIT_Phu-luc-3_Mau-bao-cao.docx`). Sơ đồ ERD + Class Diagram bản gốc (.drawio, dễ
> chỉnh sửa) nằm ở `outputs/so-do/`.
>
> Đã bỏ theo yêu cầu: mục "Kiểm thử tự động" và "Kết quả đạt được và hạn chế" (Bảng 3.1, 3.2) —
> thay bằng **2.5 Bảo mật và phân quyền** (JWT, hash mật khẩu, phân quyền 2 tầng, sanitize XSS)
> và **3.3 Quy trình phát triển nhóm** (mô hình nhánh Git, Pull Request, quy ước commit) để bù
> lại độ chi tiết.
>
> Việc còn lại trước khi nộp:
> - [ ] Điền tên Khoa, Ngành, tên giảng viên, tên + MSSV 2 thành viên còn thiếu ở trang bìa
> - [ ] Điền "Phần đảm nhận" từng thành viên ở Bảng 1.1
> - [ ] Chụp ảnh màn hình thật thay cho 4 chỗ "[ Chèn ảnh chụp màn hình tại đây ]" ở Chương 3
> - [ ] Mở file trong Word → chọn Mục lục → References > Table of Contents > Update Table để
>   số trang khớp chính xác
> - [ ] Có thể mở 2 file `.drawio` trong outputs/so-do/ bằng app.diagrams.net (draw.io) nếu muốn
>   chỉnh sơ đồ rồi export lại ảnh PNG đè vào report

Nguyên liệu có sẵn trong `docs/`:
- `yêu cầu.md` — đề bài gốc (3 nhóm chức năng: khách/user/admin + bonus phân tích giá)
- `ke-hoach-hoan-thien.md` — đối chiếu đề bài vs. hiện trạng, review kiến trúc, các lỗi đã fix
- `db.pdf` — ERD
- `admin-tong-quan-yeu-cau.md`, `cai-dat-tai-khoan-yeu-cau.md`, `tin-tuc-thi-truong-yeu-cau.md`,
  `trang-chu-noi-bat-yeu-cau.md`, `tro-giup-yeu-cau.md` — mô tả chi tiết từng tính năng

Cấu trúc report thực tế đã viết (18 trang):
- [x] Mở đầu: lý do chọn đề tài, mục tiêu & phạm vi, bố cục báo cáo
- [x] Chương 1: bài toán/mục tiêu, phân công thành viên, đối tượng & phạm vi chức năng, công nghệ
      sử dụng
- [x] Chương 2: yêu cầu chức năng chi tiết, kiến trúc hệ thống (kèm sơ đồ), thiết kế CSDL (ERD +
      Class Diagram), thiết kế API tiêu biểu, bảo mật & phân quyền
- [x] Chương 3: môi trường triển khai, kết quả từng nhóm chức năng (kèm chỗ chèn ảnh chụp màn
      hình), quy trình phát triển nhóm (Git)
- [x] Kết luận, Tài liệu tham khảo
- [x] (Đã bỏ theo yêu cầu: mục Kiểm thử tự động, Kết quả đạt được & hạn chế, Hướng phát triển
      tiếp theo — không cần cho báo cáo môn học trong 20 trang)

## 3. Khai báo sử dụng AI (prompt, md, skill)

> ✅ Đã hoàn thành: `docs/khai-bao-su-dung-ai.md`

- [x] Liệt kê công cụ AI đã dùng trong quá trình làm đồ án (vd Claude Code / Cowork, ChatGPT...)
- [x] Liệt kê các file `.md` trong `docs/` được soạn có hỗ trợ AI (7 file hiện có trong `docs/`)
- [x] Trích 1 vài prompt tiêu biểu đã dùng (vd: sinh docs yêu cầu tính năng, review code, viết seed
      script...) — kèm mục đích dùng
- [x] Nêu rõ phần nào do người viết, phần nào AI hỗ trợ (tránh khai gộp chung)
- [x] Format gợi ý: bảng "Mục đích | Công cụ | Prompt rút gọn | Output dùng ở đâu"

## 4. Slide thuyết trình (10 trang)

> ✅ Đã xong: `outputs/Slide_UrbanLease.pptx` (10 trang, khổ 16:9), màu chủ đạo terracotta/sage,
> có icon minh họa mỗi slide, 2 sơ đồ (kiến trúc + ERD) chèn trực tiếp làm ảnh. Bỏ slide riêng
> về quy trình Git (thừa, không cần thiết cho slide) — thay bằng 2 slide chức năng chi tiết hơn
> (Quản trị viên riêng, Điểm cộng riêng) để tập trung vào chức năng thay vì quy trình làm việc.
> Không có screenshot thật (chưa có ảnh chụp màn hình) — nếu muốn thay bằng ảnh thật thì thêm
> sau ở Trang 7-9 (khung card hiện đang trình bày bằng icon + bullet).

- [x] Trang 1: Trang bìa — UrbanLease, thành viên, giảng viên
- [x] Trang 2: Vấn đề & Mục tiêu
- [x] Trang 3: Đối tượng người dùng & phạm vi chức năng (khách/user/admin)
- [x] Trang 4: Công nghệ sử dụng (tech stack)
- [x] Trang 5: Kiến trúc hệ thống (kèm sơ đồ)
- [x] Trang 6: Thiết kế cơ sở dữ liệu (kèm sơ đồ ERD)
- [x] Trang 7: Chức năng chính — Khách & Người dùng
- [x] Trang 8: Chức năng chính — Quản trị viên (quản lý nội dung/người dùng, thống kê)
- [x] Trang 9: Chức năng bổ sung — Điểm cộng (dashboard giá thuê, Tin tức thị trường)
- [x] Trang 10: Kết luận + Cảm ơn + Q&A

## 5. Demo (trực tiếp hoặc video)

> 🟡 Đã có kịch bản chi tiết, bám sát 10 phút: `outputs/kich-ban-demo.md` — 6 phần theo mốc thời
> gian (Mở đầu 0:40 → Khách 2:00 → User 2:30 → Admin 2:30 → Điểm cộng 1:40 → Kết 0:40), có lời
> thoại gợi ý và danh sách chuẩn bị dữ liệu/tài khoản trước khi quay.

- [x] Viết kịch bản demo theo 3 luồng + điểm cộng, đúng khung 10 phút
- [ ] Chuẩn bị dữ liệu/tài khoản test theo checklist đầu file `kich-ban-demo.md` (seed lại, tài
      khoản admin/user/tài khoản phụ, ảnh mẫu, 1 tin chờ duyệt + 1 tin bị báo cáo sẵn)
- [ ] Quay từng đoạn theo kịch bản rồi dựng lại
- [ ] Quay video dự phòng hoàn chỉnh (phòng khi demo trực tiếp lỗi mạng/server)

## 6. Git — lịch sử commit

- [x] 41 commit trên nhiều nhánh feature (`core-01`, `core-02`, `auth-01-02`, `quan-ly-danh-muc`,
      `thong-ke`, `upload-file-to-minio`...), có PR đã merge
- [x] 4 thành viên đóng góp: Tô Minh Hải (25410197), Nguyễn Minh Anh (25410173),
      EirlysTran281 (25410323), và thành viên dùng email nguyentien1668@gmail.com
- [ ] Kiểm tra nhánh `main` đã merge đủ tính năng mới nhất (nhất là nhánh `improve-ui-ux` hiện tại
      đang checkout) trước khi nộp
- [ ] Push tất cả nhánh/PR còn dở lên remote để lịch sử commit đầy đủ khi thầy xem

