let PASSWORD = '';
let messages: any[] = [];
let drawings: any[] = [];
let pendingDelete: { kind: 'message' | 'drawing'; id: number } | null = null;

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

function setLoginStatus(message = '', type: 'error' | 'info' = 'error') {
  const status = byId<HTMLParagraphElement>('login-error');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-info', type === 'info');
}

function setAppStatus(message = '', type: 'error' | 'info' = 'error') {
  const status = byId<HTMLParagraphElement>('app-status');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-info', type === 'info');
}

function setLoginBusy(isBusy: boolean) {
  const button = byId<HTMLButtonElement>('login-submit');
  const input = byId<HTMLInputElement>('pw-input');
  if (button) {
    button.disabled = isBusy;
    button.querySelector('span')!.textContent = isBusy ? 'Authorizing terminal' : 'Authorize terminal';
  }
  if (input) input.disabled = isBusy;
}

function loadingState(label: string) {
  return `<div class="empty-state loading-state"><span class="loading-orbit" aria-hidden="true"></span><p>${label}</p></div>`;
}

function emptyState(symbol: string, label: string, detail: string) {
  return `<div class="empty-state"><span class="empty-symbol" aria-hidden="true">${symbol}</span><p>${label}<br/><small>${detail}</small></p></div>`;
}

