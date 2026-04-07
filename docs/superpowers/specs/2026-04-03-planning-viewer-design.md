# Design Spec — Arena Planning Viewer

**Ngày:** 03/04/2026  
**Trạng thái:** Approved

---

## 1. Mục tiêu

Trang web tĩnh để hiển thị User Story / Planning document theo URL alias trực tiếp.  
Deploy GitHub Pages, không cần backend, không cần build step.

---

## 2. Kiến trúc

```
/planing/
  index.html   ← toàn bộ logic render
  data.json    ← danh sách planning items
```

Không có file nào khác. Không có npm, không có framework.

---

## 3. URL Scheme

```
https://yourname.github.io/planing/?id=US-001
```

- `?id=` map với field `id` trong `data.json`
- Không có `?id=` hoặc không tìm thấy → hiện trang "Không tìm thấy"
- Không có sidebar, không có danh sách — truy cập thẳng đến item

---

## 4. data.json Format

Map 1-1 với format markdown User Story:

```json
[
  {
    "id": "US-001",
    "title": "Phân Bổ Giảm Giá Hoá Đơn Vào Từng Hàng Hoá",
    "module": "Báo cáo bán hàng theo hàng hoá",
    "author": "Product Team",
    "date": "02/04/2026",
    "status": "Chờ phát triển",

    "context": "Mô tả bối cảnh...",

    "userStory": {
      "as": "Thu ngân / Kế toán",
      "iWant": "Hệ thống tự động phân bổ...",
      "soThat": "Báo cáo hiển thị đúng..."
    },

    "example": {
      "description": "Mô tả ví dụ",
      "discount": 100000,
      "items": [
        { "code": "SP000001", "name": "Sting", "qty": 2, "price": 30000 }
      ]
    },

    "acceptanceCriteria": [
      {
        "id": "AC-01",
        "title": "Phân bổ đúng theo tỷ lệ",
        "given": "một hoá đơn có N items...",
        "when": "hoá đơn được hoàn thành",
        "then": "mỗi item[i] được gán discount_allocated"
      }
    ],

    "flow": "Text mô tả flow xử lý...",

    "dbChanges": "ALTER TABLE order_items ADD COLUMN ...",

    "edgeCases": [
      { "case": "Hoá đơn có 1 item", "handle": "Toàn bộ giảm về item đó" }
    ],

    "notes": [
      "Không tính lại khi chỉ xem báo cáo",
      "Log mọi trường hợp SUM(allocated) ≠ D"
    ]
  }
]
```

---

## 5. Giao diện

**Theme:** Sáng — nền `#f8fafc`, chữ `#1e293b`, giữ style card/badge từ rtsp-stability-ux-plan.html

**Layout một trang (không sidebar):**

```
┌─────────────────────────────────────────────┐
│  NAV TABS: Overview | AC | Flow | DB | Notes │  ← sticky
├─────────────────────────────────────────────┤
│  HEADER: title, module, author, date, badges │
├─────────────────────────────────────────────┤
│  CONTENT (thay đổi theo tab active)          │
│  - Overview: Context + User Story box        │
│  - AC: cards GIVEN/WHEN/THEN                 │
│  - Flow: text flow + Edge Cases table        │
│  - DB: code block SQL                        │
│  - Notes: danh sách ghi chú dev              │
└─────────────────────────────────────────────┘
```

**Status badges:**
- `Chờ phát triển` → xanh dương nhạt
- `Đang phát triển` → cam
- `Hoàn thành` → xanh lá

---

## 6. Cam kết

> Bạn chỉ cần sửa `data.json`. HTML không bao giờ cần đụng.  
> Thêm field mới vào JSON → tự động render. Xoá field → section đó ẩn.

---

## 7. Không scope

- Không có search
- Không có edit trên web
- Không có authentication
- Không có analytics
