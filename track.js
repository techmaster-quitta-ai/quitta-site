// Eventos de medição do site em window.dataLayer.
// Este arquivo NÃO carrega nenhuma tag (GTM, GA4, pixel). Só registra eventos na fila
// dataLayer; quando uma ferramenta de analytics for escolhida, ela lê esta fila.
// Nunca enviar e-mail, telefone ou outro dado pessoal nos eventos.
(function () {
  var dl = window.dataLayer = window.dataLayer || [];
  var CTA = 'a.q-btn, button.q-btn, a.hero-demo-link, .inline-cta a, a.nav-entrar, a.nav-entrar-pill, a.read-card, a[href^="mailto:"]';

  function where(el) {
    if (el.closest('nav') && !el.closest('main')) return 'nav';
    if (el.closest('footer')) return 'footer';
    var sec = el.closest('section[id], header[id]');
    return sec ? sec.id : 'main';
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest(CTA);
    if (!el || el.type === 'submit') return;
    dl.push({
      event: 'cta_click',
      cta_text: ((el.querySelector('h3') || el).textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      cta_href: el.getAttribute('href') || '',
      cta_location: where(el),
      page_path: location.pathname
    });
  }, true);
})();
