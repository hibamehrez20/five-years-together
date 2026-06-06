// ===== Internationalization =====
let currentLang = localStorage.getItem('lang') || 'ar';
let reasonObserver = null;

function t(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], TRANSLATIONS[currentLang]);
}

function getLocale() {
  return currentLang === 'ar' ? 'ar-LB' : 'en-US';
}

function updateSplashUI() {
  const map = [
    ['splash-1-eyebrow', 'splash.s1Eyebrow'],
    ['splash-1-title', 'splash.s1Title'],
    ['splash-2-date', 'splash.s2Date'],
    ['splash-2-line', 'splash.s2Line'],
    ['splash-3-line', 'splash.s3Line'],
    ['splash-3-hint', 'splash.s3Hint'],
    ['splash-tap-hint', 'splash.progress'],
  ];
  map.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  });
}

window.updateSplashUI = updateSplashUI;

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  const isRtl = lang === 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.body.classList.toggle('lang-ar', isRtl);
  document.title = t('pageTitle');

  document.getElementById('nav-logo').textContent = t('nav.logo');
  document.getElementById('nav-home').textContent = t('nav.home');
  document.getElementById('nav-time').textContent = t('nav.time');
  document.getElementById('nav-gallery').textContent = t('nav.gallery');
  document.getElementById('nav-videos').textContent = t('nav.videos');
  document.getElementById('nav-chat').textContent = t('nav.chat');
  document.getElementById('nav-jar').textContent = t('nav.jar');
  document.getElementById('nav-questions').textContent = t('nav.questions');
  document.getElementById('nav-reasons').textContent = t('nav.reasons');
  document.getElementById('nav-memories').textContent = t('nav.memories');
  document.getElementById('nav-letters').textContent = t('nav.letters');
  const navVoice = document.getElementById('nav-voice');
  if (navVoice) navVoice.textContent = t('nav.voice');
  document.getElementById('nav-story').textContent = t('nav.story');
  const navBook = document.getElementById('nav-book');
  if (navBook) navBook.textContent = t('nav.book');
  document.getElementById('nav-party').textContent = t('nav.party');
  document.getElementById('nav-open-heart').textContent = t('nav.openHeart');
  document.getElementById('nav-toggle').setAttribute('aria-label', t('nav.toggleMenu'));
  document.getElementById('lang-toggle').textContent = t('nav.langSwitch');
  document.getElementById('lang-toggle').setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');

  updateSplashUI();

  document.getElementById('hero-subtitle').textContent = t('hero.subtitle');
  document.getElementById('hero-title1').textContent = t('hero.title1');
  document.getElementById('hero-title2').textContent = t('hero.title2');
  document.getElementById('hero-date').textContent = t('hero.date');
  document.getElementById('hero-quote').textContent = t('hero.quote');
  document.getElementById('hero-scroll').textContent = t('hero.scroll');
  const heroMusicLabel = document.getElementById('hero-music-label');
  const heroMusicTitle = document.getElementById('hero-music-title');
  const heroMusicArtist = document.getElementById('hero-music-artist');
  const heroMusicToggle = document.getElementById('hero-music-toggle');
  if (heroMusicLabel) heroMusicLabel.textContent = t('hero.musicLabel');
  if (heroMusicTitle) heroMusicTitle.textContent = t('music.songTitle');
  if (heroMusicArtist) heroMusicArtist.textContent = t('music.songArtist');
  if (heroMusicToggle) heroMusicToggle.setAttribute('aria-label', t('music.playLabel'));

  document.getElementById('counter-title').textContent = t('counter.title');
  document.getElementById('counter-subtitle').textContent = t('counter.subtitle');
  document.getElementById('label-days').textContent = t('counter.days');
  document.getElementById('label-hours').textContent = t('counter.hours');
  document.getElementById('label-minutes').textContent = t('counter.minutes');
  document.getElementById('label-seconds').textContent = t('counter.seconds');
  document.getElementById('counter-since').textContent = t('counter.since') + ' ';
  document.getElementById('counter-start-date').textContent = t('counter.startDate');
  document.getElementById('counter-scroll-hint').textContent = t('counter.scrollHint');

  document.getElementById('gallery-title').textContent = t('gallery.title');
  document.getElementById('gallery-subtitle').textContent = t('gallery.subtitle');
  updateGalleryHint();

  document.getElementById('videos-title').textContent = t('videos.title');
  document.getElementById('videos-subtitle').textContent = t('videos.subtitle');

  if (galleryInitialized) {
    updateGalleryMessages();
  }
  if (videosInitialized) {
    renderVideos();
  }

  document.getElementById('reasons-title').textContent = t('reasons.title');
  document.getElementById('reasons-subtitle').textContent = t('reasons.subtitle');
  document.getElementById('reason-daily-btn').textContent = t('reasons.dailyBtn');
  document.getElementById('reason-daily-label').textContent = t('reasons.dailyLabel');
  document.getElementById('reason-daily-again').textContent = t('reasons.dailyAgain');

  renderTimeline();
  renderLetters();
  renderStorytime();
  renderReasons();
  restoreDailyReason();

  updatePartyUI();
  if (typeof window.updateBookGiftUI === 'function') window.updateBookGiftUI();
  if (typeof window.updateVoiceUI === 'function') window.updateVoiceUI();

  document.getElementById('heart-section-title').textContent = t('heartSection.title');
  document.getElementById('heart-section-subtitle').textContent = t('heartSection.subtitle');
  document.getElementById('heart-envelope-tag').textContent = t('heartSection.tag');
  document.getElementById('heart-envelope-to').textContent = t('heartSection.to');
  document.getElementById('heart-invite-note').textContent = t('heartSection.note');
  document.getElementById('letter-open-btn').textContent = t('letter.openBtn');
  document.getElementById('letter-paper-tag').textContent = t('letter.modalTag');
  document.getElementById('letter-close').setAttribute('aria-label', t('letter.closeLabel'));
  document.getElementById('letter-greeting').textContent = t('letter.greeting');
  document.getElementById('letter-signature').textContent = t('letter.signature');

  const letterBody = document.getElementById('letter-body');
  letterBody.innerHTML = t('letter.paragraphs').map(p => `<p>${p}</p>`).join('');
  document.getElementById('letter-signoff').innerHTML = `${t('letter.signoff')}<br><em id="letter-signature">${t('letter.signature')}</em>`;

  document.getElementById('footer-line1').textContent = t('footer.line1');
  document.getElementById('footer-line2').textContent = t('footer.line2');

  if (document.getElementById('lightbox')?.classList.contains('open')) {
    document.getElementById('lightbox-caption').textContent = getPhotoMessage(lightboxIndex);
  }

  updateCounter();

  if (typeof updateLiveChatUI === 'function') {
    updateLiveChatUI();
  }

  if (typeof updateJarUI === 'function') {
    updateJarUI();
  }

  if (typeof updateQuestionsUI === 'function') {
    updateQuestionsUI();
  }
}

