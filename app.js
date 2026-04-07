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
  if (item.jiraId) {
    const jiraLink = el('a', { className: 'badge badge-jira', textContent: '🔗 ' + item.jiraId, href: 'https://arena-platform.atlassian.net/browse/' + item.jiraId, target: '_blank' });
    badges.appendChild(jiraLink);
  }
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

  // Mockup
  if (item.mockupUrl) {
    content.appendChild(el('div', { className: 'section-title', textContent: '🖼️ Mockup / Giao diện' }));
    const urls = Array.isArray(item.mockupUrl) ? item.mockupUrl : [item.mockupUrl];
    const mockupWrap = el('div', { className: 'mockup-wrap' });
    urls.forEach(function(url, idx) {
      const img = el('img', { src: url, alt: 'Mockup ' + (idx + 1), className: 'mockup-img' });
      const link = el('a', { href: url, target: '_blank', className: 'mockup-link', textContent: '🔗 Xem ảnh ' + (idx + 1) });
      img.onerror = function() { img.style.display = 'none'; link.style.display = 'inline-block'; };
      mockupWrap.appendChild(img);
      mockupWrap.appendChild(link);
    });
    content.appendChild(mockupWrap);
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

  var NAVY = '1F3864', ORANGE = 'ED7D31', BLUE = '2E75B6', WHITE = 'FFFFFF';

  function border() {
    var s = { style: 'thin', color: { rgb: 'D9D9D9' } };
    return { top: s, bottom: s, left: s, right: s };
  }
  function sHead(fill) {
    return {
      fill: { patternType: 'solid', fgColor: { rgb: fill } },
      font: { bold: true, color: { rgb: WHITE }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: border()
    };
  }
  var sData = { alignment: { vertical: 'top', wrapText: true }, border: border() };
  var sDataID = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'top', wrapText: true }, border: border() };

  var row1 = ['THÔNG TIN TESTCASE','','','','','','','','','','ROUND 1','','','ROUND 2','','','ROUND 3','',''];
  var row2 = ['Mã Testcase','Tên Testcase','Điều kiện tiên quyết','Bước thực hiện','Kết quả mong đợi','Kết quả thực tế','Phiên bản','Evidence','Trạng thái','Người chịu trách nhiệm','Tester lần 1','Ngày test lần 1','Trạng thái lần 1','Tester lần 2','Ngày test lần 2','Trạng thái lần 2','Tester lần 3','Ngày test lần 3','Trạng thái lần 3'];
  var dataRows = item.testcases.map(function(tc) {
    return [tc.ma_testcase||'', tc.ten_testcase||'', tc.dieu_kien_tien_quyet||'', tc.buoc_thuc_hien||'', tc.ket_qua_mong_doi||'', '', 'v1.0.0', '', '', 'Vương', '','','','','','','','',''];
  });

  var ws = XLSX.utils.aoa_to_sheet([row1, row2].concat(dataRows));

  // Style row 1
  for (var c = 0; c < 19; c++) {
    var a = XLSX.utils.encode_cell({ r: 0, c: c });
    if (!ws[a]) ws[a] = { v: '', t: 's' };
    ws[a].s = sHead(c < 10 ? NAVY : BLUE);
  }
  // Style row 2
  for (var c = 0; c < 19; c++) {
    var a = XLSX.utils.encode_cell({ r: 1, c: c });
    if (!ws[a]) ws[a] = { v: '', t: 's' };
    ws[a].s = sHead(c < 5 ? NAVY : c < 10 ? ORANGE : BLUE);
  }
  // Style data rows
  for (var r = 2; r < dataRows.length + 2; r++) {
    for (var c = 0; c < 19; c++) {
      var a = XLSX.utils.encode_cell({ r: r, c: c });
      if (!ws[a]) ws[a] = { v: '', t: 's' };
      ws[a].s = (c === 0) ? sDataID : sData;
    }
  }

  ws['!merges'] = [
    { s: { r:0, c:0  }, e: { r:0, c:9  } },
    { s: { r:0, c:10 }, e: { r:0, c:12 } },
    { s: { r:0, c:13 }, e: { r:0, c:15 } },
    { s: { r:0, c:16 }, e: { r:0, c:18 } }
  ];
  ws['!cols'] = [
    {wch:10},{wch:25},{wch:30},{wch:35},{wch:30},
    {wch:18},{wch:12},{wch:12},{wch:15},{wch:22},
    {wch:15},{wch:15},{wch:14},{wch:15},{wch:15},{wch:14},{wch:15},{wch:15},{wch:14}
  ];
  ws['!rows'] = [{hpt:28},{hpt:36}];

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

  if (params.get('view') === 'jira') {
    document.title = 'Jira Board \u2014 Arena Planning';
    await renderJiraBoard(document.getElementById('app'));
    return;
  }

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

