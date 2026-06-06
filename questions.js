(function () {
  const IDENTITY_KEY = 'chatIdentity';
  const QUESTION_COUNT = 10;

  let qaDb = null;
  let qaRef = null;
  let qaIdentity = localStorage.getItem(IDENTITY_KEY);
  const answerCache = {};

  function qT(path) {
    if (typeof t !== 'function') return path;
    return t('questions.' + path);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function isFirebaseConfigured() {
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg?.apiKey || !cfg?.databaseURL) return false;
    return !String(cfg.apiKey).includes('YOUR_') && !String(cfg.databaseURL).includes('YOUR_');
  }

  function getRoomPath() {
    return 'rooms/' + (window.CHAT_ROOM_SECRET || '762021-omar-hiba') + '/qa';
  }

  function initFirebase() {
    if (!isFirebaseConfigured() || qaDb) return !!qaDb;
    if (typeof firebase === 'undefined') return false;
    try {
      if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
      qaDb = firebase.database();
      qaRef = qaDb.ref(getRoomPath());
      return true;
    } catch (err) {
      console.error('Questions Firebase init failed:', err);
      return false;
    }
  }

  function showPanel(id) {
    ['questions-setup', 'questions-identity', 'questions-wrap'].forEach(panelId => {
      const el = document.getElementById(panelId);
      if (el) el.classList.toggle('hidden', panelId !== id);
    });
  }

  function setIdentity(identity) {
    qaIdentity = identity;
    localStorage.setItem(IDENTITY_KEY, identity);
    showPanel('questions-wrap');
    renderQuestions();
    attachAnswersListener();
  }

  function attachAnswersListener() {
    if (!qaRef) return;
    qaRef.off('value');
    qaRef.on('value', snapshot => {
      const data = snapshot.val() || {};
      for (let i = 0; i < QUESTION_COUNT; i++) {
        answerCache[i] = data['q' + i] || {};
        updateQuestionCard(i);
      }
    });
  }

  function updateQuestionCard(index) {
    const card = document.querySelector('.qa-card[data-index="' + index + '"]');
    if (!card) return;

    const answers = answerCache[index] || {};
    ['omar', 'hiba'].forEach(who => {
      const box = card.querySelector('.qa-answer--' + who);
      const textEl = box?.querySelector('.qa-answer__text');
      const form = box?.querySelector('.qa-answer__form');
      const data = answers[who];

      if (!box || !textEl) return;

      if (qaIdentity === who && form) {
        form.classList.remove('hidden');
        const input = form.querySelector('textarea');
        if (input && document.activeElement !== input) {
          input.value = data?.text || '';
        }
        textEl.classList.add('hidden');
      } else {
        form?.classList.add('hidden');
        textEl.classList.remove('hidden');
        textEl.textContent = data?.text?.trim() || qT('waiting');
        textEl.classList.toggle('qa-answer__text--empty', !data?.text?.trim());
      }
    });
  }

  function saveAnswer(index, text) {
    if (!qaRef || !qaIdentity) return Promise.reject();
    const trimmed = text.trim();
    if (!trimmed) return Promise.reject();

    return qaRef.child('q' + index).child(qaIdentity).set({
      text: trimmed,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  }

  function renderQuestions() {
    const list = document.getElementById('questions-list');
    if (!list) return;

    const questions = qT('list');
    if (!Array.isArray(questions)) return;

    list.innerHTML = questions.slice(0, QUESTION_COUNT).map((question, i) => {
      const num = String(i + 1).padStart(2, '0');
      return `
        <article class="qa-card" data-index="${i}">
          <div class="qa-card__head">
            <span class="qa-card__num">${num}</span>
            <h3 class="qa-card__question">${escapeHtml(question)}</h3>
          </div>
          <div class="qa-card__answers">
            <div class="qa-answer qa-answer--omar">
              <span class="qa-answer__name">${qT('omarLabel')}</span>
              <p class="qa-answer__text qa-answer__text--empty">${qT('waiting')}</p>
              <form class="qa-answer__form hidden">
                <label class="sr-only" for="qa-input-${i}-omar">${qT('yourTurn')}</label>
                <textarea id="qa-input-${i}-omar" rows="3" maxlength="1000" placeholder="${qT('yourTurn')}…"></textarea>
                <button type="submit" class="qa-answer__save">${qT('saveBtn')}</button>
              </form>
            </div>
            <div class="qa-answer qa-answer--hiba">
              <span class="qa-answer__name">${qT('hibaLabel')}</span>
              <p class="qa-answer__text qa-answer__text--empty">${qT('waiting')}</p>
              <form class="qa-answer__form hidden">
                <label class="sr-only" for="qa-input-${i}-hiba">${qT('yourTurn')}</label>
                <textarea id="qa-input-${i}-hiba" rows="3" maxlength="1000" placeholder="${qT('yourTurn')}…"></textarea>
                <button type="submit" class="qa-answer__save">${qT('saveBtn')}</button>
              </form>
            </div>
          </div>
        </article>
      `;
    }).join('');

    list.querySelectorAll('.qa-answer__form').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const card = form.closest('.qa-card');
        const index = Number(card?.dataset.index);
        const input = form.querySelector('textarea');
        const btn = form.querySelector('.qa-answer__save');
        if (!input || !btn) return;

        btn.disabled = true;
        saveAnswer(index, input.value)
          .then(() => {
            btn.textContent = qT('savedMsg');
            setTimeout(() => { btn.textContent = qT('saveBtn'); }, 2000);
          })
          .catch(() => alert(qT('saveError')))
          .finally(() => { btn.disabled = false; });
      });
    });

    for (let i = 0; i < QUESTION_COUNT; i++) updateQuestionCard(i);
  }

  function bindEvents() {
    document.getElementById('questions-pick-omar')?.addEventListener('click', () => setIdentity('omar'));
    document.getElementById('questions-pick-hiba')?.addEventListener('click', () => setIdentity('hiba'));
    document.getElementById('questions-switch')?.addEventListener('click', () => {
      qaIdentity = null;
      localStorage.removeItem(IDENTITY_KEY);
      showPanel('questions-identity');
    });
  }

  window.updateQuestionsUI = function updateQuestionsUI() {
    const title = document.getElementById('questions-title');
    const subtitle = document.getElementById('questions-subtitle');
    const prompt = document.getElementById('questions-identity-prompt');
    const pickOmar = document.getElementById('questions-pick-omar');
    const pickHiba = document.getElementById('questions-pick-hiba');
    const switchBtn = document.getElementById('questions-switch');
    const setupHint = document.getElementById('questions-setup-hint');

    if (title) title.textContent = qT('title');
    if (subtitle) subtitle.textContent = qT('subtitle');
    if (prompt) prompt.textContent = qT('identityPrompt');
    if (pickOmar) pickOmar.textContent = qT('pickOmar');
    if (pickHiba) pickHiba.textContent = qT('pickHiba');
    if (switchBtn) switchBtn.textContent = qT('switchIdentity');
    if (setupHint) setupHint.textContent = qT('setupHint');

    qaIdentity = localStorage.getItem(IDENTITY_KEY);

    if (!isFirebaseConfigured() || !initFirebase()) {
      showPanel('questions-setup');
      return;
    }

    if (qaIdentity === 'omar' || qaIdentity === 'hiba') {
      showPanel('questions-wrap');
      renderQuestions();
      attachAnswersListener();
    } else {
      showPanel('questions-identity');
    }
  };

  window.initQuestions = function initQuestions() {
    bindEvents();
    updateQuestionsUI();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuestions);
  } else {
    initQuestions();
  }
})();
