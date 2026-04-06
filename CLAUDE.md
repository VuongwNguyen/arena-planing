# Planning Tool — Hướng dẫn cho Claude

## Quy tắc bất biến

- **Chỉ sửa `data.json`** — KHÔNG sửa `index.html` hoặc `app.js` trừ khi user yêu cầu rõ ràng
- Luôn dùng **tiếng Việt có dấu** trong mọi nội dung: chat, data.json, comments
- Sau mỗi thay đổi: `git add data.json && git commit -m "..." && git push origin main`
- **Luôn xuất link** sau khi xong: `https://vuongwnguyen.github.io/arena-planing/?id=<ID>`

## Convention ID (BẮT BUỘC)

| Prefix | Project |
|--------|---------|
| `US-AR-XXX` | Arena Billiard |
| `US-LF-XXX` | Lunar Fest |

Số thứ tự 3 chữ số, tăng dần **trong từng project** (US-AR-001, US-AR-002... độc lập với US-LF-001, US-LF-002...).

## data.json Schema

Mỗi item trong array `data.json` theo đúng cấu trúc sau:

```json
{
  "id": "US-AR-001",
  "project": "Arena Billiard",
  "title": "Tên tính năng có dấu",
  "module": "Tên module",
  "author": "Product Team",
  "date": "DD/MM/YYYY",
  "status": "Chờ phát triển",

  "context": "Mô tả bối cảnh business, tại sao cần làm tính năng này.",

  "userStory": {
    "as": "Vai trò người dùng",
    "iWant": "Hệ thống cần làm gì",
    "soThat": "Kết quả mong muốn"
  },

  "mockupUrl": "https://figma.com/...",

  "acceptanceCriteria": [
    {
      "id": "AC-01",
      "title": "Tên tiêu chí",
      "given": "Điều kiện đầu vào",
      "when": "Hành động xảy ra",
      "then": "Kết quả mong đợi"
    }
  ],

  "flow": "ASCII text mô tả flow.\n[ACTOR]\n    |\n    ▼\nBước 1\n    |\n    ▼\nBước 2",

  "dbChanges": "ALTER TABLE ... ADD COLUMN ...;\n-- Giải thích cột",

  "edgeCases": [
    { "case": "Trường hợp đặc biệt", "handle": "Cách xử lý" }
  ],

  "notes": ["Ghi chú quan trọng cho dev"],

  "sprintPlan": {
    "startDate": "DD/MM/YYYY",
    "endDate": "DD/MM/YYYY",
    "days": [
      {
        "day": "Thứ 2",
        "date": "DD/MM/YYYY",
        "theme": "Chuẩn bị & Thống nhất",
        "color": "purple",
        "result": "Mô tả kết quả cuối ngày",
        "tasks": [
          { "text": "Mô tả công việc cụ thể có dấu", "tags": ["Dev", "Claude"] }
        ]
      }
    ]
  },

  "testcases": [
    {
      "ma_testcase": "TC_001",
      "ten_testcase": "Tên ngắn mô tả mục đích test",
      "nhom": "Arena App",
      "dieu_kien_tien_quyet": "- Điều kiện 1\n- Điều kiện 2",
      "buoc_thuc_hien": "1. Bước 1\n2. Bước 2\n3. Bước 3",
      "ket_qua_mong_doi": "- Kết quả 1\n- Kết quả 2",
      "loai": "Happy Path"
    }
  ]
}
```

## Giá trị hợp lệ

**project:** `Arena Billiard` | `Lunar Fest` | tên project khác khi mở rộng

**status:** `Chờ phát triển` | `Đang phát triển` | `Hoàn thành`

**sprintPlan.days[].color:** `purple` (Thứ 2) | `teal` (Thứ 3) | `blue` (Thứ 4–5) | `amber` (Thứ 6) | `green` (Thứ 7)

**tasks[].tags:** `Dev` | `Claude` | `Team` | `Git` | `Khẩn cấp`

**testcases[].loai:** `Happy Path` | `Edge Case` | `Error Case`

**testcases[].nhom:** `Arena App` | `Backend` | `WebAdmin` | `End-to-end` | tên module khác phù hợp

## Quy tắc sinh testcase (BẮT BUỘC)

Mỗi US **phải có** field `testcases[]` với đầy đủ các nhóm:

| Nhóm | Bắt buộc cover |
|------|---------------|
| **Happy Path** | Luồng thành công chính + biến thể thành công |
| **Edge Case** | Dữ liệu biên, trùng lặp, timeout, mạng chậm, thiết bị khác |
| **Error Case** | Thiếu quyền, sai dữ liệu, lỗi hệ thống, mất kết nối |
| **End-to-end** | 1 case test toàn bộ flow từ đầu đến cuối, xếp **cuối cùng** |

**Schema testcase phải dùng đúng tên field:**
- `ma_testcase` (không phải `id`)
- `ten_testcase` (không phải `title`)
- `nhom` (bắt buộc)
- `dieu_kien_tien_quyet` (không phải `dieu_kien`)
- `buoc_thuc_hien` (không phải `buoc`)
- `ket_qua_mong_doi` (không phải `ket_qua`)
- `loai`

## Sprint workflow chuẩn (6 ngày)

| Ngày | Theme | Việc chính |
|------|-------|-----------|
| Thứ 2 | Chuẩn bị | Tạo US, AC, test case; team duyệt |
| Thứ 3 | Phân rã | Break down tasks, tạo nhánh feature |
| Thứ 4 | Code (1) | Code core logic, unit tests |
| Thứ 5 | Code (2) + QA | Hoàn thiện, chạy toàn bộ test |
| Thứ 6 | Review | Impact analysis, code review chéo |
| Thứ 7 | Merge | Pull final, merge develop, deploy beta |

## Các field tuỳ chọn

Có thể bỏ qua nếu không cần: `mockupUrl`, `dbChanges`, `edgeCases`, `sprintPlan`

## Quy tắc mockupUrl (BẮT BUỘC với US có giao diện)

Nếu US liên quan đến màn hình / UI → **hỏi user trước khi commit:**
> "US này có giao diện — bạn có link mockup/ảnh nào muốn thêm vào không?"

`mockupUrl` có thể là string hoặc array string.

## Quy trình thêm planning item mới

1. Đọc `data.json` hiện tại, giữ nguyên các item cũ
2. Xác định project → chọn prefix đúng (US-AR / US-LF / ...)
3. Tìm ID lớn nhất trong project đó, tăng lên 1
4. Thêm `"project"` field ngay sau `"id"`
5. Thêm `testcases[]` đầy đủ theo schema và quy tắc trên — KHÔNG cần người dùng nhắc
6. Verify: `node -e "JSON.parse(require('fs').readFileSync('data.json','utf8')); console.log('OK')"`
7. Commit + push toàn bộ
8. Xuất link: `https://vuongwnguyen.github.io/arena-planing/?id=<ID>`
