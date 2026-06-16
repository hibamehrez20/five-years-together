(function () {
  const DEVICE_ID_KEY = 'fcmDeviceId';
  const SW_PATH = '/firebase-messaging-sw.js';
  let registeredIdentity = null;
  let messagingInstance = null;

  function chatT(path) {
    if (typeof t !== 'function') return path;
    return t('liveChat.' + path);
  }

  function isPushConfigured() {
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg?.vapidKey || !cfg.apiKey) return false;
    return !String(cfg.vapidKey).includes('YOUR_');
  }

  function getRoomSecret() {
    return window.CHAT_ROOM_SECRET || '762021-omar-hiba';
  }

  function getDeviceId() {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'd-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  }

  function getTokenRef(identity) {
    if (!firebase.apps.length) {
      firebase.initializeApp(window.FIREBASE_CONFIG);
    }
    const db = firebase.database();
    return db.ref('rooms/' + getRoomSecret() + '/tokens/' + identity + '/' + getDeviceId());
  }

  function getMessaging() {
    if (typeof firebase === 'undefined' || !firebase.messaging) return null;
    if (!messagingInstance) {
      messagingInstance = firebase.messaging();
    }
    return messagingInstance;
  }

  function updateNotifyBanner(state) {
    const banner = document.getElementById('live-chat-notify');
    const textEl = document.getElementById('live-chat-notify-text');
    const btn = document.getElementById('live-chat-notify-btn');
    if (!banner || !textEl || !btn) return;

    if (!isPushConfigured() || state === 'hidden') {
      banner.classList.add('hidden');
      return;
    }

    if (state === 'granted') {
      banner.classList.add('hidden');
      return;
    }

    banner.classList.remove('hidden');
    textEl.textContent = state === 'denied' ? chatT('notifyDenied') : chatT('notifyPrompt');
    btn.textContent = chatT('notifyEnable');
    btn.disabled = state === 'denied';
  }

  function showForegroundNotification(payload) {
    if (!payload?.notification) return;
    if (!document.hidden) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const title = payload.notification.title || chatT('notifyNewMessage');
    const options = {
      body: payload.notification.body || '',
      icon: '/icons/app-icon.svg',
      tag: 'live-chat-foreground'
    };
    new Notification(title, options);
  }

  function bindForegroundListener() {
    const messaging = getMessaging();
    if (!messaging || messaging._chatForegroundBound) return;
    messaging._chatForegroundBound = true;
    messaging.onMessage(function (payload) {
      showForegroundNotification(payload);
    });
  }

  async function saveToken(identity, token) {
    await getTokenRef(identity).set({
      token: token,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  }

  async function ensureNotificationPermission() {
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') {
      updateNotifyBanner('denied');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      if (result === 'granted') return true;
      if (result === 'denied') updateNotifyBanner('denied');
      else updateNotifyBanner('prompt');
      return false;
    } catch (err) {
      console.warn('Notification permission failed:', err);
      updateNotifyBanner('prompt');
      return false;
    }
  }

  async function registerToken(identity) {
    const registration = await navigator.serviceWorker.register(SW_PATH);
    await navigator.serviceWorker.ready;

    const messaging = getMessaging();
    if (!messaging) return false;

    const token = await messaging.getToken({
      vapidKey: window.FIREBASE_CONFIG.vapidKey,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      updateNotifyBanner('prompt');
      return false;
    }

    await saveToken(identity, token);
    updateNotifyBanner('granted');
    return true;
  }

  window.registerChatPushNotifications = async function registerChatPushNotifications(identity) {
    if (!identity) return;
    if (!isPushConfigured()) {
      updateNotifyBanner('hidden');
      return;
    }
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    registeredIdentity = identity;
    bindForegroundListener();

    const granted = await ensureNotificationPermission();
    if (!granted) return;

    try {
      await registerToken(identity);
    } catch (err) {
      console.warn('Push registration failed:', err);
      updateNotifyBanner('prompt');
    }
  };

  window.unregisterChatPushNotifications = async function unregisterChatPushNotifications(identity) {
    if (!identity) return;

    try {
      await getTokenRef(identity).remove();
    } catch (err) {
      console.warn('Could not remove push token:', err);
    }

    if (registeredIdentity === identity) {
      registeredIdentity = null;
    }
  };

  window.requestChatPushPermission = async function requestChatPushPermission() {
    if (!registeredIdentity) return;

    const granted = await ensureNotificationPermission();
    if (granted) {
      try {
        await registerToken(registeredIdentity);
      } catch (err) {
        console.warn('Push registration failed:', err);
        updateNotifyBanner('prompt');
      }
    }
  };

  window.updatePushNotificationUI = function updatePushNotificationUI() {
    if (!registeredIdentity) return;
    if (Notification.permission === 'granted') {
      updateNotifyBanner('granted');
    } else if (Notification.permission === 'denied') {
      updateNotifyBanner('denied');
    } else {
      updateNotifyBanner('prompt');
    }
  };

  function bindEvents() {
    document.getElementById('live-chat-notify-btn')?.addEventListener('click', function () {
      window.requestChatPushPermission();
    });

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && registeredIdentity && Notification.permission === 'granted') {
        window.registerChatPushNotifications(registeredIdentity);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents);
  } else {
    bindEvents();
  }
})();
