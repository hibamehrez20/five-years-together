(function () {
  const IDENTITY_KEY = 'chatIdentity';
  let chatDb = null;
  let messagesRef = null;
  let messagesListener = null;
  let chatIdentity = localStorage.getItem(IDENTITY_KEY);
  let renderedMessageIds = new Set();
  let lastDateKey = null;

  function chatT(path) {
    if (typeof t !== 'function') return path;
    return t('liveChat.' + path);
  }

  function escapeChatHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function isFirebaseConfigured() {
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey || !cfg.databaseURL) return false;
    return !String(cfg.apiKey).includes('YOUR_') && !String(cfg.databaseURL).includes('YOUR_');
  }

  function getRoomPath() {
    return 'rooms/' + (window.CHAT_ROOM_SECRET || '762021-omar-hiba') + '/messages';
  }

  function formatMessageTime(timestamp) {
    const locale = typeof getLocale === 'function' ? getLocale() : 'en-US';
    return new Date(timestamp).toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function formatDateLabel(dateKey) {
    const locale = typeof getLocale === 'function' ? getLocale() : 'en-US';
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function showPanel(id) {
    ['live-chat-setup', 'live-chat-identity', 'live-chat-wrap'].forEach(panelId => {
      const el = document.getElementById(panelId);
      if (el) el.classList.toggle('hidden', panelId !== id);
    });
  }

  function updateHeaderMeta() {
    const titleEl = document.getElementById('live-chat-header-title');
    const statusEl = document.getElementById('live-chat-header-status');
    if (!titleEl || !statusEl) return;

    if (chatIdentity === 'omar') {
      titleEl.textContent = chatT('headerHiba');
      statusEl.textContent = chatT('headerStatus');
    } else if (chatIdentity === 'hiba') {
      titleEl.textContent = chatT('headerOmar');
      statusEl.textContent = chatT('headerStatus');
    }
  }

  function scrollChatToBottom() {
    const body = document.getElementById('live-chat-messages');
    if (!body) return;
    requestAnimationFrame(() => {
      body.scrollTop = body.scrollHeight;
    });
  }

  function appendDateSeparator(dateKey) {
    const body = document.getElementById('live-chat-messages');
    if (!body) return;
    const chip = document.createElement('div');
    chip.className = 'live-chat-date';
    chip.textContent = formatDateLabel(dateKey);
    body.appendChild(chip);
    lastDateKey = dateKey;
  }

  function appendMessageBubble(msg) {
    const body = document.getElementById('live-chat-messages');
    if (!body || !msg?.text) return;

    const dateKey = new Date(msg.createdAt).toISOString().slice(0, 10);
    if (dateKey !== lastDateKey) appendDateSeparator(dateKey);

    const isMine = msg.from === chatIdentity;
    const row = document.createElement('div');
    row.className = 'live-chat-row live-chat-row--' + (isMine ? 'mine' : 'theirs');
    row.dataset.id = msg.id;

    row.innerHTML =
      '<div class="live-chat-bubble live-chat-bubble--' + msg.from + '">' +
        '<p>' + escapeChatHtml(msg.text).replace(/\n/g, '<br>') + '</p>' +
        '<span class="live-chat-time">' + formatMessageTime(msg.createdAt) + '</span>' +
      '</div>';

    body.appendChild(row);
    scrollChatToBottom();
  }

  function clearMessagesView() {
    const body = document.getElementById('live-chat-messages');
    if (body) body.innerHTML = '';
    renderedMessageIds.clear();
    lastDateKey = null;
  }

  function renderSetupSteps() {
    const title = document.getElementById('live-chat-setup-title');
    const list = document.getElementById('live-chat-setup-steps');
    if (!title || !list) return;
    title.textContent = chatT('setupTitle');
    const steps = chatT('setupSteps');
    list.innerHTML = (Array.isArray(steps) ? steps : [])
      .map(step => '<li>' + escapeChatHtml(step) + '</li>')
      .join('');
  }

  function setIdentity(identity) {
    chatIdentity = identity;
    localStorage.setItem(IDENTITY_KEY, identity);
    showPanel('live-chat-wrap');
    updateHeaderMeta();
    clearMessagesView();
    attachMessagesListener();
    updateJarNoteButton();
    if (typeof window.registerChatPushNotifications === 'function') {
      window.registerChatPushNotifications(identity);
    }
  }

  function attachMessagesListener() {
    if (!messagesRef || !chatIdentity) return;

    if (messagesListener) {
      messagesRef.off('child_added', messagesListener);
      messagesListener = null;
    }

    clearMessagesView();

    messagesListener = snapshot => {
      const msg = snapshot.val();
      if (!msg || !msg.text) return;
      const id = snapshot.key;
      if (renderedMessageIds.has(id)) return;
      renderedMessageIds.add(id);
      appendMessageBubble({
        id,
        from: msg.from,
        text: msg.text,
        createdAt: msg.createdAt || Date.now()
      });
    };

    messagesRef.orderByChild('createdAt').on('child_added', messagesListener);
  }

  function initFirebase() {
    if (!isFirebaseConfigured() || chatDb) return false;
    if (typeof firebase === 'undefined') return false;

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(window.FIREBASE_CONFIG);
      }
      chatDb = firebase.database();
      messagesRef = chatDb.ref(getRoomPath());
      return true;
    } catch (err) {
      console.error('Firebase init failed:', err);
      return false;
    }
  }

  function updateJarNoteButton() {
    const btn = document.getElementById('live-chat-send-jar-note');
    if (!btn) return;
    const show = chatIdentity === 'hiba' && messagesRef;
    btn.classList.toggle('hidden', !show);
    btn.textContent = chatT('sendJarNote');
    btn.disabled = false;
  }

  function sendJarNoteToChat() {
    if (chatIdentity !== 'hiba' || !messagesRef) return;
    if (typeof window.getDailyJarMessage !== 'function') return;

    const daily = window.getDailyJarMessage();
    if (!daily?.text) return;

    const btn = document.getElementById('live-chat-send-jar-note');
    const prefix = chatT('sendJarNotePrefix');
    const text = prefix + daily.text;

    if (btn) btn.disabled = true;
    sendMessage(text)
      .then(() => {
        if (btn) {
          btn.textContent = chatT('sendJarNoteSent');
          setTimeout(() => {
            btn.textContent = chatT('sendJarNote');
            btn.disabled = false;
          }, 2000);
        }
      })
      .catch(() => {
        alert(chatT('sendError'));
        if (btn) btn.disabled = false;
      });
  }

  function sendMessage(text) {
    if (!messagesRef || !chatIdentity) return Promise.reject();

    return messagesRef.push({
      from: chatIdentity,
      text: text.trim(),
      createdAt: firebase.database.ServerValue.TIMESTAMP
    });
  }

  window.sendLiveChatMessage = sendMessage;

  function bindEvents() {
    document.getElementById('live-chat-pick-omar')?.addEventListener('click', () => setIdentity('omar'));
    document.getElementById('live-chat-pick-hiba')?.addEventListener('click', () => setIdentity('hiba'));

    document.getElementById('live-chat-switch')?.addEventListener('click', () => {
      if (messagesListener && messagesRef) {
        messagesRef.off('child_added', messagesListener);
        messagesListener = null;
      }
      const previousIdentity = chatIdentity;
      if (previousIdentity && typeof window.unregisterChatPushNotifications === 'function') {
        window.unregisterChatPushNotifications(previousIdentity);
      }
      chatIdentity = null;
      localStorage.removeItem(IDENTITY_KEY);
      clearMessagesView();
      showPanel('live-chat-identity');
      updateJarNoteButton();
    });

    document.getElementById('live-chat-send-jar-note')?.addEventListener('click', sendJarNoteToChat);

    const form = document.getElementById('live-chat-form');
    const input = document.getElementById('live-chat-input');
    const sendBtn = document.getElementById('live-chat-send');

    form?.addEventListener('submit', e => {
      e.preventDefault();
      if (!input || !chatIdentity) return;

      const text = input.value.trim();
      if (!text) return;

      sendBtn.disabled = true;
      sendMessage(text)
        .then(() => {
          input.value = '';
          input.focus();
        })
        .catch(() => {
          alert(chatT('sendError'));
        })
        .finally(() => {
          sendBtn.disabled = false;
        });
    });
  }

  window.updateLiveChatUI = function updateLiveChatUI() {
    const title = document.getElementById('live-chat-title');
    const subtitle = document.getElementById('live-chat-subtitle');
    const prompt = document.getElementById('live-chat-identity-prompt');
    const pickOmar = document.getElementById('live-chat-pick-omar');
    const pickHiba = document.getElementById('live-chat-pick-hiba');
    const input = document.getElementById('live-chat-input');
    const switchBtn = document.getElementById('live-chat-switch');

    if (title) title.textContent = chatT('title');
    if (subtitle) subtitle.textContent = chatT('subtitle');
    if (prompt) prompt.textContent = chatT('identityPrompt');
    if (pickOmar) pickOmar.textContent = chatT('pickOmar');
    if (pickHiba) pickHiba.textContent = chatT('pickHiba');
    if (input) input.placeholder = chatT('inputPlaceholder');
    if (switchBtn) switchBtn.textContent = chatT('switchIdentity');
    renderSetupSteps();
    updateHeaderMeta();
    updateJarNoteButton();
    if (typeof window.updatePushNotificationUI === 'function') {
      window.updatePushNotificationUI();
    }

    const body = document.getElementById('live-chat-messages');
    if (body && body.children.length) {
      clearMessagesView();
      if (chatIdentity && messagesRef) attachMessagesListener();
    }
  };

  window.initLiveChat = function initLiveChat() {
    bindEvents();
    updateLiveChatUI();

    if (!isFirebaseConfigured()) {
      showPanel('live-chat-setup');
      return;
    }

    if (!initFirebase()) {
      showPanel('live-chat-setup');
      return;
    }

    if (chatIdentity === 'omar' || chatIdentity === 'hiba') {
      showPanel('live-chat-wrap');
      updateHeaderMeta();
      attachMessagesListener();
      updateJarNoteButton();
      if (typeof window.registerChatPushNotifications === 'function') {
        window.registerChatPushNotifications(chatIdentity);
      }
    } else {
      showPanel('live-chat-identity');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveChat);
  } else {
    initLiveChat();
  }
})();
