# Arena Planning — Hướng dẫn cho Claude

## Quy tắc bất biến

- **Chỉ sửa `data.json`** — KHÔNG bao giờ sửa `index.html` hoặc `app.js`
- Luôn dùng **tiếng Việt có dấu** trong mọi nội dung: chat, data.json, comments
- Sau mỗi thay đổi: `git add data.json && git commit -m "..." && git push origin main`
- **Luôn xuất link** sau khi xong: `https://vuongwnguyen.github.io/arena-planing/?id=<ID>`

## data.json Schema

Mỗi item trong array `data.json` theo đúng cấu trúc sau:

```json
{
  "id": "US-XXX",
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

  "example": {
    "description": "Mô tả ngắn ví dụ minh hoạ",
    "discount": 0,
    "total": 0,
    "items": [
      { "code": "SP000001", "name": "Tên hàng", "qty": 1, "price": 0 }
    ]
  },

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
  }
}
```

## Giá trị hợp lệ

**status:** `Chờ phát triển` | `Đang phát triển` | `Hoàn thành`

**sprintPlan.days[].color:** `purple` (Thứ 2) | `teal` (Thứ 3) | `blue` (Thứ 4–5) | `amber` (Thứ 6) | `green` (Thứ 7)

**tasks[].tags:** `Dev` | `Claude` | `Team` | `Git` | `Khẩn cấp`

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

Có thể bỏ qua nếu không cần: `example`, `dbChanges`, `edgeCases`, `sprintPlan`

## Quy trình thêm planning item mới

1. Đọc `data.json` hiện tại, giữ nguyên các item cũ
2. Thêm object mới, ID tăng dần: US-002, US-003...
3. Verify: `node -e "JSON.parse(require('fs').readFileSync('data.json','utf8')); console.log('OK')"`
4. Commit + push
5. Xuất link: `https://vuongwnguyen.github.io/arena-planing/?id=<ID>`
