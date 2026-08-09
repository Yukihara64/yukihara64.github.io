  let PASSWORD = '';

  function doLogin() {
    const pw = (document.getElementById('pw-input') as any).value;
    if (!pw) return;
    PASSWORD = pw;
    loadAll();
  }

  function logout() {
    PASSWORD = '';
    (document.getElementById('app') as any).style.display = 'none';
    (document.getElementById('login') as any).style.display = 'block';
    (document.getElementById('pw-input') as any).value = '';
  }

  async function loadAll() {
    const [mRes, dRes] = await Promise.all([
      fetch('/api/messages', { headers: { 'x-admin-password': PASSWORD } }),
      fetch('/api/drawings', { headers: { 'x-admin-password': PASSWORD } }),
    ]);

    if (mRes.status === 401) {
      (document.getElementById('login-error') as any).textContent = '❌ Wrong password';
      return;
    }

    (document.getElementById('login') as any).style.display = 'none';
    (document.getElementById('app') as any).style.display = 'block';

    const mData = (await mRes.json()) as any;
    const dData = (await dRes.json()) as any;

    renderMessages(mData.messages ?? []);
    renderDrawings(dData.drawings ?? []);
  }

  function renderMessages(messages: any[]) {
    (document.getElementById('msg-count') as any).textContent = messages.length;
    const el = (document.getElementById('messages-list') as any);
    if (!messages.length) { el.innerHTML = '<div class="col-12 empty">😴 No messages yet...</div>'; return; }
    el.innerHTML = messages.map(m => `
      <div class="col-12" id="msg-${m.id}">
        <div class="momotalk-message d-flex gap-3 align-items-start">
          <div class="momotalk-avatar">🎓</div>
          <div class="momotalk-bubble-container flex-grow-1">
            <div class="momotalk-name">Student #${m.id} <span class="momotalk-time">${new Date(m.created_at).toLocaleString()}</span></div>
            <div class="momotalk-bubble text-light">
              ${escHtmlAdmin(m.message)}
            </div>
          </div>
          <button class="btn btn-danger btn-sm del-btn" onclick="deleteMsg(${m.id})">Delete</button>
        </div>
      </div>`).join('');
  }

  function renderDrawings(drawings: any[]) {
    (document.getElementById('draw-count') as any).textContent = drawings.length;
    const el = (document.getElementById('drawings-list') as any);
    if (!drawings.length) { el.innerHTML = '<div class="col-12 empty">🎨 No drawings yet...</div>'; return; }
    el.innerHTML = drawings.map(d => `
      <div class="col-12 col-md-6 col-lg-4" id="draw-${d.id}">
        <div class="momotalk-message d-flex flex-column gap-2 h-100">
          <div class="momotalk-name mb-1">Student #${d.id} <span class="momotalk-time">${new Date(d.created_at).toLocaleString()}</span></div>
          <div class="momotalk-bubble p-2 d-flex flex-column align-items-center w-100 flex-grow-1">
            <img src="${d.image_data}" alt="Drawing" class="img-fluid rounded mb-2 w-100" style="background:#fdfaf2 url('img/recruitment_sheet.png') center/contain no-repeat;border:1px solid rgba(0,163,255,0.2)"/>
            ${d.message ? `<div class="draw-msg text-muted small mt-1 w-100">"${escHtmlAdmin(d.message)}"</div>` : ''}
          </div>
          <button class="btn btn-danger btn-sm del-btn mt-2 align-self-start" onclick="deleteDraw(${d.id})">Delete</button>
        </div>
      </div>`).join('');
  }

  async function deleteMsg(id: number) {
    await fetch('/api/messages', { method:'DELETE', headers:{'x-admin-password':PASSWORD,'Content-Type':'application/json'}, body:JSON.stringify({id}) });
    (document.getElementById(`msg-${id}`) as any)?.remove();
    (document.getElementById('msg-count') as any).textContent = parseInt((document.getElementById('msg-count') as any).textContent) - 1;
  }

  async function deleteDraw(id: number) {
    await fetch('/api/drawings', { method:'DELETE', headers:{'x-admin-password':PASSWORD,'Content-Type':'application/json'}, body:JSON.stringify({id}) });
    (document.getElementById(`draw-${id}`) as any)?.remove();
    (document.getElementById('draw-count') as any).textContent = parseInt((document.getElementById('draw-count') as any).textContent) - 1;
  }

  function showTab(tab: string) {
    (document.getElementById('tab-messages') as any).style.display = tab === 'messages' ? 'block' : 'none';
    (document.getElementById('tab-drawings') as any).style.display = tab === 'drawings' ? 'block' : 'none';
    document.querySelectorAll('.tab').forEach((t,i) => t.classList.toggle('active', (i===0&&tab==='messages')||(i===1&&tab==='drawings')));
  }

  function escHtmlAdmin(str: string) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