function toggleLanguage() {
  applyLanguage(currentLang === 'en' ? 'ar' : 'en');
}

document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);

// ===== Live Counter since June 7, 2021 =====
const START_DATE = new Date('2021-06-07T00:00:00');

function updateCounter() {
  const now = new Date();
  const diff = now - START_DATE;
  const locale = getLocale();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('days').textContent = days.toLocaleString(locale);
  document.getElementById('hours').textContent = hours.toLocaleString(locale, { minimumIntegerDigits: 2 });
  document.getElementById('minutes').textContent = minutes.toLocaleString(locale, { minimumIntegerDigits: 2 });
  document.getElementById('seconds').textContent = seconds.toLocaleString(locale, { minimumIntegerDigits: 2 });
}

setInterval(updateCounter, 1000);

// ===== Gallery & Videos =====
const GALLERY_BATCH = 12;
let lightboxIndex = 0;
let galleryRenderedCount = 0;
let galleryInitialized = false;
let galleryImageObserver = null;

function mediaPath(folder, filename) {
  return `${folder}/${encodeURIComponent(filename)}`;
}

function getPhotoMessage(index) {
  const messages = PHOTO_MESSAGES_I18N[currentLang];
  return messages[index] ?? messages[index % messages.length];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateGalleryHint() {
  const total = GALLERY_MEDIA.photos.length;
  const hint = t('gallery.hint').replace('{count}', total);
  if (!galleryInitialized || galleryRenderedCount >= total) {
    document.getElementById('gallery-hint').textContent = hint;
    return;
  }
  const showing = t('gallery.showing')
    .replace('{shown}', galleryRenderedCount)
    .replace('{total}', total);
  document.getElementById('gallery-hint').textContent = `${showing} · ${hint}`;
}

function updateLoadMoreButton() {
  const btn = document.getElementById('gallery-load-more');
  const total = GALLERY_MEDIA.photos.length;
  if (galleryRenderedCount >= total) {
    btn.classList.add('hidden');
    return;
  }
  btn.classList.remove('hidden');
  btn.textContent = `${t('gallery.loadMore')} (${total - galleryRenderedCount})`;
}

function observeGalleryImages() {
  if (!galleryImageObserver) {
    galleryImageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const src = img.dataset.src;
        if (!src) return;
        img.src = src;
        img.removeAttribute('data-src');
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        galleryImageObserver.unobserve(img);
      });
    }, { rootMargin: '300px 0px', threshold: 0.01 });
  }

  document.querySelectorAll('#gallery-grid img[data-src]').forEach(img => {
    galleryImageObserver.observe(img);
  });
}

function createGalleryItem(index) {
  const filename = GALLERY_MEDIA.photos[index];
  const src = mediaPath('photos', filename);
  const message = getPhotoMessage(index);
  const featured = index === 0 ? ' gallery-item--featured' : '';
  const item = document.createElement('div');
  item.className = `gallery-item${featured}`;
  item.dataset.index = index;
  item.innerHTML = `
    <img data-src="${src}" alt="${escapeHtml(message)}" decoding="async">
    <div class="gallery-overlay"><span>${escapeHtml(message)}</span></div>
  `;
  item.addEventListener('click', () => openLightbox(index));
  return item;
}

