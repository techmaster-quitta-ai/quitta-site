// Formulário de contato do site (home, /en e páginas de setor).
// Destino: data-endpoint do formulário ou, sem ele, a API de leads do app.
// A API só guarda os campos do seu modelo; campo novo aqui exige ajuste lá, ou se
// perde sem aviso.
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
  function pushLead(form) {
    var get = function (n) { var el = form.querySelector('[name=' + n + ']'); return el ? el.value : ''; };
    (window.dataLayer = window.dataLayer || []).push({
      event: 'lead_submit', form_origem: get('origem') || get('source'), form_pagina: get('pagina') || get('page'),
      form_tipo: get('tipo'), page_path: location.pathname
    });
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

      fetch(form.getAttribute('data-endpoint') || DEFAULT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        pushLead(form);
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
