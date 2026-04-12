/**
 * Redline Academy — GA4 Custom Events Tracking
 * Pasang file ini di semua halaman, tepat setelah Google Tag (gtag.js)
 * 
 * Cara pakai:
 *   <script src="/assets/js/redline-ga4-events.js"></script>
 */

document.addEventListener('DOMContentLoaded', function () {

  // ─────────────────────────────────────────────
  // 1. WHATSAPP CLICK
  //    Melacak setiap klik tombol WhatsApp
  // ─────────────────────────────────────────────
  document.querySelectorAll('a[href*="wa.me"]').forEach(function (el) {
    el.addEventListener('click', function () {
      gtag('event', 'whatsapp_click', {
        source_page: window.location.pathname,
        phone_number: '6282120171731'
      });
    });
  });


  // ─────────────────────────────────────────────
  // 2. CTA BUTTON CLICK
  //    Melacak klik tombol "Mulai Perjalananmu" & "Daftar Sekarang"
  // ─────────────────────────────────────────────
  document.querySelectorAll('a[href*="enroll-form"], a[href*="programs.html"]').forEach(function (el) {
    el.addEventListener('click', function () {
      gtag('event', 'cta_click', {
        button_text: el.innerText.trim(),
        source_page: window.location.pathname
      });
    });
  });


  // ─────────────────────────────────────────────
  // 3. LANGUAGE SWITCH
  //    Melacak pergantian bahasa (ID ↔ EN)
  // ─────────────────────────────────────────────
  document.querySelectorAll('img[src*="/flags/"]').forEach(function (el) {
    el.closest('div, span, a, button') && el.closest('div, span, a, button').addEventListener('click', function () {
      const lang = el.src.includes('/id.') ? 'id' : 'en';
      gtag('event', 'language_switch', {
        language_selected: lang,
        source_page: window.location.pathname
      });
    });
  });


  // ─────────────────────────────────────────────
  // 4. CONTACT FORM SUBMIT (halaman Hubungi Kami)
  //    Melacak pengiriman formulir kontak
  // ─────────────────────────────────────────────
  const contactForm = document.querySelector('form:not(#enroll-form)');
  if (contactForm) {
    contactForm.addEventListener('submit', function () {
      const kursusEl = contactForm.querySelector('select');
      gtag('event', 'contact_form_submit', {
        form_type: 'contact',
        selected_course: kursusEl ? kursusEl.value : 'unknown',
        source_page: window.location.pathname
      });
    });
  }


  // ─────────────────────────────────────────────
  // 5. ENROLLMENT FORM — START (halaman Programs)
  //    Melacak saat user mulai mengisi formulir pendaftaran
  // ─────────────────────────────────────────────
  const enrollForm = document.querySelector('#enroll-form, form');
  if (enrollForm && window.location.pathname.includes('programs')) {
    let enrollStarted = false;
    enrollForm.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('focus', function () {
        if (!enrollStarted) {
          enrollStarted = true;
          gtag('event', 'enroll_form_start', {
            source_page: window.location.pathname
          });
        }
      });
    });
  }


  // ─────────────────────────────────────────────
  // 6. ENROLLMENT FORM — SUBMIT
  //    Melacak pengiriman formulir pendaftaran
  // ─────────────────────────────────────────────
  if (enrollForm && window.location.pathname.includes('programs')) {
    enrollForm.addEventListener('submit', function () {
      const programEl  = enrollForm.querySelector('select[name*="program"], select');
      const paymentEl  = enrollForm.querySelector('select[name*="payment"], select:nth-of-type(2)');
      const schemeEl   = enrollForm.querySelector('input[name*="skema"]:checked, input[name*="scheme"]:checked');

      gtag('event', 'enroll_form_submit', {
        program_selected : programEl  ? programEl.value  : 'unknown',
        payment_method   : paymentEl  ? paymentEl.value  : 'unknown',
        payment_scheme   : schemeEl   ? schemeEl.value   : 'unknown',
        source_page      : window.location.pathname
      });
    });
  }


  // ─────────────────────────────────────────────
  // 7. PAYMENT METHOD SELECT
  //    Melacak metode pembayaran yang dipilih user
  // ─────────────────────────────────────────────
  const paymentSelect = document.querySelector('select[name*="payment"]');
  if (paymentSelect) {
    paymentSelect.addEventListener('change', function () {
      gtag('event', 'payment_method_select', {
        payment_method: paymentSelect.value,
        source_page: window.location.pathname
      });
    });
  }


  // ─────────────────────────────────────────────
  // 8. PROMO CODE APPLIED
  //    Melacak saat user menekan tombol "Terapkan" promo
  // ─────────────────────────────────────────────
  const promoBtn = document.querySelector('button[id*="promo"], button[class*="promo"]');
  if (promoBtn) {
    promoBtn.addEventListener('click', function () {
      const promoInput = document.querySelector('input[name*="promo"], input[placeholder*="romo"]');
      gtag('event', 'promo_applied', {
        promo_code: promoInput ? '[REDACTED]' : 'unknown', // jangan kirim kode asli ke GA4
        source_page: window.location.pathname
      });
    });
  }


  // ─────────────────────────────────────────────
  // 9. FAQ OPEN (halaman Hubungi Kami)
  //    Melacak FAQ mana yang sering dibuka
  // ─────────────────────────────────────────────
  document.querySelectorAll('details, .faq-item').forEach(function (faq) {
    faq.addEventListener('toggle', function () {
      if (faq.open) {
        const question = faq.querySelector('summary, h3, .faq-question');
        gtag('event', 'faq_open', {
          faq_question: question ? question.innerText.trim() : 'unknown',
          source_page: window.location.pathname
        });
      }
    });
  });


  // ─────────────────────────────────────────────
  // 10. PHONE CLICK
  //     Melacak klik nomor telepon
  // ─────────────────────────────────────────────
  document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
    el.addEventListener('click', function () {
      gtag('event', 'phone_click', {
        source_page: window.location.pathname
      });
    });
  });


  // ─────────────────────────────────────────────
  // 11. EMAIL CLICK
  //     Melacak klik link email
  // ─────────────────────────────────────────────
  document.querySelectorAll('a[href^="mailto:"]').forEach(function (el) {
    el.addEventListener('click', function () {
      gtag('event', 'email_click', {
        source_page: window.location.pathname
      });
    });
  });

});
