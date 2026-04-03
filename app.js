function fmt(n) {
  return Number(n).toLocaleString('vi-VN') + 'd';
}

const STATUS_BADGE = {
  'Cho phat trien':  'badge-blue',
  'Dang phat trien': 'badge-orange',
  'Hoan thanh':      'badge-green',
};

const TABS = [
  { id: 'overview', label: '📋 Overview' },
  { id: 'ac',       label: '✅ Acceptance Criteria' },
  { id: 'flow',     label: '🔀 Flow' },
  { id: 'db',       label: '🗄️ DB Changes' },
  { id: 'notes',    label: '📝 Notes Dev' },
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

function renderNav(item) {
  const nav = document.getElementById('nav-tabs');
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
  const dbPage = buildDB(item);
  if (dbPage) app.appendChild(dbPage);
  const notesPage = buildNotes(item);
  if (notesPage) app.appendChild(notesPage);

  showTab('overview');
}

init();
