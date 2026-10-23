(() => {
  const $ = s => document.querySelector(s);
  const loginPanel = $('#loginPanel'), editorPanel = $('#editorPanel');
  const loginForm = $('#loginForm'), contentForm = $('#contentForm');
  let token = '';
  function message(el, text, error = false) { el.textContent = text; el.classList.toggle('error', error); }
  async function request(url, options = {}) {
    const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
    let body = {}; try { body = await res.json(); } catch {}
    if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
    return body;
  }
  function fill(data) { for (const el of contentForm.elements) if (el.name && data[el.name] != null) el.value = data[el.name]; }
  loginForm.addEventListener('submit', async e => {
    e.preventDefault(); const btn = loginForm.querySelector('button'); const msg = $('#loginMessage'); btn.disabled = true; message(msg, 'VERIFYING CREDENTIALS…');
    try { const body = await request('/api/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(loginForm))) }); token = body.token; const data = await request('/api/content'); fill(data); loginPanel.hidden = true; editorPanel.hidden = false; }
    catch (err) { message(msg, err.message, true); }
    finally { btn.disabled = false; }
  });
  contentForm.addEventListener('submit', async e => {
    e.preventDefault(); const btn = contentForm.querySelector('button'); const msg = $('#saveMessage'); btn.disabled = true; message(msg, 'SAVING…');
    const data = Object.fromEntries(new FormData(contentForm));
    try { await request('/api/content', { method: 'PUT', body: JSON.stringify(data) }); message(msg, 'SAVED. PUBLIC CONTENT UPDATED.'); }
    catch (err) { if (/session|sign in/i.test(err.message)) { token = ''; editorPanel.hidden = true; loginPanel.hidden = false; } message(msg, err.message, true); }
    finally { btn.disabled = false; }
  });
  $('#logoutButton').addEventListener('click', () => { token = ''; contentForm.reset(); editorPanel.hidden = true; loginPanel.hidden = false; message($('#loginMessage'), 'Signed out.'); });
})();