function appendGalleryBatch(count) {
  const grid = document.getElementById('gallery-grid');
  const end = Math.min(galleryRenderedCount + count, GALLERY_MEDIA.photos.length);

  const fragment = document.createDocumentFragment();
  for (let i = galleryRenderedCount; i < end; i++) {
    fragment.appendChild(createGalleryItem(i));
  }
  grid.appendChild(fragment);

  galleryRenderedCount = end;
  observeGalleryImages();
  updateLoadMoreButton();
  updateGalleryHint();
}

function initGallery() {
  if (galleryInitialized) return;
  galleryInitialized = true;
  appendGalleryBatch(GALLERY_BATCH);
}

function updateGalleryMessages() {
  document.querySelectorAll('#gallery-grid .gallery-item').forEach(item => {
    const index = Number(item.dataset.index);
    const message = getPhotoMessage(index);
    item.querySelector('.gallery-overlay span').textContent = message;
    const img = item.querySelector('img');
    if (img) img.alt = message;
  });
  updateLoadMoreButton();
  updateGalleryHint();
}

document.getElementById('gallery-load-more').addEventListener('click', () => {
  appendGalleryBatch(GALLERY_BATCH);
});

const gallerySectionObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    initGallery();
    gallerySectionObserver.disconnect();
  }
}, { rootMargin: '400px 0px', threshold: 0 });

gallerySectionObserver.observe(document.getElementById('gallery'));

let videosInitialized = false;

function renderVideos() {
  const grid = document.getElementById('videos-grid');
  grid.innerHTML = GALLERY_MEDIA.videos.map((filename, i) => {
    const src = mediaPath('videos', filename);
    return `
      <div class="video-card">
        <video controls preload="none" playsinline poster="">
          <source src="${src}" type="video/mp4">
        </video>
        <span class="video-label">${t('videos.title')} ${i + 1}</span>
      </div>
    `;
  }).join('');
}

function initVideos() {
  if (videosInitialized) return;
  videosInitialized = true;
  renderVideos();
}

const videosSectionObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    initVideos();
    videosSectionObserver.disconnect();
  }
}, { rootMargin: '300px 0px', threshold: 0 });

videosSectionObserver.observe(document.getElementById('videos'));

// ===== Lightbox =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

function updateLightboxContent() {
  lightboxImg.src = mediaPath('photos', GALLERY_MEDIA.photos[lightboxIndex]);
  lightboxImg.decoding = 'async';
  lightboxCaption.textContent = getPhotoMessage(lightboxIndex);
}

function openLightbox(index) {
  lightboxIndex = index;
  updateLightboxContent();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
  lightboxCaption.textContent = '';
  document.body.style.overflow = '';
}

function showLightboxPhoto(index) {
  const total = GALLERY_MEDIA.photos.length;
  lightboxIndex = (index + total) % total;
  updateLightboxContent();
}

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.getElementById('lightbox-prev').addEventListener('click', (e) => {
  e.stopPropagation();
  showLightboxPhoto(lightboxIndex - 1);
});
document.getElementById('lightbox-next').addEventListener('click', (e) => {
  e.stopPropagation();
  showLightboxPhoto(lightboxIndex + 1);
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showLightboxPhoto(lightboxIndex - 1);
  if (e.key === 'ArrowRight') showLightboxPhoto(lightboxIndex + 1);
});

// ===== Scroll progress =====
function updateScrollProgress() {
  const bar = document.getElementById('scroll-progress-bar');
  const gate = document.getElementById('passcode-gate');
  if (!bar) return;

  if (gate && !gate.classList.contains('is-unlocked')) {
    bar.style.width = '0%';
    return;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0;
  bar.style.width = pct + '%';
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();
window.updateScrollProgress = updateScrollProgress;

// ===== Daily reason =====
const DAILY_REASON_KEY = 'dailyReasonPick';

function hashReasonString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getReasonsList() {
  return window.REASONS_I18N?.[currentLang] || window.REASONS_I18N?.en || [];
}

function getTodayReasonKey() {
  return new Date().toISOString().slice(0, 10) + '-' + currentLang;
}

function getDailyReasonIndex() {
  const reasons = getReasonsList();
  if (!reasons.length) return 0;
  return hashReasonString(getTodayReasonKey()) % reasons.length;
}

function showDailyReason(index, animate) {
  const reasons = getReasonsList();
  if (!reasons.length) return;

  const wrap = document.getElementById('reason-daily');
  const textEl = document.getElementById('reason-daily-text');
  const btn = document.getElementById('reason-daily-btn');
  const againBtn = document.getElementById('reason-daily-again');
  if (!wrap || !textEl || !btn) return;

  const safeIndex = ((index % reasons.length) + reasons.length) % reasons.length;
  textEl.textContent = reasons[safeIndex];

  wrap.classList.remove('hidden');
  btn.classList.add('hidden');
  againBtn?.classList.remove('hidden');

  if (animate) {
    wrap.classList.remove('reason-daily--show');
    void wrap.offsetWidth;
    wrap.classList.add('reason-daily--show');
  } else {
    wrap.classList.add('reason-daily--show');
  }

  localStorage.setItem(DAILY_REASON_KEY, JSON.stringify({
    dateKey: getTodayReasonKey(),
    index: safeIndex
  }));
}

function restoreDailyReason() {
  const reasons = getReasonsList();
  if (!reasons.length) return;

  const btn = document.getElementById('reason-daily-btn');
  const againBtn = document.getElementById('reason-daily-again');
  const wrap = document.getElementById('reason-daily');
  if (!btn || !wrap) return;

  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(DAILY_REASON_KEY) || 'null');
  } catch {
    saved = null;
  }

  if (saved?.dateKey === getTodayReasonKey() && typeof saved.index === 'number') {
    showDailyReason(saved.index, false);
    return;
  }

  wrap.classList.add('hidden');
  wrap.classList.remove('reason-daily--show');
  btn.classList.remove('hidden');
  againBtn?.classList.add('hidden');
}

