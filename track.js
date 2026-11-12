// Eventos de medição do site em window.dataLayer.
// Este arquivo NÃO carrega nenhuma tag (GTM, GA4, pixel). Só registra eventos na fila
// dataLayer; quando uma ferramenta de analytics for escolhida, ela lê esta fila.
// Nunca enviar e-mail, telefone ou outro dado pessoal nos eventos.
(function () {
  var dl = window.dataLayer = window.dataLayer || [];
  var CTA = 'a.q-btn, button.q-btn, a.hero-demo-link, .inline-cta a, a.nav-entrar, a.nav-entrar-pill, a.read-card, a[href^="mailto:"], a[href^="https://wa.me/"]';

  function where(el) {
    if (el.classList.contains('q-wa')) return 'floating';
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

// Origem do visitante, para o lead chegar dizendo de onde veio.
// Guarda no localStorage a primeira e a última visita vinda de fora (campanha, busca,
// IA, rede social, outro site), por 90 dias. Visita direta não apaga uma origem anterior.
// Nada de dado pessoal: só parâmetros de campanha, o domínio de quem indicou e o caminho
// da página de entrada, sem query string.
// Os formulários (lead-form.js, academy/academy.js) leem window.quittaOrigem() no envio.
// `canal` usa os mesmos nomes do "Original Source" do HubSpot (hs_analytics_source).
(function () {
  var KEY = 'quitta_origem';
  var TTL = 90 * 24 * 3600 * 1000;
  var PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid', 'li_fat_id', 'ttclid'];
  var OWN = /(^|\.)quitta\.ai$/;
  var AI = /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|you\.com|poe\.com|deepseek\.com|meta\.ai|grok\.com)$/;
  var MAIL = /(^|\.)(mail\.google\.com|outlook\.live\.com|outlook\.office\.com|outlook\.office365\.com|mail\.yahoo\.com)$/;
  var SEARCH = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yahoo\.com|ecosia\.org|search\.brave\.com|yandex\.[a-z]+)$/;
  var SOCIAL = /(^|\.)(linkedin\.com|lnkd\.in|facebook\.com|fb\.com|instagram\.com|t\.co|x\.com|twitter\.com|youtube\.com|threads\.net|reddit\.com|tiktok\.com)$/;
  var SOCIAL_SRC = /linkedin|facebook|instagram|meta|tiktok|twitter|^x$|youtube|reddit/;

  function clip(v) { return String(v || '').slice(0, 150); }

  function host(url) {
    try { return new URL(url).hostname.toLowerCase(); } catch (e) { return ''; }
  }

  function canal(p, ref) {
    var src = (p.utm_source || '').toLowerCase();
    var med = (p.utm_medium || '').toLowerCase();
    if (AI.test(src) || AI.test(ref)) return 'AI_REFERRALS';
    if (p.gclid || p.gbraid || p.wbraid || p.msclkid) return 'PAID_SEARCH';
    if (p.li_fat_id || p.ttclid) return 'PAID_SOCIAL';
    if (/^(cpc|ppc|paid|paidsearch|paid_search|sem)$/.test(med)) return SOCIAL_SRC.test(src) ? 'PAID_SOCIAL' : 'PAID_SEARCH';
    if (/^(paid_?social|social_?paid|cpm)$/.test(med)) return 'PAID_SOCIAL';
    if (/mail/.test(med)) return 'EMAIL_MARKETING';
    if (/social/.test(med) || (src && SOCIAL_SRC.test(src))) return 'SOCIAL_MEDIA';
    if (src || med || p.utm_campaign) return 'OTHER_CAMPAIGNS';
    if (p.fbclid) return 'SOCIAL_MEDIA';
    if (!ref) return 'DIRECT_TRAFFIC';
    if (MAIL.test(ref)) return 'EMAIL_MARKETING';
    if (SEARCH.test(ref)) return 'ORGANIC_SEARCH';
    if (SOCIAL.test(ref)) return 'SOCIAL_MEDIA';
    return 'REFERRALS';
  }

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }

  function fresh(t) { return t && t.ts && Date.now() - t.ts < TTL ? t : null; }

  var params = {};
  var qs = new URLSearchParams(location.search);
  PARAMS.forEach(function (k) { if (qs.get(k)) params[k] = clip(qs.get(k)); });
  var ref = host(document.referrer);
  if (OWN.test(ref) || ref === location.hostname) ref = '';

  var touch = { canal: canal(params, ref), params: params, ref: ref, entrada: clip(location.pathname), ts: Date.now() };
  var saved = read();
  var first = fresh(saved.first);
  var last = fresh(saved.last);
  var external = touch.canal !== 'DIRECT_TRAFFIC';

  if (external || !last) {
    var next = { first: first || touch, last: external || !last ? touch : last };
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
    first = next.first;
    last = next.last;
  }

  // Campos planos para o corpo do POST de lead. A última origem externa é a principal.
  window.quittaOrigem = function () {
    var out = {};
    if (!last) return out;
    PARAMS.forEach(function (k) { if (last.params[k]) out[k] = last.params[k]; });
    out.canal = last.canal;
    out.referencia = last.ref || '';
    out.entrada = last.entrada;
    out.primeiro_canal = first.canal;
    out.primeira_entrada = first.entrada;
    return out;
  };
})();
