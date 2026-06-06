(function () {
  const CORRECT_CODE = '762021';
  const SPLASH_COUNT = 3;
  const SPLASH_AUTO_MS = 3200;

  const gate = document.getElementById('passcode-gate');
  const splashEl = document.getElementById('splash-sequence');
  if (!gate || !splashEl) return;

  function mediaPath(folder, filename) {
    return folder + '/' + encodeURIComponent(filename);
  }

  function initPolaroidPhoto() {
    var img = document.getElementById('polaroid-photo');
    var photos = window.GALLERY_MEDIA && window.GALLERY_MEDIA.photos;
    if (!img || !photos || !photos.length) return;
    img.src = mediaPath('photos', photos[0]);
  }

  initPolaroidPhoto();

  const dots = Array.from(gate.querySelectorAll('.passcode-dot'));
  const errorEl = document.getElementById('passcode-error');
  const splashScreens = Array.from(splashEl.querySelectorAll('.splash-screen'));
  const splashDots = Array.from(splashEl.querySelectorAll('.splash-progress__dot'));
  const canvas = document.getElementById('splash-fireworks');
  let digits = [];
  let fireworksRaf = null;
  let splashTimer = null;
  let splashIndex = 0;
  let particles = [];
  let splashActive = false;
  let splashBooted = false;
  let splashAdvancing = false;
  let lastPasscodeTouch = 0;
  let lastSplashTouch = 0;

  if (splashEl.classList.contains('is-active')) {
    splashActive = true;
  }

  function isPasscodeActive() {
    return !gate.classList.contains('passcode-gate--waiting')
      && !gate.classList.contains('is-unlocked')
      && !splashActive;
  }

  function updateDots() {
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-filled', i < digits.length);
      dot.classList.toggle('is-active', i === digits.length);
    });
  }

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.add('is-visible');
    gate.classList.remove('is-shake');
    void gate.offsetWidth;
    gate.classList.add('is-shake');
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = '';
    errorEl.classList.remove('is-visible');
  }

  function finishUnlock() {
    gate.classList.remove('passcode-gate--waiting');
    gate.classList.add('is-unlocked');
    gate.setAttribute('aria-hidden', 'true');
    if (typeof window.playOurSong === 'function') {
      window.playOurSong();
    }
    if (typeof window.updateScrollProgress === 'function') {
      window.updateScrollProgress();
    }
  }

  function showPasscode() {
    gate.classList.remove('passcode-gate--waiting');
    gate.classList.add('passcode-gate--ready');
    gate.setAttribute('aria-hidden', 'false');
  }

  function hideSplash() {
    stopFireworks();
    clearSplashTimer();
    splashActive = false;
    splashEl.classList.remove('is-active');
    splashEl.classList.add('is-done');
    splashEl.setAttribute('aria-hidden', 'true');
    splashEl.style.display = 'none';
    showPasscode();
  }

  function clearSplashTimer() {
    if (splashTimer) {
      clearTimeout(splashTimer);
      splashTimer = null;
    }
  }

  function scheduleSplashAuto() {
    clearSplashTimer();
    if (splashIndex >= SPLASH_COUNT - 1) return;
    splashTimer = setTimeout(advanceSplash, SPLASH_AUTO_MS);
  }

  function setSplashScreen(index) {
    splashScreens.forEach(function (screen, i) {
      screen.classList.toggle('is-active', i === index);
    });

    splashDots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === index);
      dot.classList.toggle('is-done', i < index);
    });

    const tapHint = document.getElementById('splash-tap-hint');
    const s3Hint = document.getElementById('splash-3-hint');
    if (tapHint) {
      tapHint.style.opacity = index >= SPLASH_COUNT - 1 ? '0' : '1';
    }
    if (s3Hint) {
      s3Hint.style.display = index >= SPLASH_COUNT - 1 ? 'block' : 'none';
    }
  }

  function finishSplash() {
    hideSplash();
  }

  function advanceSplash() {
    if (!splashActive || splashAdvancing) return;
    if (typeof window.unlockMobileAudio === 'function') {
      window.unlockMobileAudio();
    }
    splashAdvancing = true;

    if (splashIndex >= SPLASH_COUNT - 1) {
      finishSplash();
      splashAdvancing = false;
      return;
    }

    splashIndex += 1;
    setSplashScreen(splashIndex);
    scheduleSplashAuto();
    splashAdvancing = false;
  }

  function startSplashSequence() {
    if (splashBooted) return;
    splashBooted = true;

    if (typeof window.updateSplashUI === 'function') {
      window.updateSplashUI();
    }

    splashActive = true;
    splashIndex = 0;
    splashEl.style.display = 'flex';
    splashEl.classList.add('is-active');
    splashEl.classList.remove('is-done');
    splashEl.setAttribute('aria-hidden', 'false');
    setSplashScreen(0);
    startFireworks();
    scheduleSplashAuto();
  }

  window.bootSplash = startSplashSequence;

  function createParticles(count, cx, cy) {
    const items = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.35 + Math.random() * 1.4;
      items.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 22,
        alpha: 0.25 + Math.random() * 0.55,
        life: 0.55 + Math.random() * 0.45,
        decay: 0.004 + Math.random() * 0.006,
        round: Math.random() > 0.35,
        drift: (Math.random() - 0.5) * 0.02,
      });
    }
    return items;
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawFireworks() {
    if (!canvas || !splashActive) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    particles.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx += p.drift;
      p.vy += 0.004;
      p.life -= p.decay;
      p.alpha *= 0.992;

      if (p.life <= 0) return;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha * p.life);
      ctx.fillStyle = p.round ? '#fff8f0' : '#ffe8ea';
      ctx.beginPath();
      if (p.round) {
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      } else {
        const s = p.size * p.life;
        ctx.rect(p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.fill();
      ctx.restore();
    });

    particles = particles.filter(function (p) {
      return p.life > 0 && p.alpha > 0.02;
    });

    if (Math.random() < 0.12) {
      particles = particles.concat(createParticles(8, cx, cy));
    }

    fireworksRaf = requestAnimationFrame(drawFireworks);
  }

  function startFireworks() {
    stopFireworks();
    resizeCanvas();
    particles = createParticles(70, canvas.clientWidth / 2, canvas.clientHeight / 2);
    drawFireworks();
  }

  function stopFireworks() {
    if (fireworksRaf) {
      cancelAnimationFrame(fireworksRaf);
      fireworksRaf = null;
    }
    particles = [];
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    }
  }

  function unlock() {
    clearError();
    finishUnlock();
  }

  function checkCode() {
    if (digits.length < 6) return;

    if (digits.join('') === CORRECT_CODE) {
      unlock();
    } else {
      showError("incorrect password you don't love me");
      digits = [];
      updateDots();
    }
  }

  function addDigit(d) {
    if (!isPasscodeActive() || digits.length >= 6) return;
    if (typeof window.unlockMobileAudio === 'function') {
      window.unlockMobileAudio();
    }
    clearError();
    digits.push(String(d));
    updateDots();
    checkCode();
  }

  function removeDigit() {
    if (!isPasscodeActive() || !digits.length) return;
    clearError();
    digits.pop();
    updateDots();
  }

  function handlePasscodePointer(e) {
    if (!isPasscodeActive()) return;

    const key = e.target.closest('.passcode-key[data-digit]');
    if (key) {
      e.preventDefault();
      e.stopPropagation();
      addDigit(key.dataset.digit);
      return;
    }

    if (e.target.closest('#passcode-back')) {
      e.preventDefault();
      e.stopPropagation();
      removeDigit();
    }
  }

  gate.addEventListener('touchend', function (e) {
    lastPasscodeTouch = Date.now();
    handlePasscodePointer(e);
  }, { passive: false });

  gate.addEventListener('click', function (e) {
    if (Date.now() - lastPasscodeTouch < 400) return;
    handlePasscodePointer(e);
  });

  splashEl.addEventListener('touchend', function (e) {
    e.preventDefault();
    lastSplashTouch = Date.now();
    advanceSplash();
  }, { passive: false });

  splashEl.addEventListener('click', function (e) {
    if (Date.now() - lastSplashTouch < 400) return;
    e.preventDefault();
    e.stopPropagation();
    advanceSplash();
  });

  document.addEventListener('keydown', function (e) {
    if (gate.classList.contains('is-unlocked')) return;

    if (splashActive) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advanceSplash();
      }
      return;
    }

    if (!isPasscodeActive()) return;

    if (e.key >= '0' && e.key <= '9') {
      addDigit(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      removeDigit();
    }
  });

  window.addEventListener('resize', function () {
    if (splashActive) resizeCanvas();
  });

  updateDots();
})();