function pickRandomReasonIndex(excludeIndex) {
  const reasons = getReasonsList();
  if (reasons.length <= 1) return 0;

  let idx;
  do {
    idx = Math.floor(Math.random() * reasons.length);
  } while (idx === excludeIndex);
  return idx;
}

function initDailyReason() {
  const btn = document.getElementById('reason-daily-btn');
  const againBtn = document.getElementById('reason-daily-again');
  if (!btn) return;

  btn.addEventListener('click', () => {
    showDailyReason(getDailyReasonIndex(), true);
  });

  againBtn?.addEventListener('click', () => {
    let current = getDailyReasonIndex();
    try {
      const saved = JSON.parse(localStorage.getItem(DAILY_REASON_KEY) || 'null');
      if (saved?.dateKey === getTodayReasonKey()) current = saved.index;
    } catch { /* ignore */ }
    showDailyReason(pickRandomReasonIndex(current), true);
  });
}

initDailyReason();

// ===== 100 Reasons =====
function renderReasons() {
  const grid = document.getElementById('reasons-grid');
  if (!grid) return;

  const reasons = window.REASONS_I18N?.[currentLang] || window.REASONS_I18N?.en || [];
  if (!reasons.length) return;

  grid.innerHTML = '';
  grid.classList.add('visible');

  reasons.forEach((reason, i) => {
    const card = document.createElement('div');
    card.className = 'reason-card';
    const num = String(i + 1).padStart(3, '0');
    const displayNum = currentLang === 'ar'
      ? Number(i + 1).toLocaleString('ar-LB', { minimumIntegerDigits: 3 })
      : num;
    card.innerHTML = `
      <div class="reason-number">${displayNum}</div>
      <div class="reason-text">${escapeHtml(reason)}</div>
    `;
    grid.appendChild(card);
  });

  if (reasonObserver) reasonObserver.disconnect();

  reasonObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  grid.querySelectorAll('.reason-card').forEach((card, i) => {
    card.style.transitionDelay = `${(i % 10) * 0.05}s`;
    reasonObserver.observe(card);
  });

  requestAnimationFrame(() => {
    grid.querySelectorAll('.reason-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        card.classList.add('visible');
      }
    });
  });
}

// ===== Timeline =====
function formatTimelineBody(item) {
  const parts = item.paragraphs || [item.text];
  return parts.map(p =>
    `<p>${escapeHtml(p).replace(/\*(.*?)\*/g, '<em>$1</em>')}</p>`
  ).join('');
}

