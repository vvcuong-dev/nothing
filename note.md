# Tổng hợp ôn tập phỏng vấn

---

## 1. Mô hình runtime của JS (Callstack + Web API + Callback Queue + Event Loop)

Luồng chạy thực tế:

- Code chạy trong callstack trước — chạy hết các dòng đồng bộ từ trên xuống.
- Khi gặp các hàm bất đồng bộ (`setTimeout`, `fetch`, event listener...) thì được gửi xuống Web API để xử lý.
- Khi Web API hoàn thành công việc, nó đẩy callback function vào Callback Queue.
- Event Loop kiểm tra callstack, nếu callstack trống thì lấy callback function ra chạy.

**Lưu ý: 2 loại queue và thứ tự ưu tiên**

- **Microtask Queue**: ưu tiên hơn, chứa các Promise callback và `process.nextTick` (Node.js).
- **Macrotask Queue**: chứa các callback từ `setTimeout`, `setInterval`, I/O, UI rendering...

**Quy tắc ưu tiên**: mỗi khi callstack rỗng, event loop sẽ:

1. Chạy hết toàn bộ Microtask Queue trước (kể cả khi trong lúc chạy 1 microtask có thêm microtask mới được thêm vào queue, chạy đến khi queue rỗng hẳn).
2. Sau khi Microtask Queue rỗng, event loop mới lấy **1** callback từ Macrotask Queue để chạy.
3. Chạy xong 1 macrotask, quay lại bước 1 — kiểm tra Microtask Queue trước khi lấy macrotask tiếp theo.

---

## 2. JS Bất đồng bộ (Asynchronous)

**Q1: Callback, Promise, Async/Await là gì? Khác nhau ra sao?**

- **Callback**: hàm truyền vào để gọi lại sau khi tác vụ xong → dễ dẫn đến "callback hell", khó đọc, khó quản lý.
- **Promise**: đối tượng đại diện cho 1 giá trị có thể có trong tương lai, có 3 trạng thái: `pending`, `fulfilled`, `rejected`. Có thể chain bằng `.then()`/`.catch()`. Dễ đọc hơn callback nhưng vẫn có thể gây "promise hell" nếu chain quá nhiều.
  - `fulfilled`: tác vụ thành công, lấy giá trị trả về bằng `.then()`.
  - `rejected`: tác vụ thất bại, lấy lý do bằng `.catch()`.
  - `pending`: đang chờ xử lý, chưa có kết quả.
- **Async/Await**: cú pháp của ES2017 (ES8), giúp viết code bất đồng bộ như code đồng bộ. `async function` luôn trả về 1 Promise; `await` chỉ dùng được trong `async function`, giúp chờ Promise resolve trước khi chạy tiếp. Tránh callback hell/promise hell, nhưng cần bắt lỗi bằng `try/catch`.

**Q2: `Promise.all`, `Promise.race`, `Promise.allSettled`, `Promise.any` khác nhau như thế nào?**

| Phương thức   | Resolve khi nào              | Reject khi nào                      | Kết quả trả về                |
| ------------- | ---------------------------- | ----------------------------------- | ----------------------------- |
| `Promise.all` | Tất cả promise đều fulfilled | Có **1** promise reject (fail-fast) | Mảng kết quả theo đúng thứ tự |
|               |

---

## 3. TypeScript

**Q1: TypeScript giải quyết vấn đề gì so với JS thuần?**

- Thêm kiểm tra kiểu dữ liệu lúc biên dịch (compile-time), giúp bắt lỗi sớm trước khi chạy, tăng khả năng đọc hiểu/bảo trì code, hỗ trợ OOP tốt hơn, giúp phát triển ứng dụng lớn dễ dàng hơn.

**Q2: Interface và Type khác nhau như thế nào?**

