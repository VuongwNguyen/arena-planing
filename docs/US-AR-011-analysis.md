# US-AR-011 — Phân tích đồng bộ báo cáo App vs Web

> Ngày phân tích: 07/04/2026  
> Jira: GE-316  
> Sprint: T.4-W.2 (06/04 – 12/04/2026)

---

## 1. Map thành phần báo cáo App → Web

| App (arena-club-management) | Web (arena-admin-web) | Endpoint App | Endpoint Web |
|-----------------------------|----------------------|--------------|--------------|
| **Doanh thu** | Báo cáo bán hàng | `/api/app/sale-reports/get-revenue` | `/api/reports/get-time-sale-detail-report` |
| **Bán hàng** (hiệu suất bàn) | Báo cáo bán hàng → RoomTable | `/api/app/sale-reports/get-table-revenue` | `/api/reports/get-table-sale-detail-report` |
| **Doanh thu NV** | Báo cáo cuối ngày → ShiftWork | `/api/app/reports/get-revenue-by-employee` | `/api/reports/get-cashier-shift-daily-report` |
| **Cuối ngày** | Báo cáo cuối ngày | `/api/app/end-day-reports/get-general` | `/api/reports/get-end-day-general-report` |
| **Hàng hoá** | Báo cáo hàng hóa | goods-report hooks | products-report |
| **Lợi nhuận** | Báo cáo bán hàng → ProfitReport | `/api/app/sale-reports/get-profit` | `/api/reports/get-profit-sale-detail-report` |
| **Thu chi** | Báo cáo cuối ngày | `/api/app/end-day-reports/get-income-expense` | `/api/reports/get-end-day-income-expense-report` |
| **Chi phí** | Báo cáo tài chính | profit-report screens | financial-report |
| **Tổng quan** | *(không có menu tương đương)* | `/api/app/overviews/get-info` | — |

---

## 2. Ba module US-AR-011 cần fix (ưu tiên)

| # | Module App | Vấn đề | Việc cần làm |
|---|-----------|--------|--------------|
| 1 | **Doanh thu** | Gọi `/api/app/sale-reports/get-revenue` thay vì API chuẩn Web | Migrate sang `/api/reports/get-time-sale-detail-report` |
| 2 | **Bán hàng** (hiệu suất bàn) | Gọi `/api/app/sale-reports/get-table-revenue` | Migrate sang `/api/reports/get-table-sale-detail-report` |
| 3 | **Doanh thu NV** | Gọi endpoint cũ `/api/app/reports/get-revenue-by-employee` | Migrate sang `/api/reports/get-cashier-shift-daily-report` |

---

## 3. Các vấn đề kỹ thuật cần xử lý

### 3.1 API prefix khác nhau — Root cause chính

- **Web** dùng: `/api/reports/...`
- **App** dùng: `/api/app/sale-reports/...`, `/api/app/overviews/...`, `/api/app/end-day-reports/...`, `/api/app/reports/...`
- App và Web đang gọi **2 bộ API backend khác nhau** → số liệu tính toán khác nhau

### 3.2 Timezone chưa chuẩn

- Báo cáo App dùng `dayjs(new Date()).format(...)` → phụ thuộc device timezone
- **Cần thêm**: `dayjs/plugin/utc` + `dayjs/plugin/timezone` + `utcOffset(7)`
- Tham khảo: `src/screens/shift/HandoverVoucherScreen.tsx` đã làm đúng

### 3.3 Cache

- App không có cache strategy rõ ràng (gọi API mỗi lần mở màn hình)
- Cần đồng bộ TTL tối đa 5 phút giống Web (theo AC edge case)

---

## 4. File cần sửa

```
arena-club-management/src/screens/report-v2/
  sell-report/sale-reports.hook.ts              ← migrate endpoint doanh thu + bàn
  orverview/orverview.hook.ts                   ← kiểm tra + align với Web
  end-of-day-report/end-report.hook.ts          ← migrate sang /api/reports/get-end-day-*

arena-club-management/src/redux/slices/
  report.ts                                     ← endpoint /api/app/reports/* cũ cần xem xét

Tạo mới (nếu cần):
  report-v2/staff-report/                       ← màn hình nhân viên dùng get-cashier-shift-daily-report
```

---

## 5. Acceptance Criteria đối chiếu

| AC | Mô tả | Module liên quan |
|----|-------|-----------------|
| AC-01 | Doanh thu App = Web | **Doanh thu** screen |
| AC-02 | Hiệu suất bàn App = Web | **Bán hàng** → TableReport |
| AC-03 | Báo cáo nhân viên App = Web | **Doanh thu NV** screen |
| AC-04 | Cùng timezone UTC+7 | Tất cả report hooks |
| AC-05 | App dùng chung API với Web | Migrate 3 module trên |

---

## 6. Sprint plan

| Ngày | Jira | Việc cần làm |
|------|------|-------------|
| Thứ 3 (07/04) | GE-757 | Inspect network App vs Web, confirm endpoint lệch |
| Thứ 4 (08/04) | GE-758 | Migrate `sale-reports.hook.ts` + `end-report.hook.ts` |
| Thứ 4 (08/04) | GE-759 | Thêm timezone plugin vào tất cả report hooks |
| Thứ 5 (09/04) | GE-760/761 | Fix UI Doanh thu + Hiệu suất bàn sau khi đổi API |
| Thứ 6 (10/04) | GE-762 | Tạo/fix màn hình Doanh thu NV dùng API chuẩn |
| Thứ 6 (10/04) | GE-763 | Viết test case so sánh App vs Web |
| Thứ 7 (11/04) | GE-764 | QA + Manager sign-off |
