# Arena Planning Viewer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang web tĩnh render User Story từ `data.json` qua URL `?id=US-001`, deploy GitHub Pages.

**Architecture:** `index.html` duy nhất fetch `data.json`, parse `?id=` từ URL, render đúng item. Nav tabs chuyển section (Overview, AC, Flow, DB, Notes). Không có sidebar, không có danh sách. Tất cả dữ liệu từ JSON được escape trước khi đưa vào DOM để tránh XSS.

**Tech Stack:** Thuần HTML/CSS/JS (ES6). Không framework, không build step.

---

## File Structure

```
/planing/
  index.html       <- toàn bộ HTML + CSS + JS
  data.json        <- mảng planning items
```

---

### Task 1: Tạo data.json với item mẫu US-001

**Files:**
- Modify: `data.json`

- [ ] **Step 1: Ghi nội dung data.json**

```json
[
  {
    "id": "US-001",
    "title": "Phan Bo Giam Gia Hoa Don Vao Tung Hang Hoa",
    "module": "Bao cao ban hang theo hang hoa",
    "author": "Product Team",
    "date": "02/04/2026",
    "status": "Cho phat trien",
    "context": "Khi thu ngan giam gia tay tren toan bo hoa don (vi du: hoa don 500,000d -> giam 100,000d), he thong can phan bo khoan giam nay xuong tung dong hang hoa theo ty le gia tri.",
    "userStory": {
      "as": "Thu ngan / Ke toan",
      "iWant": "He thong tu dong phan bo khoan giam gia tay tren hoa don xuong tung dong hang hoa theo ty le gia tri cua moi item",
      "soThat": "Bao cao hang hoa hien thi dung Doanh thu thuan va Chenh lech cho tung san pham"
    },
    "example": {
      "description": "Hoa don goc: 3 items, tong 500,000d, thu ngan giam tay 100,000d",
      "discount": 100000,
      "total": 500000,
      "items": [
        { "code": "SP000001", "name": "Sting", "qty": 2, "price": 30000 },
        { "code": "SP000002", "name": "Bia",   "qty": 3, "price": 30000 },
        { "code": "SP000003", "name": "Thuoc la", "qty": 1, "price": 350000 }
      ]
    },
    "acceptanceCriteria": [
      {
        "id": "AC-01",
        "title": "Phan bo dung theo ty le",
        "given": "Mot hoa don co N items, tong gia tri T, thu ngan giam tay D",
        "when": "Hoa don duoc hoan thanh (trang thai: Hoan thanh)",
        "then": "Moi item[i] duoc gan discount_allocated[i] = D x (line_total[i] / T). Dung Largest Remainder Method de lam tron. SUM(discount_allocated) = D"
      },
      {
        "id": "AC-02",
        "title": "Hien thi tren Bao cao hang hoa",
        "given": "Bao cao Ban hang theo hang hoa duoc mo",
        "when": "Co hoa don giam gia tay trong ky",
        "then": "Moi dong giao dich hien thi: Gia tri niem yet, Doanh thu thuan, Chenh lech (mau do neu am)"
      },
      {
        "id": "AC-03",
        "title": "Ghi chu nguon giam",
        "given": "Hoa don co giam gia tay",
        "when": "Bao cao hien thi",
        "then": "Footer ghi ro: (Da phan bo giam gia hoa don, giam gia phieu tra)"
      }
    ],
    "flow": "[THU NGAN]\n    |\n    v\nTao order -> Them items vao hoa don\n    |\n    v\nAp dung giam gia tay\n    |\n    v\nHoan thanh thanh toan\n    |\n    v\n--- TRIGGER: On Invoice Complete ---\n    |\n    v\n[BACKEND - Discount Allocation Service]\n    |- Lay invoice.discount_amount (D)\n    |- Lay danh sach line_items[]\n    |- Tinh total = SUM(line_total[i])\n    |- FOR each item[i]: allocated[i] = FLOOR(D x line_total[i] / total)\n    |- Largest Remainder cho phan du\n    L- SUM CHECK: SUM(allocated) == D",
    "dbChanges": "ALTER TABLE order_items ADD COLUMN discount_allocated BIGINT DEFAULT 0;\n-- Gia tri giam duoc phan bo tu invoice discount (don vi: dong)\n\nALTER TABLE order_items ADD COLUMN net_revenue BIGINT;\n-- = (quantity x unit_price) - discount_direct - discount_allocated",
    "edgeCases": [
      { "case": "Hoa don co 1 item", "handle": "Toan bo giam gia ve item do" },
      { "case": "Giam gia > tong hoa don", "handle": "Validate: khong cho giam vuot tong" },
      { "case": "Item co SL = 0", "handle": "Bo qua item do trong phan bo" },
      { "case": "Lam tron le (7d / 3 items)", "handle": "Largest Remainder -> [3, 2, 2]" }
    ],
    "notes": [
      "Khong tinh lai discount_allocated khi chi xem bao cao",
      "Neu hoa don bi sua lai sau hoan thanh -> trigger tinh lai phan bo",
      "Log moi truong hop SUM(allocated) != D de debug",
      "Don vi tinh: VND nguyen (integer), khong dung float"
    ]
  }
]
```