function escHtmlAdmin(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(value: unknown) {
  const date = new Date(String(value ?? ''));
  if (Number.isNaN(date.valueOf())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function validRecordId(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id >= 0 ? id : null;
}

function safeImageSrc(value: unknown) {
  const source = String(value ?? '').trim();
  if (/^data:image\/(?:png|jpeg|jpg|webp|gif);/i.test(source)) return source;
  if (/^https?:\/\//i.test(source)) return source;
  return '';
}

async function doLogin() {
  const input = byId<HTMLInputElement>('pw-input');
  const candidate = input?.value.trim() ?? '';
  if (!candidate) {
    setLoginStatus('Enter the Sensei passkey to continue.');
    input?.focus();
    return;
  }

  PASSWORD = candidate;
  setLoginStatus('Verifying authorization...', 'info');
  setLoginBusy(true);
  try {
    await loadAll();
  } finally {
    setLoginBusy(false);
  }
}

function logout() {
  PASSWORD = '';
  messages = [];
  drawings = [];
  pendingDelete = null;
  byId<HTMLElement>('app')?.setAttribute('hidden', '');
  byId<HTMLElement>('login')?.removeAttribute('hidden');
  const input = byId<HTMLInputElement>('pw-input');
  if (input) input.value = '';
  setAppStatus('');
  setLoginStatus('');
  byId<HTMLElement>('confirm-dialog')?.setAttribute('hidden', '');
  window.setTimeout(() => input?.focus(), 0);
}

async function loadAll() {
  const messagesList = byId<HTMLElement>('messages-list');
  const drawingsList = byId<HTMLElement>('drawings-list');
  if (messagesList) messagesList.innerHTML = loadingState('Synchronizing message archive');
  if (drawingsList) drawingsList.innerHTML = loadingState('Synchronizing drawing archive');
  setAppStatus('');

  try {
    const [mRes, dRes] = await Promise.all([
      fetch('/api/messages', { headers: { 'x-admin-password': PASSWORD } }),
      fetch('/api/drawings', { headers: { 'x-admin-password': PASSWORD } }),
    ]);

    if (mRes.status === 401 || dRes.status === 401) {
      PASSWORD = '';
      setLoginStatus('Authorization was not accepted. Check the passkey and try again.');
      return;
    }
    if (!mRes.ok || !dRes.ok) {
      throw new Error('The archive service did not return a valid response.');
    }

    const [mData, dData] = await Promise.all([mRes.json(), dRes.json()]) as any[];
    messages = Array.isArray(mData?.messages) ? mData.messages : [];
    drawings = Array.isArray(dData?.drawings) ? dData.drawings : [];

    byId<HTMLElement>('login')?.setAttribute('hidden', '');
    byId<HTMLElement>('app')?.removeAttribute('hidden');
    renderMessages(messages);
    renderDrawings(drawings);
    updateCounters();
    setLoginStatus('');
    showTab('messages');
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'An unknown connection error occurred.';
    setLoginStatus(`Unable to connect to the archive. ${detail}`);
    if (messagesList) messagesList.innerHTML = emptyState('!', 'Archive unavailable', 'Try authorizing again.');
    if (drawingsList) drawingsList.innerHTML = emptyState('!', 'Archive unavailable', 'Try authorizing again.');
  }
}

function updateCounters() {
  const messageCount = String(messages.length);
  const drawingCount = String(drawings.length);
  const countIds: [string, string][] = [
    ['msg-count', messageCount],
    ['summary-msg-count', messageCount],
    ['draw-count', drawingCount],
    ['summary-draw-count', drawingCount],
  ];
  countIds.forEach(([id, count]) => {
    const element = byId<HTMLElement>(id);
    if (element) element.textContent = count;
  });
}

function renderMessages(records: any[]) {
  const el = byId<HTMLElement>('messages-list');
  if (!el) return;
  if (!records.length) {
    el.innerHTML = emptyState('M', 'No messages are waiting.', 'New MomoTalk messages will appear here.');
    return;
  }

  el.innerHTML = records.map((record) => {
    const id = validRecordId(record.id);
    if (id === null) return '';
    return `<article class="message-record" id="msg-${id}">
      <div class="record-avatar" aria-hidden="true">M</div>
      <div>
        <div class="record-meta">
          <span class="record-name">Student record #${id}</span>
          <time class="record-time">${escHtmlAdmin(formatDate(record.created_at))}</time>
        </div>
        <p class="record-message">${escHtmlAdmin(record.message)}</p>
      </div>
      <button class="record-delete" type="button" onclick="requestDelete('message', ${id})" aria-label="Remove message record ${id}">Remove</button>
    </article>`;
  }).join('');
}

function renderDrawings(records: any[]) {
  const el = byId<HTMLElement>('drawings-list');
  if (!el) return;
  if (!records.length) {
    el.innerHTML = emptyState('D', 'No drawings are waiting.', 'Student drawings will appear here after submission.');
    return;
  }

  el.innerHTML = records.map((record) => {
    const id = validRecordId(record.id);
    if (id === null) return '';
    const source = safeImageSrc(record.image_data);
    const image = source
      ? `<img class="drawing-image" src="${escHtmlAdmin(source)}" alt="Drawing submitted in record ${id}" loading="lazy"/>`
      : '<span class="empty-symbol" aria-label="Image unavailable">!</span>';
    return `<article class="drawing-record" id="draw-${id}">
      <div class="record-meta">
        <span class="record-name">Student record #${id}</span>
        <time class="record-time">${escHtmlAdmin(formatDate(record.created_at))}</time>
      </div>
      <div class="drawing-image-wrap">${image}</div>
      <p class="drawing-caption">${escHtmlAdmin(record.message)}</p>
      <button class="record-delete" type="button" onclick="requestDelete('drawing', ${id})" aria-label="Remove drawing record ${id}">Remove</button>
    </article>`;
  }).join('');
}

function showTab(tab: string) {
  const normalized = tab === 'drawings' ? 'drawings' : 'messages';
  const messagesPanel = byId<HTMLElement>('tab-messages');
  const drawingsPanel = byId<HTMLElement>('tab-drawings');
  const messagesButton = byId<HTMLButtonElement>('tab-button-messages');
  const drawingsButton = byId<HTMLButtonElement>('tab-button-drawings');

  messagesPanel?.toggleAttribute('hidden', normalized !== 'messages');
  drawingsPanel?.toggleAttribute('hidden', normalized !== 'drawings');
  messagesButton?.classList.toggle('active', normalized === 'messages');
  drawingsButton?.classList.toggle('active', normalized === 'drawings');
  messagesButton?.setAttribute('aria-selected', String(normalized === 'messages'));
  drawingsButton?.setAttribute('aria-selected', String(normalized === 'drawings'));
}

function requestDelete(kind: 'message' | 'drawing', id: number) {
  if (!PASSWORD || !Number.isInteger(id)) return;
  pendingDelete = { kind, id };
  const dialog = byId<HTMLElement>('confirm-dialog');
  const title = byId<HTMLElement>('confirm-title');
  const copy = byId<HTMLElement>('confirm-copy');
  if (title) title.textContent = kind === 'message' ? 'Remove message record?' : 'Remove drawing record?';
  if (copy) copy.textContent = `Record #${id} will be permanently removed from the ${kind === 'message' ? 'MomoTalk' : 'creative'} archive.`;
  dialog?.removeAttribute('hidden');
  byId<HTMLButtonElement>('confirm-delete')?.focus();
}

function cancelDelete() {
  pendingDelete = null;
  byId<HTMLElement>('confirm-dialog')?.setAttribute('hidden', '');
}

async function confirmDelete() {
  if (!pendingDelete) return;
  const action = pendingDelete;
  const button = byId<HTMLButtonElement>('confirm-delete');
  if (button) {
    button.disabled = true;
    button.textContent = 'Removing...';
  }

  try {
    const endpoint = action.kind === 'message' ? '/api/messages' : '/api/drawings';
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'x-admin-password': PASSWORD, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: action.id }),
    });
    if (response.status === 401) {
      cancelDelete();
      logout();
      setLoginStatus('Your authorization expired. Please authorize the terminal again.');
      return;
    }
    if (!response.ok) throw new Error('The archive did not accept the removal request.');

    if (action.kind === 'message') {
      messages = messages.filter((record) => Number(record.id) !== action.id);
      renderMessages(messages);
    } else {
      drawings = drawings.filter((record) => Number(record.id) !== action.id);
      renderDrawings(drawings);
    }
    updateCounters();
    cancelDelete();
    setAppStatus(`Record #${action.id} was removed from the archive.`, 'info');
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Removal could not be completed.';
    setAppStatus(detail);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Remove record';
    }
  }
}

function deleteMsg(id: number) { requestDelete('message', id); }
function deleteDraw(id: number) { requestDelete('drawing', id); }

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !byId<HTMLElement>('confirm-dialog')?.hasAttribute('hidden')) cancelDelete();
});

Object.assign(window, {
  doLogin,
  logout,
  showTab,
  requestDelete,
  confirmDelete,
  cancelDelete,
  deleteMsg,
  deleteDraw,
});