- **Interface**: định nghĩa kiểu cho object, class, function. Có thể `extends` và `implement`. Có thể **merge** nhiều interface cùng tên (declaration merging).
- **Type**: định nghĩa kiểu cho object, class, function, union, intersection. Không `extends`/`implement` trực tiếp (nhưng có thể dùng intersection `&` để "kế thừa"). Không merge được nhiều type cùng tên.
- ⇒ Interface dễ mở rộng hơn (đặc biệt cho object/class), Type linh hoạt hơn (đặc biệt cho union, tuple, kiểu nguyên thủy).

```ts
// Interface
interface Person {
  name: string;
  age: number;
}
interface Employee extends Person {
  salary: number;
}

// Type
type Person = {
  name: string;
  age: number;
};
type Employee = Person & {
  salary: number;
};
```

**Q3: Generic là gì? Khi nào nên dùng?**

- Generic giúp viết code tái sử dụng mà vẫn giữ kiểu dữ liệu an toàn, thay vì dùng `any`.

```ts
function getFirst<T>(arr: T[]): T {
  return arr[0];
}
getFirst<number>([1, 2, 3]); // 1
getFirst<string>(["a", "b", "c"]); // 'a'
```

---

## 4. NestJS

**Q1: Middleware, Guard, Interceptor, Pipe khác nhau thế nào? Thứ tự thực thi?**

Thứ tự: `Middleware → Guard → Interceptor (trước) → Pipe → Controller → Interceptor (sau) → Exception Filter (nếu có lỗi)`

- **Middleware**: xử lý request thô (logging, CORS...), chạy trước khi vào routing của Nest.
- **Guard**: kiểm tra quyền truy cập (authentication/authorization), trả về `boolean` — `false` thì chặn request lại (thường ném `403 Forbidden`).
- **Interceptor**: bọc quanh cả handler — có thể chạy logic **trước và sau** khi controller xử lý (log thời gian thực thi, transform response, cache...).
- **Pipe**: validate/transform dữ liệu đầu vào **ngay trước** khi vào controller; nếu không hợp lệ thì `throw` exception (thường `BadRequestException`).
- **Exception Filter**: bắt lỗi xảy ra ở bất kỳ bước nào trong chuỗi trên và trả về response lỗi định dạng thống nhất.

---

## 5. MySQL

**Q1: Index là gì? Khi nào nên và không nên dùng?**

- Index giúp tăng tốc truy vấn bằng cách tạo cấu trúc dữ liệu (thường là B+Tree) để tìm kiếm nhanh hơn thay vì quét toàn bảng. Tuy nhiên index làm chậm thao tác ghi (insert/update/delete) vì phải cập nhật lại index, và tốn thêm dung lượng lưu trữ.
- **Nên** đánh index cho cột dùng nhiều trong `WHERE`, `JOIN`, `ORDER BY`, `GROUP BY`.
- **Không nên** đánh index cho: bảng có ít dữ liệu, cột có độ chọn lọc thấp (nhiều giá trị trùng lặp, ví dụ cột `gender`), hoặc cột bị ghi/update liên tục.

**Q3: Phân biệt INNER JOIN, LEFT JOIN, RIGHT JOIN?**

- **INNER JOIN**: chỉ trả về bản ghi có giá trị khớp ở cả 2 bảng.
- **LEFT JOIN**: trả về toàn bộ bản ghi bảng trái + bản ghi khớp bên phải (không khớp thì `NULL`).
- **RIGHT JOIN**: ngược lại LEFT JOIN — toàn bộ bảng phải + bản ghi khớp bên trái.

---

## 6. Redis

**Q1: Redis là gì? Dùng để làm gì trong hệ thống thực tế?**

- Redis là cơ sở dữ liệu NoSQL dạng key-value, lưu trong bộ nhớ (in-memory) để truy xuất cực nhanh. Hỗ trợ nhiều cấu trúc dữ liệu: string, hash, list, set, sorted set, bitmap, hyperloglog, stream.
- Ứng dụng thực tế:
  - **Cache**: giảm tải cho DB chính, tăng tốc truy xuất.
  - **Session store**: lưu thông tin phiên đăng nhập người dùng.
  - **Message broker**: dùng Redis Pub/Sub hoặc Redis Streams để gửi/nhận message giữa các service.
  - **Leaderboard/Counting**: dùng sorted set để xếp hạng, đếm sự kiện.
  - **Rate limiting**: giới hạn số request trong khoảng thời gian.
  - **Distributed lock**: dùng `SETNX` (hoặc thư viện Redlock) để khóa tài nguyên dùng chung giữa nhiều instance/service.

