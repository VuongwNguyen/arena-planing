function fmt(n) {
  return Number(n).toLocaleString('vi-VN') + 'd';
}

const STATUS_BADGE = {
  'Chờ phát triển':  'badge-blue',
  'Đang phát triển': 'badge-orange',
  'Hoàn thành':      'badge-green',
};

const TABS = [
  { id: 'overview',  label: '📋 Overview' },
  { id: 'ac',        label: '✅ Acceptance Criteria' },
  { id: 'flow',      label: '🔀 Flow' },
  { id: 'sprint',    label: '🗓️ Sprint Plan' },
  { id: 'db',        label: '🗄️ DB Changes' },
  { id: 'notes',     label: '📝 Notes Dev' },
  { id: 'testcase',  label: '🧪 Testcase' },
];

function showTab(id) {
  document.querySelectorAll('#nav-tabs .nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const tab = document.querySelector('#nav-tabs .nav-tab[data-tab="' + id + '"]');
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
  content.appendChild(el('div', { className: 'section-title', textContent: '🎯 Bối cảnh' }));
  content.appendChild(el('div', { className: 'context-box', textContent: item.context }));

  // User Story
  content.appendChild(el('div', { className: 'section-title', textContent: '👤 User Story' }));
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
    content.appendChild(el('div', { className: 'section-title', textContent: '📊 Ví dụ minh hoạ' }));
    content.appendChild(el('p', { textContent: item.example.description, style: 'font-size:13px;color:#64748b;margin-bottom:8px' }));

    const table = el('table', { className: 'ex-table' });
    const thead = el('thead');
    const hr = el('tr');
    ['Mã HH', 'Tên hàng', 'SL', 'Đơn giá', 'Thành tiền'].forEach(function(h) {
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
    const tdLabel = el('td', { textContent: 'TỔNG', colspan: '4' });
    totalTr.appendChild(tdLabel);
    totalTr.appendChild(el('td', { textContent: fmt(grandTotal) }));
    tbody.appendChild(totalTr);
    table.appendChild(tbody);
    content.appendChild(table);

    const note = el('p', { className: 'discount-note' });
    note.textContent = 'Thu ngân giảm tay: ' + fmt(item.example.discount) + ' · Khách trả: ' + fmt(grandTotal - item.example.discount);
    content.appendChild(note);
  }

  page.appendChild(content);
  return page;
}

function buildAC(item) {
  const page = el('div', { id: 'page-ac', className: 'page' });
  page.appendChild(buildHeader(item));
  const content = el('div', { className: 'content' });
  content.appendChild(el('div', { className: 'section-title', textContent: '✅ Acceptance Criteria — ' + item.acceptanceCriteria.length + ' tiêu chí' }));

  item.acceptanceCriteria.forEach(function(ac) {
    const card = el('div', { className: 'ac-card' });
    card.appendChild(el('div', { className: 'ac-id', textContent: ac.id }));
    card.appendChild(el('div', { className: 'ac-title', textContent: ac.title }));
    const rows = el('div', { className: 'ac-rows' });
    [['GIVEN', 'given', ac.given], ['WHEN', 'when', ac.when], ['THEN', 'then', ac.then]].forEach(function(r) {
      const row = el('div', { className: 'ac-row' });
      row.appendChild(el('span', { className: 'ac-label ' + r[1], textContent: r[0] }));
      row.appendChild(el('span', { className: 'ac-text', textContent: r[2] }));
      rows.appendChild(row);
    });
    card.appendChild(rows);
    content.appendChild(card);
  });

  page.appendChild(content);
  return page;
}

function buildFlow(item) {
  const page = el('div', { id: 'page-flow', className: 'page' });
  page.appendChild(buildHeader(item));
  const content = el('div', { className: 'content' });

  content.appendChild(el('div', { className: 'section-title', textContent: '🔀 Flow xử lý' }));
  content.appendChild(el('pre', { className: 'flow-pre', textContent: item.flow }));

  if (item.edgeCases && item.edgeCases.length) {
    content.appendChild(el('div', { className: 'section-title', textContent: '⚠️ Edge Cases', style: 'margin-top:24px' }));
    const table = el('table', { className: 'edge-table' });
    const thead = el('thead');
    const hr = el('tr');
    ['Trường hợp', 'Xử lý'].forEach(function(h) { hr.appendChild(el('th', { textContent: h })); });
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
  if (!item.dbChanges) return null;
  const page = el('div', { id: 'page-db', className: 'page' });
  page.appendChild(buildHeader(item));
  const content = el('div', { className: 'content' });
  content.appendChild(el('div', { className: 'section-title', textContent: '🗄️ DB Changes' }));
  content.appendChild(el('pre', { className: 'db-pre', textContent: item.dbChanges }));
  page.appendChild(content);
  return page;
}

function buildNotes(item) {
  if (!item.notes || !item.notes.length) return null;
  const page = el('div', { id: 'page-notes', className: 'page' });
  page.appendChild(buildHeader(item));
  const content = el('div', { className: 'content' });
  content.appendChild(el('div', { className: 'section-title', textContent: '📝 Notes cho Dev' }));
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
  wrap.appendChild(el('h2', { textContent: '🔍 Không tìm thấy planning item' }));
  wrap.appendChild(el('p', { textContent: 'ID ' + (id || '(trống)') + ' không tồn tại trong data.json' }));
  document.getElementById('app').appendChild(wrap);
}

const SPRINT_COLOR = {
  purple: { bg: '#f5f3ff', border: '#7c3aed', text: '#5b21b6', dot: '#7c3aed' },
  teal:   { bg: '#f0fdf9', border: '#0f9b7a', text: '#065f46', dot: '#0f9b7a' },
  blue:   { bg: '#eff6ff', border: '#2563eb', text: '#1e40af', dot: '#2563eb' },
  amber:  { bg: '#fffbeb', border: '#d97706', text: '#92400e', dot: '#d97706' },
  green:  { bg: '#f0fdf4', border: '#16a34a', text: '#14532d', dot: '#16a34a' },
};

const TAG_COLOR = {
  'Dev':    { bg: '#eff6ff', color: '#1e40af' },
  'Claude': { bg: '#f5f3ff', color: '#5b21b6' },
  'Team':   { bg: '#f0fdf9', color: '#065f46' },
  'Git':    { bg: '#fffbeb', color: '#92400e' },
  'Kham cap': { bg: '#fef2f2', color: '#991b1b' },
};

function buildSprint(item) {
  if (!item.sprintPlan) return null;
  const sp = item.sprintPlan;
  const page = el('div', { id: 'page-sprint', className: 'page' });
  page.appendChild(buildHeader(item));
  const content = el('div', { className: 'content' });

  // Sprint header info
  const info = el('div', { className: 'sprint-info' });
  info.appendChild(el('span', { className: 'sprint-info-item', textContent: '📅 ' + sp.startDate + ' → ' + sp.endDate }));
  info.appendChild(el('span', { className: 'sprint-info-sep', textContent: '·' }));
  info.appendChild(el('span', { className: 'sprint-info-item', textContent: '6 ngày làm việc' }));
  content.appendChild(info);

  // Git rule banner
  const rule = el('div', { className: 'sprint-rule' });
  rule.appendChild(el('span', { textContent: '⚠️' }));
  const ruleText = el('span');
  ruleText.textContent = 'Quy tắc mỗi ngày: Đầu ngày chạy ';
  const ruleCode = el('code', { textContent: 'git pull origin develop' });
  ruleText.appendChild(ruleCode);
  ruleText.appendChild(document.createTextNode(' về nhánh feature. Có conflict → giải quyết ngay.'));
  rule.appendChild(ruleText);
  content.appendChild(rule);

  // Day cards
  sp.days.forEach(function(day) {
    const c = SPRINT_COLOR[day.color] || SPRINT_COLOR.blue;
    const card = el('div', { className: 'sprint-card' });
    card.style.borderLeftColor = c.border;

    // Card header
    const header = el('div', { className: 'sprint-card-header' });
    const badge = el('span', { className: 'sprint-day-badge', textContent: day.day });
    badge.style.background = c.bg;
    badge.style.color = c.text;
    badge.style.borderColor = c.border;
    header.appendChild(badge);

    const titleWrap = el('div');
    titleWrap.appendChild(el('div', { className: 'sprint-day-date', textContent: day.date }));
    titleWrap.appendChild(el('div', { className: 'sprint-day-theme', textContent: day.theme }));
    header.appendChild(titleWrap);
    card.appendChild(header);

    // Task list
    const ul = el('ul', { className: 'sprint-task-list' });
    day.tasks.forEach(function(task) {
      const li = el('li', { className: 'sprint-task-item' });

      const dot = el('div', { className: 'sprint-task-dot' });
      dot.style.borderColor = c.dot;
      li.appendChild(dot);

      const textWrap = el('div', { className: 'sprint-task-text' });
      textWrap.appendChild(document.createTextNode(task.text));

      // Tags
      if (task.tags && task.tags.length) {
        task.tags.forEach(function(tag) {
          const tc = TAG_COLOR[tag] || { bg: '#f1f5f9', color: '#475569' };
          const t = el('span', { className: 'sprint-tag', textContent: tag });
          t.style.background = tc.bg;
          t.style.color = tc.color;
          textWrap.appendChild(t);
        });
      }
      li.appendChild(textWrap);
      ul.appendChild(li);
    });
    card.appendChild(ul);

    // Result
    const result = el('div', { className: 'sprint-result' });
    result.style.background = c.bg;
    result.style.color = c.text;
    result.appendChild(el('span', { textContent: '✓ ' }));
    result.appendChild(el('strong', { textContent: 'Kết thúc ' + day.day + ': ' }));
    result.appendChild(document.createTextNode(day.result));
    card.appendChild(result);

    content.appendChild(card);
  });

  page.appendChild(content);
  return page;
}

function exportTestcaseExcel(item) {
  var wb = XLSX.utils.book_new();

  // Cột header row 1 (merged)
  var headerRow1 = [
    'THÔNG TIN TESTCASE', '', '', '', '', '', '', '', '', '',
    'ROUND 1', '', '',
    'ROUND 2', '', '',
    'ROUND 3', '', ''
  ];
  // Cột header row 2
  var headerRow2 = [
    'Mã Testcase', 'Tên Testcase', 'Điều kiện tiên quyết', 'Bước thực hiện',
    'Kết quả mong đợi', 'Kết quả thực tế', 'Phiên bản', 'Evidence',
    'Trạng thái', 'Người chịu trách nhiệm',
    'Tester lần 1', 'Ngày test lần 1', 'Trạng thái lần 1',
    'Tester lần 2', 'Ngày test lần 2', 'Trạng thái lần 2',
    'Tester lần 3', 'Ngày test lần 3', 'Trạng thái lần 3'
  ];

  var dataRows = item.testcases.map(function(tc) {
    return [
      tc.ma_testcase || '',
      tc.ten_testcase || '',
      tc.dieu_kien_tien_quyet || '',
      tc.buoc_thuc_hien || '',
      tc.ket_qua_mong_doi || '',
      '', // Kết quả thực tế
      'v1.0.0',
      '', // Evidence
      '', // Trạng thái
      '', // Người chịu trách nhiệm
      '', '', '', // Round 1
      '', '', '', // Round 2
      '', '', ''  // Round 3
    ];
  });

  var wsData = [headerRow1, headerRow2].concat(dataRows);
  var ws = XLSX.utils.aoa_to_sheet(wsData);

  // Merge cells cho header row 1
  ws['!merges'] = [
    { s: { r: 0, c: 0  }, e: { r: 0, c: 9  } }, // THÔNG TIN TESTCASE: A1:J1
    { s: { r: 0, c: 10 }, e: { r: 0, c: 12 } }, // ROUND 1: K1:M1
    { s: { r: 0, c: 13 }, e: { r: 0, c: 15 } }, // ROUND 2: N1:P1
    { s: { r: 0, c: 16 }, e: { r: 0, c: 18 } }  // ROUND 3: Q1:S1
  ];

  // Độ rộng cột
  ws['!cols'] = [
    { wch: 12 }, // Mã Testcase
    { wch: 30 }, // Tên Testcase
    { wch: 40 }, // Điều kiện tiên quyết
    { wch: 45 }, // Bước thực hiện
    { wch: 45 }, // Kết quả mong đợi
    { wch: 25 }, // Kết quả thực tế
    { wch: 10 }, // Phiên bản
    { wch: 15 }, // Evidence
    { wch: 12 }, // Trạng thái
    { wch: 20 }, // Người chịu trách nhiệm
    { wch: 15 }, { wch: 15 }, { wch: 14 }, // Round 1
    { wch: 15 }, { wch: 15 }, { wch: 14 }, // Round 2
    { wch: 15 }, { wch: 15 }, { wch: 14 }  // Round 3
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');
  XLSX.writeFile(wb, item.id + '_testcase_v1.0.0.xlsx');
}

function buildTestcase(item) {
  if (!item.testcases || !item.testcases.length) return null;
  const page = el('div', { id: 'page-testcase', className: 'page' });
  page.appendChild(buildHeader(item));
  const content = el('div', { className: 'content tc-content' });

  // Đếm theo loại
  const counts = { 'Happy Path': 0, 'Edge Case': 0, 'Error Case': 0 };
  item.testcases.forEach(function(tc) { counts[tc.loai] = (counts[tc.loai] || 0) + 1; });

  // Toolbar: stats + export
  const toolbar = el('div', { className: 'tc-toolbar' });
  const statsWrap = el('div', { className: 'tc-stats' });
  statsWrap.appendChild(el('span', { className: 'tc-stat-total', textContent: 'Tổng: ' + item.testcases.length + ' testcase' }));
  [['Happy Path', 'tc-badge-happy'], ['Edge Case', 'tc-badge-edge'], ['Error Case', 'tc-badge-error']].forEach(function(pair) {
    if (!counts[pair[0]]) return;
    statsWrap.appendChild(el('span', { className: 'tc-stat-badge ' + pair[1], textContent: pair[0] + ' (' + counts[pair[0]] + ')' }));
  });
  toolbar.appendChild(statsWrap);
  const exportBtn = el('button', { className: 'tc-export-btn', textContent: '⬇ Xuất Excel' });
  exportBtn.addEventListener('click', function() { exportTestcaseExcel(item); });
  toolbar.appendChild(exportBtn);
  content.appendChild(toolbar);

  // Filter bar
  const filterBar = el('div', { className: 'tc-filter-bar' });
  const filterBtns = {};
  ['Tất cả', 'Happy Path', 'Edge Case', 'Error Case'].forEach(function(f) {
    const btn = el('button', { className: 'tc-filter-btn' + (f === 'Tất cả' ? ' active' : ''), textContent: f });
    btn.addEventListener('click', function() {
      Object.values(filterBtns).forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      tbody.querySelectorAll('tr').forEach(function(row) {
        row.style.display = (f === 'Tất cả' || row.getAttribute('data-loai') === f) ? '' : 'none';
      });
    });
    filterBtns[f] = btn;
    filterBar.appendChild(btn);
  });
  content.appendChild(filterBar);

  // Bảng testcase
  const tableWrap = el('div', { className: 'tc-table-wrap' });
  const table = el('table', { className: 'tc-table' });
  const thead = el('thead');
  const hr = el('tr');
  ['#', 'Mã TC', 'Tên testcase', 'Nhóm', 'Loại', 'Điều kiện tiên quyết', 'Bước thực hiện', 'Kết quả mong đợi'].forEach(function(h) {
    hr.appendChild(el('th', { textContent: h }));
  });
  thead.appendChild(hr);
  table.appendChild(thead);

  var tbody = el('tbody');
  item.testcases.forEach(function(tc, i) {
    const tr = el('tr', { 'data-loai': tc.loai });
    tr.appendChild(el('td', { textContent: String(i + 1), className: 'tc-num' }));
    tr.appendChild(el('td', { textContent: tc.ma_testcase, className: 'tc-id' }));
    tr.appendChild(el('td', { textContent: tc.ten_testcase, className: 'tc-title-cell' }));
    tr.appendChild(el('td', { textContent: tc.nhom, className: 'tc-nhom-cell' }));
    const loaiCls = tc.loai === 'Happy Path' ? 'tc-badge-happy' : tc.loai === 'Edge Case' ? 'tc-badge-edge' : 'tc-badge-error';
    const loaiTd = el('td', { className: 'tc-loai-cell' });
    loaiTd.appendChild(el('span', { className: 'tc-badge ' + loaiCls, textContent: tc.loai }));
    tr.appendChild(loaiTd);
    tr.appendChild(el('td', { textContent: tc.dieu_kien_tien_quyet, className: 'tc-pre-cell' }));
    tr.appendChild(el('td', { textContent: tc.buoc_thuc_hien,       className: 'tc-pre-cell' }));
    tr.appendChild(el('td', { textContent: tc.ket_qua_mong_doi,     className: 'tc-pre-cell' }));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableWrap.appendChild(table);
  content.appendChild(tableWrap);

  page.appendChild(content);
  return page;
}

function renderNav(item) {
  const nav = document.getElementById('nav-tabs');
  TABS.forEach(function(t) {
    if (t.id === 'sprint'    && !item.sprintPlan) return;
    if (t.id === 'db'        && !item.dbChanges) return;
    if (t.id === 'notes'     && (!item.notes || !item.notes.length)) return;
    if (t.id === 'testcase'  && (!item.testcases || !item.testcases.length)) return;
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
    const res = await fetch('./data.json?v=' + Date.now());
    if (!res.ok) throw new Error('fetch failed');
    data = await res.json();
  } catch (e) {
    console.error('[arena-planning] fetch error:', e);
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
  const sprintPage = buildSprint(item);
  if (sprintPage) app.appendChild(sprintPage);
  const dbPage = buildDB(item);
  if (dbPage) app.appendChild(dbPage);
  const notesPage = buildNotes(item);
  if (notesPage) app.appendChild(notesPage);
  const testcasePage = buildTestcase(item);
  if (testcasePage) app.appendChild(testcasePage);

  showTab('overview');
}

init();
