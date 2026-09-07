 # Khai báo sử dụng AI trong Đồ án Kỹ thuật Lập trình Python

> **Đề tài:** UrbanLease
> **Môn học:** Kỹ thuật lập trình Python

**Kính gửi thầy,**

Trong quá trình thực hiện đồ án **UrbanLease**, đặc biệt là phần Backend (BE), nhóm chúng em có sử dụng một số công cụ AI để hỗ trợ trong quá trình lập trình. AI được sử dụng chủ yếu để tham khảo cách xử lý vấn đề, tìm và sửa lỗi, hỗ trợ viết một số đoạn code lặp lại và hoàn thiện tài liệu của dự án.

Nhóm chúng em vẫn tự thực hiện việc phân tích yêu cầu, xác định luồng nghiệp vụ, thiết kế cơ sở dữ liệu và đưa ra các quyết định về kiến trúc của hệ thống. Những đoạn code có sử dụng AI hỗ trợ đều được thành viên trong nhóm kiểm tra và chỉnh sửa trước khi đưa vào dự án.

---

## 1. Các công cụ AI đã sử dụng

Trong quá trình làm Backend, nhóm có sử dụng các công cụ sau:

* **ChatGPT (OpenAI) / Claude (Anthropic)**

  * Hỏi về cách xử lý lỗi.
  * Tham khảo cách viết code với FastAPI, SQLAlchemy và Pydantic.
  * Hỗ trợ viết và trình bày tài liệu Markdown.

* **Claude Code / Cursor**

  * Hỗ trợ đọc và giải thích source code.
  * Phân tích một số câu query SQLAlchemy phức tạp.
  * Tìm lỗi và đề xuất cách cải thiện code.

* **GitHub Copilot**

  * Hỗ trợ autocomplete trong quá trình viết code.
  * Chủ yếu sử dụng khi định nghĩa Model, Schema và các đoạn code có tính lặp lại.

---

## 2. Phần nhóm tự thực hiện và phần AI hỗ trợ

### 2.1. Phần nhóm tự thực hiện

Các phần liên quan đến nghiệp vụ và thiết kế chính của hệ thống do nhóm tự phân tích và thống nhất, bao gồm:

* Phân tích yêu cầu của đề tài.
* Xây dựng ERD và flowchart cho các chức năng.
* Thiết kế cơ sở dữ liệu và mối quan hệ giữa các bảng.
* Lựa chọn kiến trúc tổng thể của Backend với:

  * FastAPI
  * PostgreSQL
  * MinIO
  * Routes / Services / Repositories
* Xây dựng cơ chế đăng nhập, JWT và phân quyền theo Role.
* Cấu hình môi trường Docker.
* Quản lý source code bằng Git.
* Kiểm tra API thông qua Swagger UI.
* Review code trước khi merge.

### 2.2. Phần AI hỗ trợ

AI được sử dụng chủ yếu cho các công việc hỗ trợ kỹ thuật, giúp giảm thời gian xử lý những phần lặp lại hoặc tìm nguyên nhân của lỗi, bao gồm:

* Viết script tạo dữ liệu mẫu (seed data).
* Tham khảo cách viết các query SQLAlchemy có sử dụng:

  * `join()`
  * `group_by()`
  * `case()`
* Hỗ trợ tìm và xử lý một số lỗi cấu hình:

  * CORS Middleware.
  * Alembic `env.py`.
  * Cấu hình kết nối MinIO.
* Hỗ trợ định dạng và trình bày các file Markdown.

---

## 3. Cách nhóm sử dụng AI

### 3.1. Hỗ trợ viết và định dạng Markdown

Nhóm có sử dụng AI để hỗ trợ trình bày một số tài liệu trong thư mục `docs/`.

Trước khi sử dụng AI, nhóm tự xác định nội dung cần có, các yêu cầu và những thông tin chính của từng chức năng. Sau đó AI được sử dụng để hỗ trợ sắp xếp nội dung, tiêu đề, bảng biểu và định dạng Markdown.

Một số file có sử dụng hỗ trợ:

1. `yêu cầu.md` *(nếu có)*
2. `ke-hoach-hoan-thien.md`
3. `admin-tong-quan-yeu-cau.md`
4. `cai-dat-tai-khoan-yeu-cau.md`
5. `tin-tuc-thi-truong-yeu-cau.md`
6. `trang-chu-noi-bat-yeu-cau.md`
7. `tro-giup-yeu-cau.md`

> Nội dung và yêu cầu nghiệp vụ của các tài liệu trên do nhóm xác định. AI chủ yếu hỗ trợ cách trình bày và định dạng.

---

### 3.2. Cách nhóm sử dụng AI khi lập trình

Nhóm không sử dụng AI để tạo toàn bộ hệ thống rồi đưa trực tiếp vào dự án. Thông thường, nhóm chia nhỏ vấn đề và sử dụng AI cho từng phần cụ thể.