> Lưu ý: Redis mặc định là in-memory nên **có thể mất dữ liệu khi restart** nếu không bật persistence (RDB snapshot hoặc AOF log).

---

## 7. Index hoạt động như thế nào trong MySQL?

Tưởng tượng một cuốn sách 1000 trang, không có mục lục — muốn tìm 1 từ phải lật từng trang (full table scan). Index giống mục lục: sắp xếp sẵn theo thứ tự, tra mục lục rồi nhảy thẳng đến trang cần tìm.

- MySQL (InnoDB) lưu index dưới dạng **B+Tree** — cấu trúc cây được sắp xếp sẵn, tìm 1 giá trị chỉ mất vài bước "rẽ nhánh" thay vì duyệt tuyến tính.

**Khi nào index làm chậm hơn?**

- Mỗi lần `INSERT/UPDATE/DELETE`, MySQL không chỉ ghi dữ liệu mà còn phải cập nhật lại toàn bộ index liên quan → càng nhiều index, ghi càng chậm.

**Composite index (index nhiều cột)**

- Giống mục lục nhiều tầng: sắp xếp theo cột 1, trong mỗi nhóm cột 1 lại sắp theo cột 2... MySQL áp dụng quy tắc **"left-most prefix"**: chỉ dùng được index nếu truy vấn có điều kiện trên cột đầu tiên của composite index; nếu bỏ qua cột đầu mà chỉ lọc theo cột sau, index sẽ **không** được dùng.

**N+1 Query Problem**

Ví dụ: có 10 đơn hàng, mỗi đơn hàng cần biết tên khách hàng.

❌ Cách sai (N+1):

```sql
SELECT * FROM orders;              -- 1 query lấy 10 đơn hàng
-- với MỖI đơn hàng, chạy thêm 1 query:
SELECT * FROM customers WHERE id = order.customer_id;  -- lặp lại 10 lần
```

Tổng: 1 + 10 = 11 query (N+1, với N = 10).

✅ Cách đúng (JOIN — chỉ 1 query):

```sql
SELECT orders.*, users.name
FROM orders
JOIN users ON orders.user_id = users.id;
```

---

## 8. Hệ thống phân tán & Microservices

**Vì sao tách Monolithic thành Microservices?**

Monolithic = tất cả chức năng nằm chung 1 codebase, chạy chung 1 process, deploy chung 1 lần.

Vấn đề của Monolithic khi dự án lớn:

- Sửa 1 dòng code ở module A vẫn phải deploy lại toàn bộ hệ thống, dù module B không liên quan.
- 1 module lỗi có thể kéo sập cả hệ thống (không cô lập).
- Khó scale từng phần riêng lẻ vì các module phụ thuộc lẫn nhau.

Microservices = tách mỗi chức năng thành 1 service riêng, chạy độc lập, deploy độc lập, giao tiếp qua network (REST/Message Queue).

**Cái giá phải trả:**

- Vận hành phức tạp hơn: nhiều service cần deploy riêng lẻ, cần Docker/CI-CD phức tạp hơn.
- Độ trễ cao hơn: gọi qua network chậm hơn gọi hàm trong cùng process.
- Nhất quán dữ liệu khó hơn: dữ liệu rải rác ở nhiều DB riêng của từng service → cần cơ chế đồng bộ (Saga, event-driven) hoặc chấp nhận **eventual consistency**.

**Giao tiếp đồng bộ (REST API) vs bất đồng bộ (Message Queue)**

