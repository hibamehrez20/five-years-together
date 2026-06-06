(function () {
  const pdfUrl = (window.BOOK_GIFT && window.BOOK_GIFT.pdf) || 'book/gift-book.pdf';
  const modal = document.getElementById('book-gift-modal');
  const iframe = document.getElementById('book-gift-iframe');
  const pdfjsEl = document.getElementById('book-gift-pdfjs');
  const readBtn = document.getElementById('book-gift-read');
  const coverBtn = document.getElementById('book-gift-cover-btn');
  const downloadInline = document.getElementById('book-gift-download-inline');
  const downloadModal = document.getElementById('book-gift-download');
  const downloadHead = document.getElementById('book-gift-download-head');

  let pdfjsRendered = false;
  let pdfjsRendering = false;

  function t(path) {
    const lang = localStorage.getItem('lang') || 'ar';
    return path.split('.').reduce((obj, key) => obj?.[key], window.TRANSLATIONS?.[lang]);
  }

  function setDownloadLinks() {
    const fileName = t('bookGift.downloadFile') || 'gift-book.pdf';
    [downloadInline, downloadModal, downloadHead].forEach((el) => {
      if (!el) return;
      el.href = pdfUrl;
      el.setAttribute('download', fileName);
    });
  }

  window.updateBookGiftUI = function updateBookGiftUI() {
    const set = (id, key) => {
      const el = document.getElementById(id);
      if (el && t(key)) el.textContent = t(key);
    };
    set('book-gift-title', 'bookGift.title');
    set('book-gift-subtitle', 'bookGift.subtitle');
    set('book-gift-cover-title', 'bookGift.coverTitle');
    set('book-gift-to', 'bookGift.to');
    set('book-gift-note', 'bookGift.note');
    set('book-gift-read', 'bookGift.readBtn');
    set('book-gift-modal-title', 'bookGift.modalTitle');
    set('book-gift-download', 'bookGift.downloadLabel');
    set('book-gift-download-head', 'bookGift.downloadLabel');
    set('book-gift-download-inline', 'bookGift.downloadLabel');
    set('book-gift-ribbon', 'bookGift.ribbon');

    setDownloadLinks();

    const closeBtn = document.getElementById('book-gift-modal-close');
    if (closeBtn) closeBtn.setAttribute('aria-label', t('bookGift.closeLabel'));
    if (readBtn) readBtn.setAttribute('aria-label', t('bookGift.readBtn'));
    if (coverBtn) coverBtn.setAttribute('aria-label', t('bookGift.readBtn'));
  };

  function showStatus(html) {
    if (!pdfjsEl) return;
    pdfjsEl.classList.remove('hidden');
    pdfjsEl.innerHTML = html;
  }

  function useIframeFallback() {
    if (!iframe) return;
    iframe.classList.remove('hidden');
    if (pdfjsEl) pdfjsEl.classList.add('hidden');
    iframe.src = pdfUrl + '#toolbar=1&navpanes=0&view=FitH';
  }

  async function renderWithPdfJs() {
    if (pdfjsRendering) return pdfjsRendered;
    if (pdfjsRendered) return true;

    if (typeof pdfjsLib === 'undefined') {
      useIframeFallback();
      return false;
    }

    pdfjsRendering = true;
    showStatus(`<p class="book-gift-modal__status">${t('bookGift.loading') || 'Loading…'}</p>`);
    if (iframe) iframe.classList.add('hidden');
    pdfjsEl?.classList.remove('hidden');

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    try {
      const pdf = await pdfjsLib.getDocument({ url: pdfUrl, disableWorker: true }).promise;

      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const maxWidth = Math.max(280, (pdfjsEl.clientWidth || window.innerWidth * 0.88) - 20);
      pdfjsEl.innerHTML = '';

      for (let num = 1; num <= pdf.numPages; num++) {
        const page = await pdf.getPage(num);
        const viewport = page.getViewport({
          scale: Math.min(maxWidth / page.getViewport({ scale: 1 }).width, 2.2),
        });

        const wrap = document.createElement('div');
        wrap.className = 'book-gift-page';

        const label = document.createElement('span');
        label.className = 'book-gift-page__num';
        label.textContent = `${num} / ${pdf.numPages}`;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        wrap.appendChild(label);
        wrap.appendChild(canvas);
        pdfjsEl.appendChild(wrap);
      }

      pdfjsRendered = true;
      return true;
    } catch (err) {
      console.error('PDF.js failed:', err);
      useIframeFallback();
      return false;
    } finally {
      pdfjsRendering = false;
    }
  }

  async function openBookGiftReader() {
    if (!modal) return;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    await renderWithPdfJs();
    pdfjsEl?.scrollTo(0, 0);
  }

  function closeBookGiftReader() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (iframe) iframe.src = 'about:blank';
    pdfjsRendered = false;
    pdfjsRendering = false;
    if (pdfjsEl) {
      pdfjsEl.innerHTML = '';
      pdfjsEl.classList.add('hidden');
    }
  }

  readBtn?.addEventListener('click', openBookGiftReader);
  coverBtn?.addEventListener('click', openBookGiftReader);

  modal?.querySelectorAll('[data-book-close]').forEach((el) => {
    el.addEventListener('click', closeBookGiftReader);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) closeBookGiftReader();
  });

  setDownloadLinks();
})();
