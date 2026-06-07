/**
 * about.js
 * Redline Academy — Team Bio Modal
 * Menangani fitur "Baca Selengkapnya" → modal popup bio anggota tim.
 */

(function () {
  'use strict';

  var overlay  = document.getElementById('teamBioModal');
  var closeBtn = document.getElementById('teamModalClose');
  var nameEl   = document.getElementById('modalMemberName');
  var roleEl   = document.getElementById('modalMemberRole');
  var bioEl    = document.getElementById('modalMemberBio');

  // Guard: keluar jika elemen modal tidak ditemukan di halaman ini
  if (!overlay || !closeBtn || !nameEl || !roleEl || !bioEl) return;

  function getTranslatedBio(key, fallback) {
    if (key && typeof window.t === 'function') {
      return window.t(key);
    }
    return fallback || '';
  }

  function openModal(name, role, bio, bioKey) {
    nameEl.textContent = name;
    roleEl.textContent = role;
    if (bioKey) {
      bioEl.setAttribute('data-i18n', bioKey);
    } else {
      bioEl.removeAttribute('data-i18n');
    }
    bioEl.innerHTML = getTranslatedBio(bioKey, bio);

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Fokus ke tombol close untuk aksesibilitas keyboard
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Delegasi event: tangkap semua klik tombol .btn-read-more di halaman
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-read-more');
    if (!btn) return;

    openModal(
      btn.getAttribute('data-name') || '',
      btn.getAttribute('data-role') || '',
      btn.getAttribute('data-bio')  || '',
      btn.getAttribute('data-bio-i18n') || ''
    );
  });

  // Tutup via tombol ✕
  closeBtn.addEventListener('click', closeModal);

  // Tutup via klik area gelap di luar box modal
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  // Tutup via tombol Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeModal();
    }
  });

}());
