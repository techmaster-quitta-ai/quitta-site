// Quitta AI Academy — comportamento compartilhado das páginas /academy/.
// forms → API de leads do app (mesmo endpoint do site). Regra herdada da home:
// nunca confirmar envio que não aconteceu; sem endpoint, entregar o e-mail de fallback.
const FORM_ENDPOINT = 'https://app.quitta.ai/api/v1/site/leads';
const FALLBACK_EMAIL = 'angelo@quitta.ai';
// A API grava o lead mas não avisa ninguém: todo envio também vai por e-mail para a
// equipe via FormSubmit. Mesma configuração em /lead-form.js. Conta como recebido se a
// API OU o aviso der certo, porque nos dois casos a equipe tem o lead.
const NOTIFY_ENDPOINT = 'https://formsubmit.co/ajax/angelo@quitta.ai';
const NOTIFY_CC = 'esdras@quitta.ai,alexandre@quitta.ai';

// Resolve true só se o FormSubmit confirmar o envio (antes da ativação ele responde
// 200 com success "false"). O visitante não espera mais que 8 s pelo aviso.
function notifyLead(data, saved) {
  const body = Object.assign({}, data, {
    destino_principal: 'app.quitta.ai' + (saved ? ': gravado' : ': FALHOU, o lead só existe neste e-mail'),
    // newsletter e material não pedem empresa (leadPayload preenche "Não informado (...)")
    _subject: 'Novo lead do site: ' + (data.empresa.indexOf('Não informado') === 0
      ? (data.tipo || 'academy') + (data.material ? ': ' + data.material : '') + ', ' + data.email
      : data.empresa + ' (' + (data.tipo || 'academy') + ')'),
    _cc: NOTIFY_CC,
    _template: 'table'
  });
  const sent = fetch(NOTIFY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body)
  }).then(res => res.ok ? res.json() : {})
    .then(j => String(j.success) === 'true', () => false);
  const timeout = new Promise(resolve => setTimeout(() => resolve(false), 8000));
  return Promise.race([sent, timeout]);
}

// A API exige `empresa` em todo lead (400 sem ela) e descarta campos fora do seu
// modelo, como `material`. Newsletter e material pedem só o e-mail, então
// mandamos um valor que identifica o pedido. Sai quando a API aceitar lead sem empresa.
function leadPayload(form) {
  const data = Object.fromEntries(new FormData(form));
  if (!data.empresa) {
    data.empresa = 'Não informado (' + (data.tipo || 'academy') +
      (data.material ? ': ' + data.material : '') + ')';
  }
  return data;
}

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
    const data = Object.assign({}, src, leadPayload(form));
    let saved = false;
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      saved = res.ok;
    } catch (err) {}
    const sent = await notifyLead(data, saved);
    if (!saved && !sent) {
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
    // conversão do Google Ads (track.js); só conta tipo "diagnostico"
    try { if (window.quittaConversao) window.quittaConversao(tipo); } catch (e) {}
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