- **Đồng bộ**: Service A gọi Service B, chờ B trả kết quả rồi mới tiếp tục. Nếu B chậm/lỗi, A cũng bị ảnh hưởng. Giống gọi điện thoại — nói xong phải chờ người kia trả lời. Dùng khi cần kết quả ngay (thanh toán, xác thực).
- **Bất đồng bộ**: A gửi message cho B, không chờ kết quả, tiếp tục việc khác; B xử lý và có thể phản hồi sau. Giống gửi email. Dùng khi không cần kết quả ngay (gửi email, xử lý dữ liệu lớn, thông báo, tác vụ nền).

**Chia service theo tiêu chí gì?**

Nguyên tắc phổ biến: chia theo **domain nghiệp vụ**, không chia theo kỹ thuật.

- ❌ Sai (chia theo kỹ thuật): "Database Service", "Validation Service" → mỗi request phải đi qua nhiều service không liên quan, phức tạp không cần thiết.
- ✅ Đúng (chia theo domain): "User Service", "Order Service", "Payment Service" → mỗi service phụ trách 1 nghiệp vụ, dễ quản lý, dễ mở rộng.

---

## 9. RabbitMQ / Message Broker

`Producer → Exchange → (Binding) → Queue → Consumer`

- **Producer**: gửi message đến Exchange, không biết message sẽ đi đâu.
- **Exchange**: trạm trung chuyển, dựa vào routing key để đẩy message đến queue phù hợp.
- **Queue**: nơi lưu trữ message, chờ consumer lấy ra xử lý.
- **Binding**: quy tắc liên kết giữa Exchange và Queue, xác định message nào đi đến queue nào dựa vào routing key.
- **Consumer**: bên nhận và xử lý message (VD: Notification Service lấy message để gửi email).

**Các loại Exchange:**

- **Direct**: gửi đến queue dựa vào routing key khớp chính xác.
- **Fanout**: gửi đến **tất cả** queue được bind, bỏ qua routing key.
- **Topic**: gửi dựa vào pattern của routing key, hỗ trợ wildcard (`*`, `#`) để match nhiều routing key.
- **Headers**: gửi dựa vào header của message, bỏ qua routing key.

**Dead Letter Queue (DLQ)**

Là "hàng đợi rác" đặc biệt — message tự động chuyển vào đây khi:

- Consumer từ chối xử lý (`nack`/`reject`) và không cho phép đưa lại vào queue gốc (`requeue = false`).
- Message hết hạn (TTL) mà chưa được xử lý.
- Message bị retry quá số lần tối đa mà vẫn thất bại.

**Xác nhận tin nhắn (ack/nack)**

- `ack`: consumer báo đã xử lý thành công → message bị xóa khỏi queue.
- `nack`: consumer báo không xử lý được → message được đưa lại vào queue (retry) hoặc chuyển sang DLQ, tùy cấu hình.

**Vấn đề message bị gửi trùng lặp**

- Mỗi message nên có 1 ID duy nhất (idempotency key); consumer lưu lại ID các message đã xử lý thành công, nếu nhận trùng ID thì bỏ qua, không xử lý lại lần nữa.

---

## 10. B-Tree — 3 loại cây

**B-tree (cây B cơ bản)**

- Mỗi node chứa nhiều khóa và nhiều con (không chỉ 2 nhánh như cây nhị phân).
- Dữ liệu được lưu ở **cả node trong lẫn node lá**.
- **Tìm kiếm**: duyệt từ root, so sánh khóa để chọn nhánh con.
- **Chèn**: chèn vào lá; nếu node đầy (vượt bậc cho phép) thì **tách node (split)**, đẩy khóa giữa lên node cha.
- **Xóa**: nếu node thiếu khóa (dưới ngưỡng tối thiểu) thì **mượn (borrow)** từ node anh em hoặc **gộp (merge)** hai node lại.

## 11. Blocking vs Non-blocking

