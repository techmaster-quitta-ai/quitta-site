// Formulário de contato do site (home, /en e páginas de setor).
// Destino: data-endpoint do formulário ou, sem ele, a API de leads do app.
// A API só guarda os campos do seu modelo; campo novo aqui exige ajuste lá, ou se
// perde sem aviso. Isso vale para os campos de origem (canal, utm_*, gclid...) que
// vêm de window.quittaOrigem(), definido em track.js.
// Regra herdada: nunca confirmar um envio que não aconteceu. Se falhar, o lead
// vê o erro e recebe o e-mail de contato.
(function () {
  var DEFAULT_ENDPOINT = 'https://app.quitta.ai/api/v1/site/leads';
  var FALLBACK_EMAIL = 'angelo@quitta.ai';
  var en = document.documentElement.lang.toLowerCase().indexOf('en') === 0;
  var text = en ? {
    sending: 'Sending…',
    error: 'Could not send — please try again',
    errorHelp: 'If it keeps failing, write to ',
    done: 'Received — we will get in touch ✓'
  } : {
    sending: 'Enviando…',
    error: 'Não foi possível enviar — tente novamente',
    errorHelp: 'Se o erro continuar, escreva para ',
    done: 'Recebido — vamos entrar em contato ✓'
  };

  // lead_submit em window.dataLayer só depois do envio confirmado; sem dado pessoal.
  function origem() {
    try { return window.quittaOrigem ? window.quittaOrigem() : {}; } catch (e) { return {}; }
  }

  function pushLead(form, src) {
    var get = function (n) { var el = form.querySelector('[name=' + n + ']'); return el ? el.value : ''; };
    (window.dataLayer = window.dataLayer || []).push({
      event: 'lead_submit', form_origem: get('origem') || get('source'), form_pagina: get('pagina') || get('page'),
      form_tipo: get('tipo'), page_path: location.pathname,
      lead_canal: src.canal || '', lead_utm_source: src.utm_source || '',
      lead_utm_medium: src.utm_medium || '', lead_utm_campaign: src.utm_campaign || ''
    });
    // conversão do Google Ads (track.js); só conta tipo "diagnostico"
    try { if (window.quittaConversao) window.quittaConversao(get('tipo')); } catch (e) {}
  }

  document.querySelectorAll('form.js-contact').forEach(function (form) {
    var btn = form.querySelector('button[type=submit]');
    var status = form.querySelector('.cta-status');
    var busy = false;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      busy = true;
      btn.setAttribute('aria-disabled', 'true');
      btn.textContent = text.sending;
      status.textContent = text.sending;
      var src = origem();

      fetch(form.getAttribute('data-endpoint') || DEFAULT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        // campos do formulário vencem os de origem se um dia tiverem o mesmo nome
        body: JSON.stringify(Object.assign({}, src, Object.fromEntries(new FormData(form))))
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        pushLead(form, src);
        btn.textContent = text.done;
        status.textContent = text.done;
      }).catch(function () {
        busy = false;
        btn.removeAttribute('aria-disabled');
        btn.textContent = text.error;
        status.textContent = text.errorHelp;
        var link = document.createElement('a');
        link.href = 'mailto:' + FALLBACK_EMAIL;
        link.textContent = FALLBACK_EMAIL;
        status.appendChild(link);
      });
    });
  });
})();