function renderTimeline() {
  const container = document.getElementById('timeline');
  const items = t('timeline.items');

  container.innerHTML = items.map(item => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <span class="timeline-date">${item.date}</span>
        <h3>${item.title}</h3>
        ${formatTimelineBody(item)}
      </div>
    </div>
  `).join('');

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.3 });

  container.querySelectorAll('.timeline-item').forEach((item, i) => {
    item.style.transitionDelay = `${i * 0.15}s`;
    timelineObserver.observe(item);
  });
}

function renderLetters() {
  const title = document.getElementById('letters-title');
  const subtitle = document.getElementById('letters-subtitle');
  const grid = document.getElementById('letters-grid');
  if (!grid) return;

  if (title) title.textContent = t('letters.title');
  if (subtitle) subtitle.textContent = t('letters.subtitle');

  const items = t('letters.items');
  if (!Array.isArray(items)) return;

  grid.innerHTML = items.map((letter, i) => `
    <article class="love-letter" data-letter="${i}">
      <button type="button" class="love-letter__envelope" aria-expanded="false">
        <span class="love-letter__flap" aria-hidden="true"></span>
        <span class="love-letter__seal">♥</span>
          <span class="love-letter__tag">${escapeHtml(letter.tag)}</span>
          <h3 class="love-letter__title">${escapeHtml(letter.title)}</h3>
        <span class="love-letter__hint">${t('letters.openHint')}</span>
      </button>
      <div class="love-letter__paper" hidden>
        <div class="love-letter__paper-inner">
          <header class="love-letter__paper-head">
            <span class="love-letter__paper-tag">${escapeHtml(letter.tag)}</span>
            <h3>${escapeHtml(letter.title)}</h3>
          </header>
          <div class="love-letter__body">
            ${letter.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
          </div>
          <footer class="love-letter__sign">${t('letters.signature')}</footer>
          <button type="button" class="love-letter__close">${t('letters.closeHint')}</button>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.love-letter').forEach(card => {
    const envelope = card.querySelector('.love-letter__envelope');
    const paper = card.querySelector('.love-letter__paper');
    const closeBtn = card.querySelector('.love-letter__close');

    envelope?.addEventListener('click', () => {
      const isOpen = card.classList.contains('is-open');
      grid.querySelectorAll('.love-letter.is-open').forEach(other => {
        if (other !== card) {
          other.classList.remove('is-open');
          other.querySelector('.love-letter__envelope')?.setAttribute('aria-expanded', 'false');
          const otherPaper = other.querySelector('.love-letter__paper');
          if (otherPaper) otherPaper.hidden = true;
        }
      });
      card.classList.toggle('is-open', !isOpen);
      envelope.setAttribute('aria-expanded', String(!isOpen));
      if (paper) paper.hidden = isOpen;
    });

    closeBtn?.addEventListener('click', e => {
      e.stopPropagation();
      card.classList.remove('is-open');
      envelope?.setAttribute('aria-expanded', 'false');
      if (paper) paper.hidden = true;
    });
  });
}

function renderStorytime() {
  document.getElementById('storytime-title').textContent = t('storytime.title');
  document.getElementById('storytime-subtitle').textContent = t('storytime.subtitle');
  document.getElementById('storytime-label').textContent = t('storytime.label');
  document.getElementById('storytime-names').textContent = t('storytime.names');
  document.getElementById('storytime-closing').textContent = t('storytime.closing');

  const body = document.getElementById('storytime-body');
  body.innerHTML = t('storytime.paragraphs').map(p => `<p>${p}</p>`).join('');
}