- **Blocking**: khi gọi thao tác I/O (đọc file, gọi API...), thread bị "đóng băng", không làm gì khác cho đến khi thao tác xong.
- **Non-blocking**: thao tác I/O được gửi đi, thread tiếp tục làm việc khác ngay, kết quả trả về sau qua callback/promise/event.
- Non-blocking thường kết hợp với **event loop** (như Node.js) để xử lý nhiều tác vụ I/O cùng lúc mà không cần nhiều thread.

---

## 12. Worker Thread vs Thread

- **Thread**: đơn vị thực thi trong 1 process, **chia sẻ chung bộ nhớ** với nhau → giao tiếp nhanh nhưng dễ race condition.
- JS mặc định **single-thread** (main thread) → tác vụ nặng CPU sẽ chặn cả chương trình.
- **Worker** (Worker Thread trong Node.js / Web Worker trên trình duyệt): là 1 thread riêng, chạy song song, **không chia sẻ bộ nhớ trực tiếp** — giao tiếp qua **message passing**, dùng để xử lý tác vụ nặng CPU mà không làm nghẽn main thread.
- Chỉ nên dùng Worker cho tác vụ **nặng CPU** (mã hóa, xử lý ảnh, tính toán lớn); **không cần** cho I/O vì Node.js đã non-blocking sẵn qua event loop; tác vụ quá nhỏ thì tạo Worker còn tốn hơn (do chi phí khởi tạo thread).

```javascript
// main.js
const { Worker } = require("worker_threads");
const worker = new Worker("./worker.js", { workerData: { n: 45 } });
worker.on("message", (result) => console.log("Kết quả:", result));

// worker.js
const { parentPort, workerData } = require("worker_threads");
function fibonacci(n) {
  return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);
}
parentPort.postMessage(fibonacci(workerData.n));
```

---

## 13. Transaction là gì

Một **transaction** là chuỗi thao tác (đọc/ghi dữ liệu) được gộp thành **1 đơn vị duy nhất, không thể chia nhỏ**: hoặc **tất cả** thành công (`COMMIT`), hoặc nếu có lỗi thì **toàn bộ** bị hủy (`ROLLBACK`).

**Tính chất ACID**

- **Atomicity**: tất cả hoặc không có gì cả.
- **Consistency**: dữ liệu luôn hợp lệ trước và sau transaction.
- **Isolation**: các transaction chạy đồng thời không ảnh hưởng lẫn nhau (có nhiều mức độ: Read Uncommitted, Read Committed, Repeatable Read, Serializable).
- **Durability**: khi đã commit, dữ liệu được lưu vĩnh viễn dù hệ thống có sập.

**Ví dụ: chuyển tiền ngân hàng**

```sql
BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 1000000 WHERE id = 'A';
UPDATE accounts SET balance = balance + 1000000 WHERE id = 'B';
COMMIT; -- nếu 1 trong 2 lệnh lỗi thì ROLLBACK, tiền A không bị mất
```

**Ứng dụng khác**: đặt vé máy bay (trừ chỗ + tạo booking), thương mại điện tử (trừ tồn kho + tạo đơn + trừ tiền ví), hệ thống phân tán dùng **2-Phase Commit** hoặc **Saga pattern** để đảm bảo transaction giữa nhiều service.

---

## 14. Tình huống phỏng vấn: 2 user cùng đặt 1 đơn hàng (race condition)

**Vấn đề**: 2 user cùng lúc đặt 1 sản phẩm/chỗ chỉ còn số lượng giới hạn (VD: còn 1 vé). Nếu không xử lý, cả 2 request đều đọc thấy "còn hàng" rồi cùng ghi đè → bán trùng.

**Giải pháp đúng — Transaction + Lock ở tầng database:**

1. **Cách đơn giản, phổ biến nhất**: tận dụng tính atomic của câu lệnh `UPDATE`:

   ```sql
   UPDATE products SET stock = stock - 1 WHERE id = 1 AND stock > 0;
   ```

   Nếu `stock` đã về 0, câu lệnh không update được dòng nào (`affected rows = 0`) → báo "hết hàng".