// ============================================================
// JIRA BOARD
// ============================================================
const JIRA_BASE  = 'https://arena-platform.atlassian.net';
const JIRA_EMAIL = 'nguyenvuongw134@gmail.com';
const JIRA_BOARD = 139;

const CORS_PROXY = 'https://corsproxy.io/?url=';

function jiraToken()     { return localStorage.getItem('jira_token') || ''; }
function jiraSetToken(t) { localStorage.setItem('jira_token', t); }
function jiraAuth()      { return 'Basic ' + btoa(JIRA_EMAIL + ':' + jiraToken()); }
function clearEl(node)   { while (node.firstChild) node.removeChild(node.firstChild); }

async function jiraFetch(path, opts) {
  const directUrl = JIRA_BASE + path;
  const url = CORS_PROXY + encodeURIComponent(directUrl);
  const r = await fetch(url, Object.assign({
    headers: { 'Authorization': jiraAuth(), 'Content-Type': 'application/json', 'x-requested-with': 'XMLHttpRequest' }
  }, opts || {}));
  if (!r.ok) {
    const msg = await r.text().catch(function() { return ''; });
    throw new Error('HTTP ' + r.status + (msg ? ': ' + msg.slice(0, 120) : ''));
  }
  return r.status === 204 ? null : r.json();
}

const JIRA_S = {
  'To Do':       { cls: 'jira-status-todo',     label: 'To Do',       next: 'In Progress' },
  'In Progress': { cls: 'jira-status-progress', label: 'In Progress', next: 'Done' },
  'IN PROGRESS': { cls: 'jira-status-progress', label: 'In Progress', next: 'Done' },
  'Done':        { cls: 'jira-status-done',      label: 'Done',        next: 'To Do' },
  'DONE':        { cls: 'jira-status-done',      label: 'Done',        next: 'To Do' },
};

function buildJiraChip(statusName, issueKey, clickable) {
  var s = JIRA_S[statusName] || { cls: 'jira-status-todo', label: statusName, next: 'In Progress' };
  var chip = el('span', { className: 'jira-status' + (clickable ? ' clickable' : '') + ' ' + s.cls, textContent: s.label });
  if (!clickable) return chip;
  chip.title = 'Click \u2192 m\u1EDF Jira \u0111\u1EC3 c\u1EADp nh\u1EADt status';
  chip.addEventListener('click', function() {
    window.open(JIRA_BASE + '/browse/' + issueKey, '_blank');
  });
  return chip;
}