- [ ] **Step 2: Verify JSON hợp lệ**

```bash
node -e "JSON.parse(require('fs').readFileSync('data.json','utf8')); console.log('OK')"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add data.json
git commit -m "feat: add data.json with US-001 sample"
```

---

### Task 2: HTML skeleton + light theme CSS

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Thay toàn bộ nội dung index.html**

```html
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Arena Planning</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; }

/* NAV TABS */
.nav { display: flex; background: #fff; border-bottom: 1px solid #e2e8f0; padding: 0 32px; position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.nav-tab { padding: 14px 20px; font-size: 13px; font-weight: 600; color: #94a3b8; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s; white-space: nowrap; }
.nav-tab:hover { color: #1e293b; }
.nav-tab.active { color: #2563eb; border-bottom-color: #2563eb; }

/* PAGES */
.page { display: none; min-height: calc(100vh - 49px); }
.page.active { display: block; }

/* HEADER */
.page-header { background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%); border-bottom: 1px solid #e2e8f0; padding: 24px 40px; }
.page-header h1 { font-size: 20px; font-weight: 700; color: #0f172a; }
.header-meta { font-size: 12px; color: #64748b; margin-top: 4px; }
.badges { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-blue   { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
.badge-green  { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.badge-orange { background: #ffedd5; color: #c2410c; border: 1px solid #fed7aa; }
.badge-gray   { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

/* CONTENT */
.content { padding: 28px 40px; max-width: 900px; }
.section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #94a3b8; margin-bottom: 12px; margin-top: 24px; }
.section-title:first-child { margin-top: 0; }

/* Context */
.context-box { background: #fff; border: 1px solid #e2e8f0; border-left: 3px solid #2563eb; border-radius: 8px; padding: 16px 18px; font-size: 14px; color: #334155; line-height: 1.7; }

/* User Story */
.us-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 18px; margin-top: 12px; }
.us-row { display: flex; gap: 10px; margin-bottom: 8px; font-size: 13px; line-height: 1.6; }
.us-row:last-child { margin-bottom: 0; }
.us-label { font-weight: 700; color: #2563eb; min-width: 72px; flex-shrink: 0; }
.us-value { color: #334155; }

/* Example table */
.ex-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
.ex-table th { background: #f1f5f9; color: #64748b; font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; }
.ex-table td { padding: 8px 12px; border: 1px solid #e2e8f0; color: #334155; }
.ex-table tr.total-row td { font-weight: 700; background: #f8fafc; }
.discount-note { margin-top: 8px; font-size: 12px; color: #64748b; }

/* AC cards */
.ac-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
.ac-id { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; }
.ac-title { font-size: 14px; font-weight: 600; color: #0f172a; margin: 4px 0 10px; }
.ac-row { display: flex; gap: 10px; margin-bottom: 6px; font-size: 13px; }
.ac-row:last-child { margin-bottom: 0; }
.ac-label { font-weight: 700; min-width: 52px; flex-shrink: 0; }
.ac-label.given { color: #7c3aed; }
.ac-label.when  { color: #0369a1; }
.ac-label.then  { color: #15803d; }
.ac-text { color: #334155; line-height: 1.6; }

/* Flow */
.flow-pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 18px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 12px; color: #334155; line-height: 1.8; white-space: pre; overflow-x: auto; }

/* Edge cases */
.edge-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.edge-table th { background: #f1f5f9; color: #64748b; font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; }
.edge-table td { padding: 8px 12px; border: 1px solid #e2e8f0; color: #334155; }
.edge-table tr:hover td { background: #f8fafc; }

/* DB */
.db-pre { background: #0f172a; border-radius: 8px; padding: 16px 18px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 12px; color: #94a3b8; line-height: 1.8; white-space: pre; overflow-x: auto; }

/* Notes */
.note-list { list-style: none; }
.note-item { display: flex; gap: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-bottom: 8px; font-size: 13px; color: #334155; line-height: 1.6; }
.note-dot { width: 6px; height: 6px; border-radius: 50%; background: #2563eb; margin-top: 6px; flex-shrink: 0; }

/* 404 */
.not-found { text-align: center; padding: 80px 40px; }
.not-found h2 { font-size: 18px; color: #0f172a; margin-bottom: 8px; }
.not-found p { font-size: 14px; color: #64748b; }

/* Scrollbar */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
</style>
</head>
<body>
<div class="nav" id="nav"></div>
<div id="app"></div>
<script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add html skeleton and light theme css"
```