// ===== Floating Hearts & Stars =====
function createParticles() {
  const heartsBg = document.querySelector('.hearts-bg');
  const starsBg = document.querySelector('.stars-bg');
  const heartChars = ['♥', '♡', '❤'];

  for (let i = 0; i < 15; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart-particle';
    heart.textContent = heartChars[i % 3];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${12 + Math.random() * 18}s`;
    heart.style.animationDelay = `${Math.random() * 15}s`;
    heart.style.fontSize = `${0.6 + Math.random() * 0.8}rem`;
    heartsBg.appendChild(heart);
  }

  for (let i = 0; i < 30; i++) {
    const star = document.createElement('span');
    star.className = 'star-particle';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDuration = `${3 + Math.random() * 5}s`;
    star.style.animationDelay = `${Math.random() * 8}s`;
    starsBg.appendChild(star);
  }
}

createParticles();

// ===== Scroll Animations =====
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

// ===== Love Letter Modal =====
const letterBtn = document.getElementById('letter-btn');
const letterModal = document.getElementById('letter-modal');
const letterClose = document.getElementById('letter-close');
const letterBackdrop = document.querySelector('.letter-modal-backdrop');

function openLetter() {
  letterModal.classList.add('open');
  letterModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLetter() {
  letterModal.classList.remove('open');
  letterModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

letterBtn.addEventListener('click', openLetter);
letterClose.addEventListener('click', closeLetter);
letterBackdrop.addEventListener('click', closeLetter);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && letterModal.classList.contains('open')) closeLetter();
});

document.getElementById('nav-open-heart').addEventListener('click', (e) => {
  e.preventDefault();
  openLetter();
});

// ===== Music Player (hero) =====
const heroMusic = document.getElementById('hero-music');
const heroMusicToggle = document.getElementById('hero-music-toggle');
const ourSong = document.getElementById('our-song');
const heroIconPlay = heroMusicToggle?.querySelector('.hero-music__icon-play');
const heroIconPause = heroMusicToggle?.querySelector('.hero-music__icon-pause');
let mobileAudioUnlocked = false;

function isMobileDevice() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && window.matchMedia('(pointer: coarse)').matches);
}

function prepareAudioElement(audio) {
  if (!audio) return;
  audio.volume = 1;
  audio.muted = false;
  audio.setAttribute('playsinline', '');
  audio.setAttribute('webkit-playsinline', '');
}

function setMusicNeedsTap(needsTap) {
  heroMusic?.classList.toggle('needs-tap', needsTap);
}

function setMusicPlaying(playing) {
  heroMusic?.classList.toggle('is-playing', playing);
  heroIconPlay?.classList.toggle('hidden', playing);
  heroIconPause?.classList.toggle('hidden', !playing);
  if (playing) setMusicNeedsTap(false);
}

window.unlockMobileAudio = function unlockMobileAudio() {
  if (!ourSong || mobileAudioUnlocked) return;
  mobileAudioUnlocked = true;
  prepareAudioElement(ourSong);
  prepareAudioElement(document.getElementById('hiba-voice'));
  ourSong.load();
  const prime = ourSong.play();
  if (prime) {
    prime
      .then(() => {
        ourSong.pause();
        ourSong.currentTime = 0;
      })
      .catch(() => {});
  }
};

function startOurSongPlayback() {
  if (!ourSong) return Promise.reject();

  prepareAudioElement(ourSong);
  document.getElementById('hiba-voice')?.pause();

  const tryPlay = () => ourSong.play()
    .then(() => {
      setMusicPlaying(true);
      return true;
    })
    .catch(() => {
      setMusicPlaying(false);
      if (isMobileDevice()) setMusicNeedsTap(true);
      return false;
    });

  if (ourSong.readyState >= 2) return tryPlay();

  ourSong.load();
  return new Promise((resolve) => {
    const onReady = () => {
      tryPlay().then(resolve);
    };
    ourSong.addEventListener('canplay', onReady, { once: true });
    ourSong.addEventListener('error', () => resolve(false), { once: true });
  });
}

window.playOurSong = function playOurSong() {
  if (!ourSong) return;
  startOurSongPlayback();
};

window.pauseOurSong = function pauseOurSong() {
  if (!ourSong) return;
  ourSong.pause();
  setMusicPlaying(false);
};

heroMusicToggle?.addEventListener('click', () => {
  if (!ourSong) return;
  window.unlockMobileAudio();
  if (ourSong.paused) window.playOurSong();
  else window.pauseOurSong();
});

heroMusicToggle?.addEventListener('touchend', () => {
  window.unlockMobileAudio();
}, { passive: true });

ourSong?.addEventListener('play', () => setMusicPlaying(true));
ourSong?.addEventListener('pause', () => setMusicPlaying(false));
ourSong?.addEventListener('error', () => {
  heroMusic?.classList.add('hero-music--hidden');
}, { once: true });

// ===== Mobile Navigation =====
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
const navBackdrop = document.getElementById('nav-backdrop');

function setNavOpen(open) {
  navLinks.classList.toggle('open', open);
  navToggle.classList.toggle('is-active', open);
  navToggle.setAttribute('aria-expanded', open);
  document.body.classList.toggle('nav-open', open);
  if (navBackdrop) {
    navBackdrop.classList.toggle('is-visible', open);
    navBackdrop.setAttribute('aria-hidden', !open);
  }
}

navToggle.addEventListener('click', () => setNavOpen(!navLinks.classList.contains('open')));

if (navBackdrop) {
  navBackdrop.addEventListener('click', () => setNavOpen(false));
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    setNavOpen(false);
  }
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setNavOpen(false));
});

window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (nav) nav.classList.toggle('nav--scrolled', window.scrollY > 48);
});

// ===== Party Section =====
const PARTY_FRAME_INDICES = [6, 21, 14, 0, 35, 48, 12, 27];
const partyModal = document.getElementById('party-modal');
const partyPaperWrap = document.getElementById('party-paper-wrap');
const partyPaper = document.getElementById('party-paper');
const partyCard = document.getElementById('party-card');
const partyVolcano = document.getElementById('party-volcano');
const partyAtmosphere = document.getElementById('party-atmosphere');
let partySectionVisible = false;
let partyFireworksStart = null;
let partyFireworksStop = null;

function setPartyAtmosphere(mode) {
  if (!partyAtmosphere) return;
  partyAtmosphere.classList.toggle('party-atmosphere--fireworks', mode === 'fireworks' || mode === 'letter');
  partyAtmosphere.classList.toggle('party-atmosphere--letter', mode === 'letter');
}

function updatePartyUI() {
  document.getElementById('party-title').textContent = t('party.title');
  document.getElementById('party-subtitle').textContent = t('party.subtitle');
  document.getElementById('party-place-name').textContent = t('party.placeName');
  document.getElementById('party-place-tag').textContent = t('party.placeTag');
  document.getElementById('party-card-hint').textContent = t('party.cardHint');
  document.getElementById('party-card-sub').textContent = t('party.cardSub');
  document.getElementById('party-modal-close').setAttribute('aria-label', t('party.closeLabel'));
  document.getElementById('party-modal-greeting').textContent = t('party.greeting');
  document.getElementById('party-modal-body').innerHTML = t('party.lines')
    .map(line => `<p>${escapeHtml(line).replace(/\*(.*?)\*/g, '<em>$1</em>')}</p>`)
    .join('');
  document.getElementById('party-modal-sign').textContent = t('party.sign');
}

function initPartyFrames() {
  const leftWall = document.getElementById('party-memories-left');
  const rightWall = document.getElementById('party-memories-right');
  if (!leftWall || !rightWall) return;

  leftWall.innerHTML = '';
  rightWall.innerHTML = '';

  PARTY_FRAME_INDICES.forEach((photoIndex, i) => {
    const filename = GALLERY_MEDIA.photos[photoIndex];
    if (!filename) return;

    const wall = i < 4 ? leftWall : rightWall;
    const frame = document.createElement('div');
    frame.className = `party-memory-frame party-memory-frame--${(i % 4) + 1}`;
    const img = document.createElement('img');
    img.src = mediaPath('photos', filename);
    img.alt = t('party.title');
    img.loading = 'lazy';
    frame.appendChild(img);
    wall.appendChild(frame);
  });
}

function createPartyBalloons() {
  const wrap = document.getElementById('party-balloons');
  if (!wrap) return;
  const colors = ['#ffd700', '#ff69b4', '#4169e1', '#32cd32', '#9370db', '#ff6347', '#00bfff', '#ff1493'];
  const positions = [
    { left: '5%', top: '2%', size: 52, tilt: '-6deg', delay: '0s' },
    { left: '18%', top: '0%', size: 44, tilt: '4deg', delay: '0.5s' },
    { left: '32%', top: '3%', size: 48, tilt: '-3deg', delay: '1s' },
    { left: '48%', top: '1%', size: 56, tilt: '5deg', delay: '0.3s' },
    { left: '62%', top: '4%', size: 42, tilt: '-5deg', delay: '0.8s' },
    { left: '76%', top: '0%', size: 50, tilt: '3deg', delay: '1.2s' },
    { left: '88%', top: '5%', size: 40, tilt: '-4deg', delay: '0.6s' },
    { left: '92%', top: '12%', size: 36, tilt: '6deg', delay: '1.5s' },
  ];
  positions.forEach((pos, i) => {
    const balloon = document.createElement('div');
    balloon.className = 'party-balloon';
    balloon.style.left = pos.left;
    balloon.style.top = pos.top;
    balloon.style.setProperty('--size', `${pos.size}px`);
    balloon.style.setProperty('--tilt', pos.tilt);
    balloon.style.animationDelay = pos.delay;
    balloon.innerHTML = `
      <div class="party-balloon__body" style="background:radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), ${colors[i % colors.length]})"></div>
      <div class="party-balloon__ribbon"></div>
    `;
    wrap.appendChild(balloon);
  });
}

function createPartyStreamers() {
  const wrap = document.getElementById('party-streamers');
  if (!wrap) return;
  const colors = ['#ffd700', '#ff69b4', '#4169e1', '#32cd32', '#9370db', '#ff6347'];
  for (let i = 0; i < 18; i++) {
    const streamer = document.createElement('div');
    streamer.className = 'party-streamer';
    streamer.style.left = `${4 + i * 5.5}%`;
    streamer.style.background = colors[i % colors.length];
    streamer.style.setProperty('--swing', `${-8 + (i % 5) * 4}deg`);
    streamer.style.animationDelay = `${(i * 0.25) % 3}s`;
    streamer.style.animationDuration = `${3.5 + (i % 4) * 0.5}s`;
    wrap.appendChild(streamer);
  }
}

function createPartyConfettiRain() {
  const layer = document.getElementById('party-confetti-rain');
  if (!layer) return;
  const colors = ['#ffd700', '#ff69b4', '#4169e1', '#32cd32', '#9370db', '#ff6347', '#fff', '#00bfff'];

  function spawnPiece() {
    const piece = document.createElement('span');
    const isStreamer = Math.random() < 0.15;
    piece.className = isStreamer ? 'party-confetti-piece party-confetti-piece--streamer' : 'party-confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 80}px`);
    piece.style.setProperty('--rot', `${Math.random() * 720}deg`);
    piece.style.animationDuration = `${4 + Math.random() * 5}s`;
    if (!isStreamer && Math.random() < 0.3) piece.style.borderRadius = '50%';
    layer.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
  }

  for (let i = 0; i < 40; i++) spawnPiece();

  let rainTimer = setInterval(spawnPiece, 280);
  const partyEl = document.getElementById('party');
  if (partyEl) {
    const rainObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (!rainTimer) rainTimer = setInterval(spawnPiece, 280);
      } else if (rainTimer) {
        clearInterval(rainTimer);
        rainTimer = null;
      }
    }, { threshold: 0.1 });
    rainObserver.observe(partyEl);
  }
}