2. **Pessimistic Lock** (`SELECT ... FOR UPDATE`): khóa dòng dữ liệu trong transaction, user khác phải **chờ** đến khi transaction đầu tiên commit xong mới đọc/ghi được.

   ```sql
   BEGIN TRANSACTION;
   SELECT stock FROM products WHERE id = 1 FOR UPDATE;
   UPDATE products SET stock = stock - 1 WHERE id = 1 AND stock > 0;
   COMMIT;
   ```

3. **Optimistic Lock** (cột `version`): kiểm tra version có đổi không khi update; nếu người khác đã update trước, câu lệnh không match dòng nào → báo user thử lại.

   ```sql
   UPDATE products SET stock = stock - 1, version = version + 1
   WHERE id = 1 AND stock > 0 AND version = 5;
   ```

4. **Ở hệ thống phân tán/nhiều server**: có thể dùng thêm **Redis distributed lock** hoặc đẩy request vào **message queue** để xử lý tuần tự.

### ⚠️ Phân biệt với "Unique key (userId, orderId)"

Đây là giải pháp cho **một vấn đề khác**, không phải vấn đề race condition ở trên:

| Vấn đề                                                                       | Giải pháp                                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1 user gửi trùng request nhiều lần (double-submit, do mạng lag/double-click) | Unique key `(userId, orderId)` → đây gọi là **Idempotency**                     |
| Nhiều user khác nhau tranh nhau 1 sản phẩm/số lượng có hạn                   | Transaction + `WHERE stock > 0`, hoặc `SELECT FOR UPDATE`, hoặc Optimistic lock |

Vì `orderId` của 2 user khác nhau là 2 giá trị khác nhau, unique key `(userId, orderId)` **không** ngăn được việc cả 2 đơn đều insert thành công trong khi kho chỉ còn 1 sản phẩm. Một hệ thống đặt hàng tốt cần **cả 2 cơ chế** cùng lúc: chống trùng đơn từ 1 user + chống bán quá tồn kho khi nhiều user tranh nhau.

---

## 15. Message Queue vs BullMQ

Đây là 2 khái niệm ở **2 tầng khác nhau** — như so sánh "ô tô" với "Toyota Camry":

|                | **Message Queue**                                                                    | **BullMQ**                                                                                        |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Là gì          | Khái niệm/mô hình chung: hàng đợi tin nhắn để giao tiếp bất đồng bộ giữa các service | Một **thư viện cụ thể** (Node.js), triển khai mô hình queue, xây trên nền **Redis**               |
| Vai trò        | Định nghĩa pattern (producer gửi vào queue, consumer lấy ra xử lý)                   | Công cụ giúp code queue đó dễ dàng trong Node.js (kèm retry, delay job, priority, concurrency...) |
| Ví dụ hệ thống | RabbitMQ, Kafka, SQS, BullMQ...                                                      | Là 1 trong các lựa chọn để hiện thực message queue                                                |

**So sánh BullMQ với các hệ thống queue khác:**

|                   | **BullMQ**                                                   | **RabbitMQ**                                      | **Kafka**                                    |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------- |
| Nền tảng lưu trữ  | Redis                                                        | Broker riêng (Erlang), lưu RAM/disk               | Log file, phân tán nhiều broker              |
| Phù hợp           | Job queue trong app Node.js (gửi email, xử lý ảnh, cron job) | Message routing phức tạp (pub/sub, RPC, exchange) | Xử lý stream dữ liệu lớn, throughput cực cao |
| Độ phức tạp setup | Đơn giản, chỉ cần Redis                                      | Trung bình                                        | Phức tạp, cần cluster                        |
| Phù hợp nhất      | Dự án Node.js vừa/nhỏ cần background job                     | Hệ thống enterprise, microservices                | Big data, event streaming, log, analytics    |

---

## 16. Message Queue được lưu trữ ở đâu?

Tùy công nghệ cụ thể được chọn để hiện thực queue, **không có 1 nơi lưu trữ cố định**:

