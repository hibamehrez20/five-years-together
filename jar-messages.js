(function () {
  const CATEGORIES = [
    { id: 'happy', color: 'gold', face: 'happy' },
    { id: 'sad', color: 'blue', face: 'sad' },
    { id: 'miss', color: 'rose', face: 'miss' },
    { id: 'stress', color: 'sage', face: 'stress' },
    { id: 'dreams', color: 'dream', face: 'dream' }
  ];

  const DAILY_CATEGORIES = ['happy', 'sad', 'miss', 'stress'];
  const STORAGE_PREFIX = 'jarDeck_';

  function jarT(path) {
    if (typeof t !== 'function') return path;
    return t('jar.' + path);
  }

  function getMessages(categoryId) {
    const lang = typeof currentLang === 'string' ? currentLang : 'en';
    return window.JAR_MESSAGES_I18N?.[lang]?.[categoryId]
      || window.JAR_MESSAGES_I18N?.en?.[categoryId]
      || [];
  }

  function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function getDateKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function getDailyJarMessage() {
    const lang = typeof currentLang === 'string' ? currentLang : 'en';
    const dateKey = getDateKey();
    const pool = [];

    DAILY_CATEGORIES.forEach(cat => {
      getMessages(cat).forEach(text => {
        pool.push({ categoryId: cat, text });
      });
    });

    if (!pool.length) return null;

    const idx = hashString(dateKey + '-' + lang) % pool.length;
    return { ...pool[idx], dateKey };
  }

  function loadDeck(categoryId, size) {
    const key = STORAGE_PREFIX + categoryId;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const deck = JSON.parse(raw);
        if (Array.isArray(deck) && deck.length) return deck;
      }
    } catch (_) { /* ignore */ }

    const deck = Array.from({ length: size }, (_, i) => i);
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    localStorage.setItem(key, JSON.stringify(deck));
    return deck;
  }

  function saveDeck(categoryId, deck) {
    localStorage.setItem(STORAGE_PREFIX + categoryId, JSON.stringify(deck));
  }

  function drawMessage(categoryId) {
    const messages = getMessages(categoryId);
    if (!messages.length) return jarT('emptyMessage');

    let deck = loadDeck(categoryId, messages.length);
    const index = deck.pop();
    if (!deck.length) {
      deck = Array.from({ length: messages.length }, (_, i) => i);
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }
    saveDeck(categoryId, deck);
    return messages[index];
  }

  function renderJars() {
    const grid = document.getElementById('jar-grid');
    if (!grid) return;

    grid.innerHTML = CATEGORIES.map(cat => {
      const wideClass = cat.id === 'dreams' ? ' jar-card--wide' : '';
      return `
        <button type="button" class="jar-card jar-card--${cat.color}${wideClass}" data-jar="${cat.id}">
          <div class="jar-kawaii" aria-hidden="true">
            <div class="jar-kawaii__lid"></div>
            <div class="jar-kawaii__neck"></div>
            <div class="jar-kawaii__body">
              <div class="jar-kawaii__face jar-kawaii__face--${cat.face}">
                <span class="jar-kawaii__eye jar-kawaii__eye--left"></span>
                <span class="jar-kawaii__eye jar-kawaii__eye--right"></span>
                <span class="jar-kawaii__mouth"></span>
                <span class="jar-kawaii__blush jar-kawaii__blush--left"></span>
                <span class="jar-kawaii__blush jar-kawaii__blush--right"></span>
              </div>
            </div>
          </div>
          <span class="jar-card__label" id="jar-label-${cat.id}">${jarT('categories.' + cat.id)}</span>
          <span class="jar-card__hint" id="jar-hint-${cat.id}">${jarT('tapToOpen')}</span>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.jar-card').forEach(btn => {
      btn.addEventListener('click', () => openJar(btn.dataset.jar, btn));
    });
  }

  function openJar(categoryId, btn) {
    const modal = document.getElementById('jar-modal');
    const body = document.getElementById('jar-modal-body');
    const label = document.getElementById('jar-modal-label');
    if (!modal || !body) return;

    btn.classList.add('jar-card--opening');
    setTimeout(() => btn.classList.remove('jar-card--opening'), 700);

    const cat = CATEGORIES.find(c => c.id === categoryId);
    label.textContent = jarT('categories.' + categoryId);
    body.textContent = drawMessage(categoryId);

    modal.classList.remove('jar-modal--gold', 'jar-modal--blue', 'jar-modal--rose', 'jar-modal--sage', 'jar-modal--dream');
    modal.classList.add('open', cat ? 'jar-modal--' + cat.color : '');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeJarModal() {
    const modal = document.getElementById('jar-modal');
    if (!modal) return;
    modal.classList.remove('open', 'jar-modal--gold', 'jar-modal--blue', 'jar-modal--rose', 'jar-modal--sage', 'jar-modal--dream');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateHeroDailyJar() {
    const labelEl = document.getElementById('hero-daily-jar-label');
    const textEl = document.getElementById('hero-daily-jar-text');
    const linkEl = document.getElementById('hero-daily-jar-link');
    const boxEl = document.getElementById('hero-daily-jar');
    if (!labelEl || !textEl || !boxEl) return;

    labelEl.textContent = jarT('dailyLabel');
    if (linkEl) linkEl.textContent = jarT('dailyLink');

    const daily = getDailyJarMessage();
    if (daily?.text) {
      textEl.textContent = daily.text;
      boxEl.classList.remove('hidden');
    } else {
      textEl.textContent = jarT('emptyMessage');
    }
  }

  function bindJarModal() {
    document.getElementById('jar-modal-close')?.addEventListener('click', closeJarModal);
    document.getElementById('jar-modal-again')?.addEventListener('click', closeJarModal);
    document.querySelector('.jar-modal-backdrop')?.addEventListener('click', closeJarModal);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.getElementById('jar-modal')?.classList.contains('open')) {
        closeJarModal();
      }
    });
  }

  window.getDailyJarMessage = getDailyJarMessage;

  window.updateJarUI = function updateJarUI() {
    const title = document.getElementById('jar-title');
    const subtitle = document.getElementById('jar-subtitle');
    const footer = document.getElementById('jar-footer');
    const again = document.getElementById('jar-modal-again');
    if (title) title.textContent = jarT('title');
    if (subtitle) subtitle.textContent = jarT('subtitle');
    if (footer) footer.textContent = jarT('footer');
    if (again) again.textContent = jarT('closeBtn');
    CATEGORIES.forEach(cat => {
      const label = document.getElementById('jar-label-' + cat.id);
      const hint = document.getElementById('jar-hint-' + cat.id);
      if (label) label.textContent = jarT('categories.' + cat.id);
      if (hint) hint.textContent = jarT('tapToOpen');
    });
    renderJars();
    updateHeroDailyJar();
  };

  window.initJarMessages = function initJarMessages() {
    bindJarModal();
    updateJarUI();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initJarMessages);
  } else {
    initJarMessages();
  }
})();
