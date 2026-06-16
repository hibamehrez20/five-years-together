const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const ROOM = '762021-omar-hiba';
const SENDER_NAMES = { omar: 'Omar', hiba: 'Hiba' };

function truncate(text, maxLen) {
  if (!text || text.length <= maxLen) return text || '';
  return text.slice(0, maxLen - 3) + '...';
}

exports.onNewChatMessage = functions.database
  .ref(`/rooms/${ROOM}/messages/{messageId}`)
  .onCreate(async (snapshot) => {
    const msg = snapshot.val();
    if (!msg?.from || !msg?.text) return null;
    if (msg.from !== 'omar' && msg.from !== 'hiba') return null;

    const recipient = msg.from === 'omar' ? 'hiba' : 'omar';
    const senderName = SENDER_NAMES[msg.from] || msg.from;

    const tokensSnap = await admin.database().ref(`rooms/${ROOM}/tokens/${recipient}`).once('value');
    const tokensData = tokensSnap.val();
    if (!tokensData) return null;

    const entries = Object.entries(tokensData);
    const tokens = entries.map(([, entry]) => entry?.token).filter(Boolean);
    if (!tokens.length) return null;

    const preview = truncate(String(msg.text).replace(/\s+/g, ' ').trim(), 120);

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: `💌 ${senderName}`,
        body: preview
      },
      data: {
        url: '/#live-chat',
        from: msg.from
      },
      webpush: {
        fcmOptions: {
          link: '/#live-chat'
        }
      }
    });

    const cleanup = [];
    response.responses.forEach((resp, idx) => {
      if (resp.success) return;
      const code = resp.error?.code;
      if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
        const [deviceId] = entries[idx] || [];
        if (deviceId) {
          cleanup.push(
            admin.database().ref(`rooms/${ROOM}/tokens/${recipient}/${deviceId}`).remove()
          );
        }
      }
    });

    if (cleanup.length) {
      await Promise.all(cleanup);
    }

    return null;
  });
