// Coventry Systems — light interaction layer

(function () {
  // Sticky header shadow on scroll
  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Contact form — wired to Formspree
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const errorBox = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');

  if (form && success && errorBox) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      if (!name) { form.querySelector('#name').focus(); return; }
      if (!email) { form.querySelector('#email').focus(); return; }

      // Reset any prior error state
      errorBox.hidden = true;

      // Loading state
      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (response.ok) {
          // Hide every form child except the success block
          Array.from(form.children).forEach((child) => {
            if (child.id !== 'formSuccess') child.style.display = 'none';
          });
          success.hidden = false;
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Try to surface a Formspree error message if present
          let detail = '';
          try {
            const data = await response.json();
            if (data && Array.isArray(data.errors) && data.errors.length) {
              detail = ' (' + data.errors.map(function (er) { return er.message; }).join('; ') + ')';
            }
          } catch (_) { /* ignore JSON parse errors */ }

          const errMsg = errorBox.querySelector('p');
          if (errMsg && detail) {
            errMsg.innerHTML = "We couldn't submit your message" + detail + '. Please try again, or email us directly at <a href=\"mailto:contact@coventrysystems.com\">contact@coventrysystems.com</a>.';
          }
          errorBox.hidden = false;
          errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      } catch (err) {
        errorBox.hidden = false;
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }

  // Smooth scroll for in-page anchor clicks (header offset compensation)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', function (e) {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 1;
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', id);
    });
  });
})();

// Accessibility toggle — Atkinson Hyperlegible font mode
(function () {
  var KEY = 'coventry-a11y';
  var VALUE = 'hyperlegible';
  var btn = document.querySelector('.a11y-toggle');
  if (!btn) return;

  function isOn() {
    try { return localStorage.getItem(KEY) === VALUE; } catch (e) { return false; }
  }

  function apply(on) {
    if (on) {
      document.documentElement.setAttribute('data-a11y', VALUE);
      try { localStorage.setItem(KEY, VALUE); } catch (e) {}
    } else {
      document.documentElement.removeAttribute('data-a11y');
      try { localStorage.removeItem(KEY); } catch (e) {}
    }
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on
      ? 'Turn off accessible font (Atkinson Hyperlegible)'
      : 'Turn on accessible font (Atkinson Hyperlegible)');
  }

  // Initialise from saved pref
  apply(isOn());

  btn.addEventListener('click', function (e) {
    apply(!isOn());
    // Drop focus after mouse click so the outline doesn't linger.
    // Keyboard users (Enter/Space) keep the focus ring — e.detail is 0 for keyboard.
    if (e.detail !== 0) btn.blur();
  });
})();
