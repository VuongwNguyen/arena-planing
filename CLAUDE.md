# Arena Planning — Hướng dẫn cho Claude

## Quy tắc bất biến

- **Chỉ sửa `data.json`** — KHÔNG bao giờ sửa `index.html` hoặc `app.js`
- Sau mỗi thay đổi: `git add data.json && git commit -m "..." && git push origin main`
- URL xem kết quả: `https://vuongwnguyen.github.io/arena-planing/?id=<ID>`

## data.json Schema

Mỗi item trong array `data.json` theo đúng cấu trúc sau:

```json
{
  "id": "US-XXX",
  "title": "Ten tinh nang (khong dau)",
  "module": "Ten module",
  "author": "Product Team",
  "date": "DD/MM/YYYY",
  "status": "Cho phat trien",

  "context": "Mo ta boi canh business.",

  "userStory": {
    "as": "Vai tro nguoi dung",
    "iWant": "He thong can lam gi",
    "soThat": "Ket qua mong muon"
  },

  "example": {
    "description": "Mo ta vi du",
    "discount": 0,
    "total": 0,
    "items": [
      { "code": "SP000001", "name": "Ten hang", "qty": 1, "price": 0 }
    ]
  },

  "acceptanceCriteria": [
    {
      "id": "AC-01",
      "title": "Ten tieu chi",
      "given": "Dieu kien",
      "when": "Hanh dong",
      "then": "Ket qua"
    }
  ],

  "flow": "ASCII text mo ta flow.\n[ACTOR]\n    |\n    v\nBuoc 1",

  "dbChanges": "ALTER TABLE ... ADD COLUMN ...;",

  "edgeCases": [
    { "case": "Truong hop dac biet", "handle": "Cach xu ly" }
  ],

  "notes": ["Ghi chu cho dev"],

  "sprintPlan": {
    "startDate": "DD/MM/YYYY",
    "endDate": "DD/MM/YYYY",
    "days": [
      {
        "day": "Thu 2",
        "date": "DD/MM/YYYY",
        "theme": "Chu de ngay",
        "color": "purple",
        "result": "Ket qua cuoi ngay",
        "tasks": [
          { "text": "Mo ta cong viec", "tags": ["Dev", "Claude"] }
        ]
      }
    ]
  }
}
```

## Giá trị hợp lệ

**status:** `Cho phat trien` | `Dang phat trien` | `Hoan thanh`

**sprintPlan.days[].color:** `purple` (T2) | `teal` (T3) | `blue` (T4-T5) | `amber` (T6) | `green` (T7)

**tasks[].tags:** `Dev` | `Claude` | `Team` | `Git` | `Kham cap`

## Sprint workflow chuẩn (6 ngày)

| Ngày | Theme | Việc chính |
|------|-------|-----------|
| Thứ 2 | Chuẩn bị | Tạo US, AC, test case; team duyệt |
| Thứ 3 | Phân rã | Break down tasks, tạo nhánh feature |
| Thứ 4 | Code (1) | Code core logic, unit tests |
| Thứ 5 | Code (2) + QA | Hoàn thiện, chạy test |
| Thứ 6 | Review | Impact analysis, code review |
| Thứ 7 | Merge | Pull final, merge develop, deploy beta |

## Optional fields

Có thể bỏ qua nếu không cần: `example`, `dbChanges`, `edgeCases`, `sprintPlan`

## Thêm planning item mới

1. Đọc `data.json`, giữ nguyên các item cũ
2. Thêm object mới, id tăng dần (US-002, US-003...)
3. Verify: `node -e "JSON.parse(require('fs').readFileSync('data.json','utf8')); console.log('OK')"`
4. Commit + push
