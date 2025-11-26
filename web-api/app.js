// app.js
import * as api from './api.js';

let users = [];
let filtered = [];
let currentPage = 1;
let pageSize = 5;

const tbody = document.querySelector('#usersTable tbody');
const statusEl = document.getElementById('status');
const searchInput = document.getElementById('search');
const paginationEl = document.getElementById('pagination');
const modal = document.getElementById('modal');
const formTitle = document.getElementById('formTitle');
const userForm = document.getElementById('userForm');
const btnNew = document.getElementById('btnNew');

function setStatus(msg = '', isError = true) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#b00' : '#0a7';
}

// escape
function escapeHtml(s){ if (!s) return ''; return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// fetch & render
async function loadUsers(){
  try{
    setStatus('Loading users...', false);
    users = await api.fetchUsers();
    filtered = users.slice();
    currentPage = 1;
    renderTable();
    setStatus('', false);
  } catch (err) {
    setStatus('Load error: ' + err.message);
  }
}

function renderTable(){
  pageSize = parseInt(document.getElementById('pageSize').value, 10);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  tbody.innerHTML = '';
  if (pageItems.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="4" style="text-align:center;color:#666;padding:20px">No users found</td>`;
    tbody.appendChild(tr);
  } else {
    for (const u of pageItems){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.phone)}</td>
        <td class="actions">
          <button data-action="edit" data-id="${u.id}">Edit</button>
          <button data-action="delete" data-id="${u.id}" class="secondary">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  }
  renderPagination();
}

function renderPagination(){
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  paginationEl.innerHTML = '';

  const makeBtn = (label, page, active=false) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = 'page-btn' + (active ? ' active' : '');
    btn.disabled = active;
    btn.addEventListener('click', ()=> { currentPage = page; renderTable(); });
    return btn;
  };

  if (currentPage > 1) paginationEl.appendChild(makeBtn('‹ Prev', currentPage - 1));
  let start = Math.max(1, currentPage - 3), end = Math.min(totalPages, start + 6);
  if (end - start < 6) start = Math.max(1, end - 6);
  for (let p = start; p <= end; p++) paginationEl.appendChild(makeBtn(p, p, p===currentPage));
  if (currentPage < totalPages) paginationEl.appendChild(makeBtn('Next ›', currentPage + 1));

  const info = document.createElement('div');
  info.style.marginLeft = '8px'; info.style.fontSize='13px'; info.style.color='#444';
  info.textContent = ` ${total} result(s) • page ${currentPage} / ${totalPages}`;
  paginationEl.appendChild(info);
}

// search, apply and render
function applySearchAndRender(){
  const q = searchInput.value.trim().toLowerCase();
  filtered = q ? users.filter(u=>u.name.toLowerCase().includes(q)) : users.slice();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;
  renderTable();
}

// modal form
function openForm(mode='create', user=null){
  formTitle.textContent = mode === 'create' ? 'Create new user' : 'Edit user';
  document.getElementById('userId').value = user ? user.id : '';
  document.getElementById('name').value = user ? user.name : '';
  document.getElementById('email').value = user ? user.email : '';
  document.getElementById('phone').value = user ? user.phone : '';
  modal.classList.add('open');
  document.getElementById('name').focus();
  modal.onclick = (ev)=> { if (ev.target===modal) closeForm(); };
}

function closeForm(){ modal.classList.remove('open'); userForm.reset(); document.getElementById('userId').value = ''; }

// CRUD wrappers (call api then update local UI)
async function handleCreate(payload){
  try{
    setStatus('Creating user...', false);
    const created = await api.createUser(payload);
    users.unshift(created);
    applySearchAndRender();
    setStatus('User created', false);
  } catch (err){ setStatus('Create error: ' + err.message); }
}

async function handleUpdate(id, payload){
  try{
    setStatus('Updating user...', false);
    const updated = await api.updateUser(id, payload);
    users = users.map(u=>u.id === id ? {...u, ...updated} : u);
    applySearchAndRender();
    setStatus('User updated', false);
  } catch (err){ setStatus('Update error: ' + err.message); }
}

async function handleDelete(id){
  if (!confirm('Delete this user?')) return;
  try{
    setStatus('Deleting user...', false);
    await api.deleteUser(id);
    users = users.filter(u=>u.id !== id);
    applySearchAndRender();
    setStatus('User deleted', false);
  } catch (err){ setStatus('Delete error: ' + err.message); }
}

// events
searchInput.addEventListener('input', ()=> { currentPage = 1; applySearchAndRender(); });
document.getElementById('pageSize').addEventListener('change', ()=> { pageSize = parseInt(document.getElementById('pageSize').value,10); currentPage = 1; renderTable(); });
btnNew.addEventListener('click', ()=> openForm('create'));

// table actions
tbody.addEventListener('click', (e)=>{
  const btn = e.target.closest('button'); if (!btn) return;
  const action = btn.dataset.action; const id = Number(btn.dataset.id);
  if (action === 'edit'){ const u = users.find(x=>x.id===id); openForm('edit', u); }
  else if (action === 'delete'){ handleDelete(id); }
});

// form submit
document.getElementById('btnCancel').addEventListener('click', ()=> closeForm());
userForm.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const id = document.getElementById('userId').value;
  const payload = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim()
  };
  if (!payload.name || !payload.email){ setStatus('Name & email required'); return; }

  if (id) await handleUpdate(Number(id), payload);
  else await handleCreate(payload);
  closeForm();
});

// initial load
loadUsers();
