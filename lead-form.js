// Formulário de contato do site (home, /en e páginas de setor).
// Destino: data-endpoint do formulário ou, sem ele, a API de leads do app.
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
    done: { conversa: 'Received — we will get in touch ✓', diagnostico: 'Received — we reply within 5 business days ✓' }
  } : {
    sending: 'Enviando…',
    error: 'Não foi possível enviar — tente novamente',
    errorHelp: 'Se o erro continuar, escreva para ',
    done: { conversa: 'Recebido — vamos entrar em contato ✓', diagnostico: 'Recebido — retornamos em até 5 dias úteis ✓' }
  };

  document.querySelectorAll('form.js-contact').forEach(function (form) {
    var btn = form.querySelector('button[type=submit]');
    var status = form.querySelector('.cta-status');
    var radios = [].slice.call(form.querySelectorAll('.lead-intent input[type=radio]'));
    var busy = false;

    function intent() {
      var checked = radios.filter(function (r) { return r.checked; })[0];
      return checked ? checked.value : 'conversa';
    }
    function syncLabel() {
      btn.textContent = btn.getAttribute('data-label-' + intent());
    }
    function choose(value) {
      radios.forEach(function (r) { r.checked = r.value === value; });
      syncLabel();
    }

    radios.forEach(function (r) { r.addEventListener('change', syncLabel); });

    // Links podem escolher a opção: data-intent na própria página, ?tipo= vindo de outra.
    document.querySelectorAll('a[data-intent]').forEach(function (a) {
      a.addEventListener('click', function () { choose(a.getAttribute('data-intent')); });
    });
    var fromUrl = new URLSearchParams(location.search).get('tipo');
    if (fromUrl === 'diagnostico' || fromUrl === 'conversa') choose(fromUrl);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      busy = true;
      btn.setAttribute('aria-disabled', 'true');
      btn.textContent = text.sending;
      status.textContent = text.sending;

      var endpoint = form.getAttribute('data-endpoint');
      var data = Object.fromEntries(new FormData(form));
      // A API de leads guarda só os campos do seu modelo: `nome` e `intencao` são
      // descartados e `tipo` não aceita "conversa". Por isso os dois vão em `notas`.
      if (!endpoint) data.notas = 'Nome: ' + data.nome + ' | Prefere: ' + intent();

      fetch(endpoint || DEFAULT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        var done = text.done[intent()];
        btn.textContent = done;
        status.textContent = done;
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
