(function () {
  const audioSrc = (window.VOICE_NOTE && window.VOICE_NOTE.src) || 'voice/hiba-to-omar.mp4';
  const section = document.getElementById('voice-note');
  const card = document.getElementById('voice-card');
  const audio = document.getElementById('hiba-voice');
  const player = document.getElementById('voice-player');
  const playBtn = document.getElementById('voice-play-btn');
  const progress = document.getElementById('voice-progress');
  const progressFill = document.getElementById('voice-progress-fill');
  const timeCurrent = document.getElementById('voice-time-current');
  const timeTotal = document.getElementById('voice-time-total');
  const ourSong = document.getElementById('our-song');

  if (!audio || !playBtn) return;

  const source = audio.querySelector('source');
  if (source && source.getAttribute('src') !== audioSrc) {
    source.setAttribute('src', audioSrc);
    audio.load();
  }

  function t(path) {
    const lang = localStorage.getItem('lang') || 'ar';
    return path.split('.').reduce((obj, key) => obj?.[key], window.TRANSLATIONS?.[lang]);
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function setPlaying(playing) {
    player?.classList.toggle('is-playing', playing);
    playBtn.setAttribute('aria-label', playing ? t('voiceNote.pauseLabel') : t('voiceNote.playLabel'));
  }

  function updateProgress() {
    const duration = audio.duration || 0;
    const current = audio.currentTime || 0;
    const pct = duration ? (current / duration) * 100 : 0;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progress) progress.value = String(pct);
    if (timeCurrent) timeCurrent.textContent = formatTime(current);
    if (timeTotal) timeTotal.textContent = formatTime(duration);
  }

  function pauseBackgroundMusic() {
    if (ourSong && !ourSong.paused) {
      ourSong.pause();
    }
  }

  window.updateVoiceUI = function updateVoiceUI() {
    const set = (id, key) => {
      const el = document.getElementById(id);
      if (el && t(key)) el.textContent = t(key);
    };

    set('voice-note-title', 'voiceNote.title');
    set('voice-note-subtitle', 'voiceNote.subtitle');
    set('voice-badge', 'voiceNote.badge');
    set('voice-dedication', 'voiceNote.dedication');
    set('voice-hint', 'voiceNote.hint');
    set('voice-status', 'voiceNote.playing');

    playBtn.setAttribute('aria-label', audio.paused ? t('voiceNote.playLabel') : t('voiceNote.pauseLabel'));
  };

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      pauseBackgroundMusic();
      audio.play().catch(() => {
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  });

  progress?.addEventListener('input', () => {
    const duration = audio.duration || 0;
    if (!duration) return;
    audio.currentTime = (Number(progress.value) / 100) * duration;
    updateProgress();
  });

  audio.addEventListener('play', () => setPlaying(true));
  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('ended', () => {
    setPlaying(false);
    audio.currentTime = 0;
    updateProgress();
  });
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', updateProgress);
  audio.addEventListener('durationchange', updateProgress);

  audio.addEventListener('error', () => {
    if (card) card.classList.add('voice-card--hidden');
    if (section) section.style.display = 'none';
  });

  window.updateVoiceUI();
})();