---

### Task 3: app.js — load data.json, parse URL, render item

**Files:**
- Create: `app.js`

- [ ] **Step 1: Tạo file app.js**

```js
// Escape HTML entities - ngan XSS khi render data tu JSON
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmt(n) {
  return Number(n).toLocaleString('vi-VN') + 'd';
}

const STATUS_BADGE = {
  'Cho phat trien':  'badge-blue',
  'Dang phat trien': 'badge-orange',
  'Hoan thanh':      'badge-green',
};

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'ac',       label: 'Acceptance Criteria' },
  { id: 'flow',     label: 'Flow' },
  { id: 'db',       label: 'DB Changes' },
  { id: 'notes',    label: 'Notes Dev' },
];

function showTab(id) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const tab = document.querySelector('.nav-tab[data-tab="' + id + '"]');
  const page = document.getElementById('page-' + id);
  if (tab)  tab.classList.add('active');
  if (page) page.classList.add('active');
}

// Tao element an toan khong dung innerHTML truc tiep voi du lieu nguoi dung
function el(tag, attrs, children) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (k === 'className') node.className = v;
    else if (k === 'textContent') node.textContent = v;
    else node.setAttribute(k, v);
  });
  (children || []).forEach(c => {
    if (typeof c === 'string') node.appendChild(document.createTextNode(c));
    else if (c) node.appendChild(c);
  });
  return node;
}

function buildHeader(item) {
  const badgeClass = STATUS_BADGE[item.status] || 'badge-gray';
  const wrap = el('div', { className: 'page-header' });
  wrap.appendChild(el('h1', { textContent: item.title }));
  wrap.appendChild(el('div', { className: 'header-meta', textContent: item.module + ' \u00b7 ' + item.author + ' \u00b7 ' + item.date }));
  const badges = el('div', { className: 'badges' });
  badges.appendChild(el('span', { className: 'badge ' + badgeClass, textContent: item.status }));
  badges.appendChild(el('span', { className: 'badge badge-gray', textContent: item.id }));
  wrap.appendChild(badges);
  return wrap;
}

function buildOverview(item) {
  const page = el('div', { id: 'page-overview', className: 'page' });
  page.appendChild(buildHeader(item));
  const content = el('div', { className: 'content' });

  // Context
  content.appendChild(el('div', { className: 'section-title', textContent: 'Boi canh' }));
  content.appendChild(el('div', { className: 'context-box', textContent: item.context }));

  // User Story
  content.appendChild(el('div', { className: 'section-title', textContent: 'User Story' }));
  const usBox = el('div', { className: 'us-box' });
  [['As a', item.userStory.as], ['I want', item.userStory.iWant], ['So that', item.userStory.soThat]].forEach(function(pair) {
    const row = el('div', { className: 'us-row' });
    row.appendChild(el('span', { className: 'us-label', textContent: pair[0] }));
    row.appendChild(el('span', { className: 'us-value', textContent: pair[1] }));
    usBox.appendChild(row);
  });
  content.appendChild(usBox);

  // Example
  if (item.example) {
    content.appendChild(el('div', { className: 'section-title', textContent: 'Vi du minh hoa' }));
    content.appendChild(el('p', { textContent: item.example.description, style: 'font-size:13px;color:#64748b;margin-bottom:8px' }));

    const table = el('table', { className: 'ex-table' });
    const thead = el('thead');
    const hr = el('tr');
    ['Ma HH', 'Ten hang', 'SL', 'Don gia', 'Thanh tien'].forEach(function(h) {
      hr.appendChild(el('th', { textContent: h }));
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = el('tbody');
    var grandTotal = 0;
    item.example.items.forEach(function(i) {
      const total = i.qty * i.price;
      grandTotal += total;
      const tr = el('tr');
      [i.code, i.name, i.qty, fmt(i.price), fmt(total)].forEach(function(v) {
        tr.appendChild(el('td', { textContent: String(v) }));
      });
      tbody.appendChild(tr);
    });
    // Total row
    const totalTr = el('tr', { className: 'total-row' });
    const tdLabel = el('td', { textContent: 'TONG', colspan: '4' });
    totalTr.appendChild(tdLabel);
    totalTr.appendChild(el('td', { textContent: fmt(grandTotal) }));
    tbody.appendChild(totalTr);
    table.appendChild(tbody);
    content.appendChild(table);

    const note = el('p', { className: 'discount-note' });
    note.textContent = 'Thu ngan giam tay: ' + fmt(item.example.discount) + ' - Khach tra: ' + fmt(grandTotal - item.example.discount);
    content.appendChild(note);
  }

  page.appendChild(content);
  return page;
}

function buildAC(item) {
  const page = el('div', { id: 'page-ac', className: 'page' });
  page.appendChild(buildHeader(item));
  const content = el('div', { className: 'content' });
  content.appendChild(el('div', { className: 'section-title', textContent: 'Acceptance Criteria - ' + item.acceptanceCriteria.length + ' tieu chi' }));

  item.acceptanceCriteria.forEach(function(ac) {
    const card = el('div', { className: 'ac-card' });
    card.appendChild(el('div', { className: 'ac-id', textContent: ac.id }));
    card.appendChild(el('div', { className: 'ac-title', textContent: ac.title }));
    [['GIVEN', 'given', ac.given], ['WHEN', 'when', ac.when], ['THEN', 'then', ac.then]].forEach(function(r) {
      const row = el('div', { className: 'ac-row' });
      row.appendChild(el('span', { className: 'ac-label ' + r[1], textContent: r[0] }));
      row.appendChild(el('span', { className: 'ac-text', textContent: r[2] }));
      card.appendChild(row);
    });
    content.appendChild(card);
  });

  page.appendChild(content);
  return page;
}

function buildFlow(item) {
  const page = el('div', { id: 'page-flow', className: 'page' });
  page.appendChild(buildHeader(item));
  const content = el('div', { className: 'content' });

  content.appendChild(el('div', { className: 'section-title', textContent: 'Flow xu ly' }));
  content.appendChild(el('pre', { className: 'flow-pre', textContent: item.flow }));

  if (item.edgeCases && item.edgeCases.length) {
    content.appendChild(el('div', { className: 'section-title', textContent: 'Edge Cases', style: 'margin-top:24px' }));
    const table = el('table', { className: 'edge-table' });
    const thead = el('thead');
    const hr = el('tr');
    ['Truong hop', 'Xu ly'].forEach(function(h) { hr.appendChild(el('th', { textContent: h })); });
    thead.appendChild(hr);
    table.appendChild(thead);
    const tbody = el('tbody');
    item.edgeCases.forEach(function(e) {
      const tr = el('tr');
      tr.appendChild(el('td', { textContent: e.case }));
      tr.appendChild(el('td', { textContent: e.handle }));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    content.appendChild(table);
  }

  page.appendChild(content);
  return page;
}

function buildDB(item) {
  const page = el('div', { id: 'page-db', className: 'page' });
  if (!item.dbChanges) return page;
  page.appendChild(buildHeader(item));
  const content = el('div', { className: 'content' });
  content.appendChild(el('div', { className: 'section-title', textContent: 'DB Changes' }));
  content.appendChild(el('pre', { className: 'db-pre', textContent: item.dbChanges }));
  page.appendChild(content);
  return page;
}

function buildNotes(item) {
  const page = el('div', { id: 'page-notes', className: 'page' });
  if (!item.notes || !item.notes.length) return page;
  page.appendChild(buildHeader(item));
  const content = el('div', { className: 'content' });
  content.appendChild(el('div', { className: 'section-title', textContent: 'Notes cho Dev' }));
  const ul = el('ul', { className: 'note-list' });
  item.notes.forEach(function(n) {
    const li = el('li', { className: 'note-item' });
    li.appendChild(el('div', { className: 'note-dot' }));
    li.appendChild(el('span', { textContent: n }));
    ul.appendChild(li);
  });
  content.appendChild(ul);
  page.appendChild(content);
  return page;
}

function renderNotFound(id) {
  const wrap = el('div', { className: 'not-found' });
  wrap.appendChild(el('h2', { textContent: 'Khong tim thay planning item' }));
  wrap.appendChild(el('p', { textContent: 'ID ' + (id || '(trong)') + ' khong ton tai trong data.json' }));
  document.getElementById('app').appendChild(wrap);
}

function renderNav(item) {
  const nav = document.getElementById('nav');
  TABS.forEach(function(t) {
    if (t.id === 'db' && !item.dbChanges) return;
    if (t.id === 'notes' && (!item.notes || !item.notes.length)) return;
    const tab = el('div', { className: 'nav-tab', 'data-tab': t.id, textContent: t.label });
    tab.addEventListener('click', function() { showTab(t.id); });
    nav.appendChild(tab);
  });
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) { renderNotFound(''); return; }

  let data;
  try {
    const res = await fetch('./data.json');
    if (!res.ok) throw new Error('fetch failed');
    data = await res.json();
  } catch (e) {
    renderNotFound(id);
    return;
  }

  const item = data.find(function(d) { return d.id === id; });
  if (!item) { renderNotFound(id); return; }

  document.title = item.id + ' - ' + item.title;
  renderNav(item);

  const app = document.getElementById('app');
  app.appendChild(buildOverview(item));
  app.appendChild(buildAC(item));
  app.appendChild(buildFlow(item));
  app.appendChild(buildDB(item));
  app.appendChild(buildNotes(item));

  showTab('overview');
}

init();
```

