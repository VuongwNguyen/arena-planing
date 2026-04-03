---
name: arena-planning
description: Use when creating, adding, or updating planning documents for any project tracked at /home/vuongwnguyen/CODE/ArenaBilliard/planing (Arena Billiard, Lunar Fest, and future projects). Triggers on requests like "viet planning", "them user story", "tao ke hoach sprint", "add planning item", "tao US".
---

# Planning Skill (Multi-Project)

## Overview

Tạo planning items (User Story + Sprint Plan) cho nhiều project, lưu vào `data.json`, deploy GitHub Pages tại `https://vuongwnguyen.github.io/arena-planing/?id=<ID>`.

**Quy tắc cốt lõi:** Chỉ sửa `data.json` — HTML/CSS/JS không bao giờ thay đổi.

## Khi nào dùng

- User yêu cầu tạo user story / planning mới (bất kỳ project nào)
- User muốn thêm sprint plan cho 1 feature
- User muốn cập nhật status hoặc AC của story hiện có

## File quan trọng

```
/home/vuongwnguyen/CODE/ArenaBilliard/planing/
  data.json     ← ONLY file bạn cần sửa
  index.html    ← KHÔNG sửa
  app.js        ← KHÔNG sửa
```

## Convention ID (BẮT BUỘC)

| Prefix | Project |
|--------|---------|
| `US-AR-XXX` | Arena Billiard |
| `US-LF-XXX` | Lunar Fest |

Số thứ tự 3 chữ số, tăng dần **trong từng project** độc lập.

## data.json Schema (1 item đầy đủ)

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
| Thứ 3 | Phân rã | Break down tasks, tạo nhánh feature, migration DB |
| Thứ 4 | Code (1) | Code core logic, unit tests |
| Thứ 5 | Code (2) + QA | Hoàn thiện, chạy toàn bộ test case |
| Thứ 6 | Review | Impact analysis, code review chéo |
| Thứ 7 | Merge | Pull final, test, merge develop, deploy beta |

## Quy trình thêm planning item mới

1. Đọc `data.json` hiện tại
2. Xác định project từ yêu cầu của user → chọn prefix đúng (US-AR / US-LF / ...)
3. Tìm ID lớn nhất trong project đó, tăng lên 1
4. Thêm `"project"` field ngay sau `"id"`
5. Thêm `testcases[]` đầy đủ — KHÔNG cần user nhắc
6. Verify JSON: `node -e "JSON.parse(require('fs').readFileSync('data.json','utf8')); console.log('OK')"`
7. Commit + push: `git add data.json && git commit -m "feat: add <ID> - <title>" && git push origin main`
8. URL truy cập: `https://vuongwnguyen.github.io/arena-planing/?id=<ID>`

## Optional fields

- `example` — bỏ qua nếu không có ví dụ số liệu
- `dbChanges` — bỏ qua nếu không đổi DB
- `edgeCases` — nên có ít nhất 3-4 cases
- `sprintPlan` — bỏ qua nếu chỉ cần user story đơn thuần