function initPartyFireworks() {
  const canvas = document.getElementById('party-fireworks');
  const partyEl = document.getElementById('party');
  if (!canvas || !partyEl) return;

  const ctx = canvas.getContext('2d');
  const colors = ['#ffd700', '#ff69b4', '#4169e1', '#32cd32', '#9370db', '#ff6347', '#00bfff', '#fff', '#ff1493', '#ffa500'];
  let rockets = [];
  let particles = [];
  let running = false;
  let animationId = null;
  let launchTimer = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function pickColor() {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function launchRocket() {
    if (!running) return;
    rockets.push({
      x: canvas.width * (0.15 + Math.random() * 0.7),
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -(Math.random() * 5 + 9),
      color: pickColor(),
      targetY: canvas.height * (0.12 + Math.random() * 0.35),
    });
  }

  function explode(x, y, color) {
    const count = 55 + Math.floor(Math.random() * 35);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 4.5 + 1.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
        decay: Math.random() * 0.012 + 0.01,
        gravity: 0.045,
        size: Math.random() * 2.2 + 0.8,
      });
    }
    // inner sparkle burst
    for (let i = 0; i < 12; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        alpha: 1,
        color: '#fff',
        decay: 0.025,
        gravity: 0.02,
        size: 1.2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.07;

      ctx.globalAlpha = 0.85;
      ctx.fillStyle = r.color;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - r.vx * 3, r.y - r.vy * 3);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (r.vy >= -0.5 || r.y <= r.targetY) {
        explode(r.x, r.y, r.color);
        rockets.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.985;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    if (running) animationId = requestAnimationFrame(draw);
  }

  function burst(count, delay) {
    for (let i = 0; i < count; i++) {
      setTimeout(launchRocket, i * delay);
    }
  }

  function start() {
    if (running) return;
    running = true;
    resize();
    canvas.classList.add('party-fireworks--active');
    if (!partyModal.classList.contains('open')) {
      setPartyAtmosphere('fireworks');
    }
    burst(6, 180);
    launchTimer = setInterval(() => {
      launchRocket();
      if (Math.random() > 0.45) launchRocket();
    }, 750);
    draw();
  }

  function stop() {
    if (!running) return;
    running = false;
    canvas.classList.remove('party-fireworks--active');
    clearInterval(launchTimer);
    launchTimer = null;
    cancelAnimationFrame(animationId);
    rockets = [];
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!partyModal.classList.contains('open')) {
      setPartyAtmosphere('none');
    }
  }

  partyFireworksStart = start;
  partyFireworksStop = stop;

  window.addEventListener('resize', () => {
    if (running) resize();
  });

  const fireworksObserver = new IntersectionObserver((entries) => {
    partySectionVisible = entries[0].isIntersecting;
    if (partySectionVisible) {
      start();
    } else {
      stop();
      if (!partyModal.classList.contains('open')) {
        setPartyAtmosphere('none');
      }
    }
  }, { threshold: 0.15 });

  fireworksObserver.observe(partyEl);
}

