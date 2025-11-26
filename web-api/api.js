// api.js
const API = 'https://jsonplaceholder.typicode.com/users';

export async function fetchUsers() {
  const res = await fetch(API);
  if (!res.ok) throw new Error('Failed to fetch users: ' + res.status);
  return res.json();
}

export async function createUser(payload) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Create failed: ' + res.status);
  return res.json();
}

export async function updateUser(id, payload) {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Update failed: ' + res.status);
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 200 && res.status !== 204) throw new Error('Delete failed: ' + res.status);
  return true;
}