- **BullMQ** → lưu trong **Redis** (in-memory, có thể bật persistence AOF/RDB để không mất dữ liệu khi restart).
- **RabbitMQ** → có broker riêng, lưu message trong bộ nhớ hoặc ghi xuống disk (nếu queue được đánh dấu `durable`).
- **Kafka** → lưu dưới dạng **log file trên disk**, phân tán trên nhiều broker/partition, giữ message theo thời gian retention cấu hình sẵn (không xóa ngay sau khi consumer đã đọc — khác các queue truyền thống).
- **AWS SQS** → dịch vụ managed của Amazon, lưu trên hạ tầng AWS, không cần tự quản lý.

---

## 17. Nếu Message Queue bị hỏng thì điều gì diễn ra?

Cần phân biệt theo 2 loại lỗi:

**a) Queue server bị sập (crash/down)**

- Producer không gửi được message nữa → cần cơ chế **retry** hoặc **fallback** (lưu tạm vào DB/local, gửi lại sau).
- Consumer không nhận được message mới → luồng xử lý bất đồng bộ bị đứng lại.
- Nếu queue **không có persistence** (chỉ in-memory) → **mất toàn bộ** message đang chờ xử lý khi restart.
- Nếu queue **có persistence** (ghi xuống disk — RabbitMQ `durable queue`, Kafka log, BullMQ + Redis AOF) → khi khởi động lại, message **vẫn còn**, tiếp tục xử lý bình thường.

**b) Consumer xử lý message bị lỗi (job fail, không phải queue chết)**

- **Message có thể mất** nếu dùng auto-ack: consumer nhận message, queue xóa ngay lập tức, rồi consumer crash giữa chừng khi đang xử lý → message mất vĩnh viễn, không ai biết.
- **Giải pháp — Acknowledgement (ack) thủ công**: consumer chỉ báo "đã xử lý xong" (`ack`) **sau khi** xử lý thành công. Nếu consumer crash trước khi `ack` → queue tự động đưa message trở lại hàng đợi để consumer khác xử lý lại.
- **Retry mechanism**: nếu xử lý lỗi (exception), cho phép thử lại theo số lần cấu hình, có thể kèm **exponential backoff** (giãn cách thời gian giữa các lần retry).
- **Dead Letter Queue (DLQ)**: nếu retry quá số lần quy định vẫn fail → message được đẩy vào hàng đợi riêng (DLQ) để không làm nghẽn queue chính, dev xem lại và xử lý thủ công sau.

**Thêm điểm mở rộng nếu muốn trả lời sâu hơn:**

- **High Availability (HA)**: hệ thống production thường chạy **cluster** (nhiều node) thay vì 1 server duy nhất — RabbitMQ mirrored queue, Kafka replication — để 1 node chết thì node khác vẫn hoạt động.
- **Monitoring/Alerting**: theo dõi độ dài queue (queue length); nếu tăng bất thường (message không xử lý kịp) → cảnh báo sớm trước khi hệ thống sập hoàn toàn.

---

## 18. Skill AI là gì?

Tùy ngữ cảnh câu hỏi của người phỏng vấn, thường có 3 hướng hiểu:

- **AI Skills / Agent Skills**: các "kỹ năng" đóng gói sẵn cho AI agent (như Claude) — tập hợp hướng dẫn, công cụ, hoặc script giúp AI biết cách thực hiện 1 tác vụ chuyên biệt (VD: tạo file Word, đọc PDF, viết code theo chuẩn công ty...). Giống như "plugin" cho AI.
- **Prompt Engineering skill**: kỹ năng viết prompt hiệu quả để AI trả lời đúng ý, đúng định dạng mong muốn.
- **Kỹ năng ứng dụng AI vào công việc**: biết dùng AI để tăng năng suất (code review, viết tài liệu, debug, sinh test case...).

> Ghi chú: câu này chưa xác định rõ ý của anh lead hỏi theo hướng nào — nên hỏi lại ngữ cảnh cụ thể (đang nói về AI agent kỹ thuật, hay về kỹ năng cá nhân/CV) để trả lời trúng ý hơn.