Ví dụ, với chức năng quản lý tin đăng, nhóm sẽ tự xác định Model, Schema và yêu cầu nghiệp vụ trước. Sau đó mới sử dụng AI để hỗ trợ một phần cụ thể, chẳng hạn như cách viết hàm lấy danh sách tin đăng có phân trang và lọc theo trạng thái.

Khi gặp lỗi, nhóm cung cấp các thông tin liên quan như:

* Đoạn code đang gặp vấn đề.
* Cấu trúc bảng hoặc Model liên quan.
* Log lỗi.
* Kết quả mong muốn.

Sau khi nhận được hướng xử lý từ AI, thành viên trong nhóm sẽ kiểm tra lại và điều chỉnh cho phù hợp với code hiện tại.

Ngoài ra, nhóm cũng kiểm tra lại những đoạn code được AI gợi ý. Trong quá trình thực hiện, có trường hợp AI đề xuất cú pháp SQLAlchemy phiên bản cũ. Khi đó nhóm kiểm tra lại tài liệu chính thức và chỉnh sửa sang cú pháp SQLAlchemy 2.0 trước khi sử dụng.

---

## 4. Một số Prompt đã sử dụng

Dưới đây là một số ví dụ về các prompt đã được nhóm sử dụng trong quá trình phát triển:

### 4.1. Tạo dữ liệu mẫu
- **Công cụ:** Claude
- **Sử dụng tại:** `be/app/scripts/seed.py`
- **Prompt tham khảo:**
  > "Viết script Python dùng SQLAlchemy để tạo dữ liệu mẫu cho các bảng tỉnh/thành, quận/huyện, phường/xã. Script có thể chạy nhiều lần mà không tạo dữ liệu trùng."

### 4.2. Review và tối ưu query
- **Công cụ:** Claude Code / Cursor
- **Sử dụng tại:** `be/app/api/routes/thong_ke.py`
- **Prompt tham khảo:**
  > "Kiểm tra đoạn code thống kê tin đăng theo khu vực này. Hiện tại có khả năng xảy ra N+1 query, hãy đề xuất cách viết lại bằng join() và group_by() theo SQLAlchemy 2.0."

### 4.3. JWT và phân quyền
- **Công cụ:** Copilot
- **Sử dụng tại:** `be/app/core/security.py`
- **Prompt tham khảo:**
  > "Viết hàm tạo JWT Access Token bằng PyJWT, thời gian hết hạn lấy từ config và nhận user_id kiểu int."

### 4.4. Cấu hình MinIO
- **Công cụ:** ChatGPT
- **Sử dụng tại:** `be/app/core/minio_client.py`
- **Prompt tham khảo:**
  > "Tôi đang sử dụng thư viện MinIO bằng Python. Hãy hướng dẫn cách khởi tạo kết nối và kiểm tra, tạo bucket urbanlease nếu bucket chưa tồn tại."

### 4.5. Docker
- **Công cụ:** ChatGPT
- **Sử dụng tại:** `infra/compose.yaml`
- **Prompt tham khảo:**
  > "Tạo file docker-compose gồm các service BE, PostgreSQL và MinIO. PostgreSQL có healthcheck và BE chỉ chạy khi PostgreSQL đã sẵn sàng."

---

## 5. Kiểm tra và sử dụng kết quả từ AI

Các kết quả do AI đề xuất không được sử dụng trực tiếp mà chưa qua kiểm tra.

Nhóm thực hiện các bước:

1. Xem xét vấn đề và xác định yêu cầu cần giải quyết.
2. Sử dụng AI để tham khảo hướng xử lý hoặc đoạn code phù hợp.
3. Đọc và hiểu đoạn code được đề xuất.
4. Kiểm tra lại với tài liệu chính thức của thư viện khi cần thiết.
5. Chạy thử và kiểm tra kết quả.
6. Chỉnh sửa lại code để phù hợp với kiến trúc và yêu cầu của dự án.

Đặc biệt, với các thư viện như **FastAPI, SQLAlchemy, Pydantic và PyJWT**, nhóm kiểm tra lại cách sử dụng API và phiên bản thư viện trước khi đưa code vào dự án.

---

## 6. Cam kết của nhóm

Nhóm chúng em xin khai báo rõ việc sử dụng AI trong quá trình thực hiện đồ án.

AI được sử dụng như một công cụ hỗ trợ trong quá trình học tập và phát triển, chủ yếu ở các công việc như tham khảo cách xử lý, debug, viết code lặp lại và trình bày tài liệu.

Nhóm vẫn chịu trách nhiệm kiểm tra, hiểu và chỉnh sửa những nội dung được AI hỗ trợ trước khi sử dụng trong dự án.

Các quyết định về **nghiệp vụ, thiết kế cơ sở dữ liệu, kiến trúc hệ thống và cách triển khai chính của UrbanLease** do các thành viên trong nhóm tự thảo luận và thực hiện.

**Nhóm chúng em xin cảm ơn thầy đã đọc phần khai báo này.**