async function renderJiraBoard(container) {
  clearEl(container);

  var navBtn = document.getElementById('nav-jira-btn');
  if (navBtn) navBtn.classList.add('active');

  if (!jiraToken()) {
    var setup = el('div', { className: 'jira-setup' });
    setup.appendChild(el('div', { className: 'jira-setup-icon', textContent: '\uD83D\uDD11' }));
    setup.appendChild(el('h2', { textContent: 'K\u1EBFt n\u1ED1i Jira' }));
    setup.appendChild(el('p', { textContent: 'Nh\u1EADp Atlassian API token \u0111\u1EC3 xem sprint board.' }));
    var inp = el('input', { type: 'password', className: 'jira-token-input', placeholder: 'API Token...' });
    var btn = el('button', { className: 'jira-connect-btn', textContent: 'K\u1EBFt n\u1ED1i' });
    btn.addEventListener('click', function() {
      var t = inp.value.trim();
      if (!t) { inp.focus(); return; }
      jiraSetToken(t);
      renderJiraBoard(container);
    });
    inp.addEventListener('keydown', function(e) { if (e.key === 'Enter') btn.click(); });
    setup.appendChild(inp);
    setup.appendChild(btn);
    container.appendChild(el('div', { className: 'jira-container' }, [setup]));
    return;
  }

  var wrap = el('div', { className: 'jira-container' });
  container.appendChild(wrap);
  var loading = el('div', { className: 'jira-loading', textContent: '\u23F3 \u0110ang t\u1EA3i sprint...' });
  wrap.appendChild(loading);

  try {
    var sprintData = await jiraFetch('/rest/agile/1.0/board/' + JIRA_BOARD + '/sprint?state=active');
    var sprint = sprintData.values && sprintData.values[0];
    if (!sprint) throw new Error('Kh\u00F4ng c\u00F3 sprint active');

    var issueData = await jiraFetch(
      '/rest/agile/1.0/sprint/' + sprint.id +
      '/issue?maxResults=100&fields=summary,status,timetracking,parent,issuetype,assignee'
    );

    if (wrap.contains(loading)) wrap.removeChild(loading);

    var totalSec = 0;
    issueData.issues.forEach(function(i) {
      var s = i.fields.timetracking && i.fields.timetracking.originalEstimateSeconds;
      if (s) totalSec += s;
    });

    var startD = (sprint.startDate || '').slice(0, 10);
    var endD   = (sprint.endDate   || '').slice(0, 10);

    var spHdr = el('div', { className: 'jira-sprint-header' });
    spHdr.appendChild(el('div', { className: 'jira-sprint-name', textContent: '\uD83D\uDCC5 ' + sprint.name }));
    if (startD) spHdr.appendChild(el('div', { className: 'jira-sprint-dates', textContent: startD + ' \u2192 ' + endD }));
    if (totalSec) spHdr.appendChild(el('span', { className: 'jira-sprint-total', textContent: Math.round(totalSec / 3600) + 'h t\u1ED5ng' }));
    var resetBtn = el('button', { className: 'jira-reset-btn', textContent: '\uD83D\uDD11 \u0110\u1ED5i token' });
    resetBtn.addEventListener('click', function() {
      localStorage.removeItem('jira_token');
      renderJiraBoard(container);
    });
    spHdr.appendChild(resetBtn);
    wrap.appendChild(spHdr);

    var stories = {};
    var orphans = [];
    issueData.issues.forEach(function(iss) {
      var type = iss.fields.issuetype.name;
      if (type === 'Story' || type === 'Epic') {
        if (!stories[iss.key]) stories[iss.key] = { issue: iss, children: [] };
        else stories[iss.key].issue = iss;
      } else {
        var pk = iss.fields.parent && iss.fields.parent.key;
        if (pk) {
          if (!stories[pk]) stories[pk] = { issue: null, children: [] };
          stories[pk].children.push(iss);
        } else {
          orphans.push(iss);
        }
      }
    });

    function buildGroup(issue, children) {
      var group = el('div', { className: 'jira-story-group' });
      var hdr = el('div', { className: 'jira-story-header' });
      if (issue) {
        hdr.appendChild(el('a', { className: 'jira-story-key', href: JIRA_BASE + '/browse/' + issue.key, target: '_blank', textContent: issue.key }));
        hdr.appendChild(el('span', { className: 'jira-story-summary', textContent: issue.fields.summary }));
        var est = issue.fields.timetracking && issue.fields.timetracking.originalEstimate;
        if (est) hdr.appendChild(el('span', { className: 'jira-story-est', textContent: est }));
        hdr.appendChild(buildJiraChip(issue.fields.status.name, issue.key, false));
      } else {
        hdr.appendChild(el('span', { className: 'jira-story-summary', textContent: '\uD83D\uDCCC Tasks kh\u00F4ng c\u00F3 Story cha' }));
      }
      group.appendChild(hdr);
      children.forEach(function(child) {
        var row = el('div', { className: 'jira-subtask-row' });
        row.appendChild(el('a', { className: 'jira-sub-key', href: JIRA_BASE + '/browse/' + child.key, target: '_blank', textContent: child.key }));
        row.appendChild(el('span', { className: 'jira-sub-summary', textContent: child.fields.summary }));
        var ce = child.fields.timetracking && child.fields.timetracking.originalEstimate;
        if (ce) row.appendChild(el('span', { className: 'jira-est', textContent: ce }));
        row.appendChild(buildJiraChip(child.fields.status.name, child.key, true));
        group.appendChild(row);
      });
      return group;
    }

    Object.values(stories).forEach(function(g) { wrap.appendChild(buildGroup(g.issue, g.children)); });
    if (orphans.length) wrap.appendChild(buildGroup(null, orphans));

  } catch(e) {
    if (wrap.contains(loading)) wrap.removeChild(loading);
    var errDiv = el('div', { className: 'jira-error' });
    errDiv.appendChild(el('h3', { textContent: '\u274C Kh\u00F4ng th\u1EC3 t\u1EA3i Jira' }));
    errDiv.appendChild(el('div', { className: 'jira-error-msg', textContent: e.message }));
    var retryBtn = el('button', { className: 'jira-connect-btn', textContent: 'Th\u1EED l\u1EA1i' });
    retryBtn.addEventListener('click', function() { renderJiraBoard(container); });
    errDiv.appendChild(retryBtn);
    wrap.appendChild(errDiv);
    console.error('[Jira]', e);
  }
}

// ============================================================

init();
