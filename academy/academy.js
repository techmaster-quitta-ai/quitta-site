// Quitta AI Academy — comportamento compartilhado das páginas /academy/.
// forms → Formspree (mesmo endpoint do site). Regra herdada da home: nunca
// confirmar envio que não aconteceu; sem endpoint, entregar o e-mail de fallback.
const FORM_ENDPOINT = 'https://app.quitta.ai/api/v1/site/leads';
const FALLBACK_EMAIL = 'angelo@quitta.ai';

document.querySelectorAll('form.js-lead').forEach(form => {
  const btn = form.querySelector('button[type=submit]');
  const status = form.querySelector('.cta-status');
  const label = btn.textContent;
  let busy = false;
  const say = m => { btn.textContent = m; if (status) status.textContent = m; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    if (!form.reportValidity()) return;
    if (!FORM_ENDPOINT) {
      if (status) status.innerHTML = 'Envio automático indisponível — escreva para ' +
        '<a href="mailto:' + FALLBACK_EMAIL + '">' + FALLBACK_EMAIL + '</a>.';
      return;
    }
    busy = true;
    btn.setAttribute('aria-disabled', 'true');
    say('Enviando…');
    // origem do visitante (track.js); a API só guarda o que estiver no modelo dela
    let src = {};
    try { src = window.quittaOrigem ? window.quittaOrigem() : {}; } catch (err) {}
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.assign({}, src, Object.fromEntries(new FormData(form))))
      });
      if (!res.ok) throw new Error(res.status);
    } catch (err) {
      busy = false;
      btn.removeAttribute('aria-disabled');
      say('Não foi possível enviar — tente novamente');
      setTimeout(() => { btn.textContent = label; }, 4000);
      return;
    }
    const tipo = (form.querySelector('[name=tipo]') || {}).value;
    // lead_submit em window.dataLayer só depois do envio confirmado; sem dado pessoal.
    (window.dataLayer = window.dataLayer || []).push({
      event: 'lead_submit', form_origem: (form.querySelector('[name=origem]') || {}).value || '',
      form_pagina: (form.querySelector('[name=pagina]') || {}).value || '', form_tipo: tipo || '',
      page_path: location.pathname, lead_canal: src.canal || '', lead_utm_source: src.utm_source || '',
      lead_utm_medium: src.utm_medium || '', lead_utm_campaign: src.utm_campaign || ''
    });
    say(tipo === 'diagnostico' ? 'Recebido — retornamos em até 5 dias úteis ✓'
      : tipo === 'material' ? 'Recebido — o material chega em até 1 dia útil ✓'
      : 'Inscrição recebida ✓');
  });
});

// botões "copiar" das mensagens prontas
document.querySelectorAll('.tpl-copy').forEach(btn => {
  btn.addEventListener('click', async () => {
    const pre = btn.closest('.tpl').querySelector('pre');
    const original = btn.textContent;
    try {
      await navigator.clipboard.writeText(pre.innerText);
      btn.textContent = 'Copiado ✓';
      btn.classList.add('ok');
    } catch (err) {
      // clipboard bloqueado (http local, permissão): seleciona o texto para copiar manual
      const range = document.createRange();
      range.selectNodeContents(pre);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      btn.textContent = 'Selecione e copie';
    }
    setTimeout(() => { btn.textContent = original; btn.classList.remove('ok'); }, 2400);
  });
});
