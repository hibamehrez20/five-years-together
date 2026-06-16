/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBw1-x_5qSCiqEpEYvOEmARFrp0NFX7MHE',
  authDomain: 'five-years-us-8915c.firebaseapp.com',
  databaseURL: 'https://five-years-us-8915c-default-rtdb.firebaseio.com',
  projectId: 'five-years-us-8915c',
  storageBucket: 'five-years-us-8915c.firebasestorage.app',
  messagingSenderId: '264325669736',
  appId: '1:264325669736:web:d9f71e5f25d9c918a06cdd'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const title = payload.notification?.title || 'New message ♥';
  const options = {
    body: payload.notification?.body || '',
    icon: '/icons/app-icon.svg',
    badge: '/icons/app-icon.svg',
    tag: 'live-chat',
    data: { url: payload.data?.url || '/#live-chat' }
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/#live-chat';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client) {
          return client.focus().then(function (focused) {
            if ('navigate' in focused) {
              return focused.navigate(targetUrl);
            }
          });
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