- [ ] **Step 2: Verify qua local HTTP server**

```bash
cd /home/vuongwnguyen/CODE/ArenaBilliard/planing && python3 -m http.server 8080
```

Mở `http://localhost:8080/?id=US-001` — kiểm tra:
- [ ] Header: title, module, author, date, badges hiển thị đúng
- [ ] Tab Overview: Context box + User Story box + Example table
- [ ] Tab Acceptance Criteria: 3 AC cards với GIVEN/WHEN/THEN
- [ ] Tab Flow: flow text + edge cases table
- [ ] Tab DB: SQL text đen
- [ ] Tab Notes: 4 ghi chú

- [ ] **Step 3: Test URL không tồn tại**

Mở `http://localhost:8080/?id=NOTEXIST` — expected: "Khong tim thay", không lỗi console.

- [ ] **Step 4: Test không có ?id**

Mở `http://localhost:8080/` — expected: "Khong tim thay" với ID "(trong)".

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: add app.js - render planning item from data.json by ?id param"
```

---

### Task 4: GitHub Pages setup

- [ ] **Step 1: Push lên main**

```bash
git push origin main
```

- [ ] **Step 2: Bật GitHub Pages trên repo**

Vào repo GitHub -> Settings -> Pages -> Source: **Deploy from a branch** -> Branch: `main` -> Folder: `/ (root)` -> Save.

- [ ] **Step 3: Chờ 1-2 phút rồi kiểm tra**

```
https://<username>.github.io/<repo-name>/?id=US-001
```

Kiểm tra tất cả tabs hoạt động đúng như local.

---

## Self-Review

**Spec coverage:**
- [x] URL scheme `?id=` -> `init()` parse URLSearchParams
- [x] Không có id / không tìm thấy -> `renderNotFound()`
- [x] Light theme -> Task 2 CSS
- [x] Nav tabs -> `renderNav()` + `showTab()`
- [x] Header với badges -> `buildHeader()`
- [x] Context -> `buildOverview()`
- [x] User Story box As/I want/So that -> `buildOverview()`
- [x] Example table -> `buildOverview()`
- [x] AC cards GIVEN/WHEN/THEN -> `buildAC()`
- [x] Flow text -> `buildFlow()`
- [x] Edge cases table -> `buildFlow()`
- [x] DB SQL -> `buildDB()`
- [x] Notes list -> `buildNotes()`
- [x] Tabs an neu field khong co -> `renderNav()` filter
- [x] XSS prevention -> `esc()` + DOM API thay vi innerHTML voi data nguoi dung
- [x] GitHub Pages -> Task 4

**Placeholder scan:** Khong co TBD/TODO.

**Type consistency:** `item.id/title/module/author/date/status/context/userStory/example/acceptanceCriteria/flow/dbChanges/edgeCases/notes` nhat quan tu Task 1 (data.json) den Task 3 (app.js).