function createModalStars() {
  const container = document.getElementById('party-modal-stars');
  container.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const star = document.createElement('span');
    star.className = 'party-modal-star';
    star.textContent = ['✨', '⭐', '♥', '✦'][i % 4];
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 2}s`;
    container.appendChild(star);
  }
}

function burstPartyConfetti(origin) {
  const colors = ['#ffd700', '#ff69b4', '#4169e1', '#32cd32', '#9370db', '#ff6347', '#fff', '#00bfff'];
  const rect = origin.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('span');
    piece.className = 'party-confetti';
    piece.style.left = `${cx}px`;
    piece.style.top = `${cy}px`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--tx', `${(Math.random() - 0.5) * 450}px`);
    piece.style.setProperty('--ty', `${-60 - Math.random() * 400}px`);
    piece.style.setProperty('--rot', `${Math.random() * 720}deg`);
    if (i % 3 === 0) piece.style.borderRadius = '50%';
    document.body.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
  }
}

function eruptVolcano() {
  partyVolcano.classList.add('party-volcano--active');
  burstPartyConfetti(partyVolcano);
  setTimeout(() => partyVolcano.classList.remove('party-volcano--active'), 2000);
}

function openPartyModal() {
  if (partyModal.classList.contains('open')) return;

  updatePartyUI();
  createModalStars();

  if (partyFireworksStop) partyFireworksStop();
  setPartyAtmosphere('letter');

  const rect = partyCard.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  partyPaperWrap.style.setProperty('--fly-x', `${cx}px`);
  partyPaperWrap.style.setProperty('--fly-y', `${cy}px`);

  partyCard.classList.add('party-table-card--opening');

  setTimeout(() => {
    partyModal.classList.add('open');
    partyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      partyModal.classList.add('party-modal--flying');
      setTimeout(() => {
        partyModal.classList.add('party-modal--unfolded');
        eruptVolcano();
        burstPartyConfetti(partyCard);
      }, 650);
    });
  }, 480);
}

function closePartyModal() {
  partyModal.classList.remove('party-modal--unfolded', 'party-modal--flying', 'open');
  partyModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  partyCard.classList.remove('party-table-card--opening', 'party-table-card--opened');

  if (partySectionVisible) {
    setPartyAtmosphere('fireworks');
    if (partyFireworksStart) partyFireworksStart();
  } else {
    setPartyAtmosphere('none');
  }
}

partyCard.addEventListener('click', openPartyModal);
document.getElementById('party-modal-close').addEventListener('click', closePartyModal);
document.querySelector('.party-modal-backdrop').addEventListener('click', closePartyModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && partyModal.classList.contains('open')) closePartyModal();
});

createPartyBalloons();
createPartyStreamers();
createPartyConfettiRain();
initPartyFireworks();
initPartyFrames();

applyLanguage(currentLang);

if (typeof window.bootSplash === 'function') {
  window.bootSplash();
}
