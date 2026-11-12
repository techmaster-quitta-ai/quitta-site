// Botão flutuante de WhatsApp, incluído em todas as páginas.
// É um link wa.me puro: não carrega widget, script nem cookie de terceiros.
// Para trocar o número ou a mensagem, edite só este arquivo.
(function () {
  var NUMBER = '5511951277801';
  var en = /^en\b/i.test(document.documentElement.lang || '');
  var copy = en
    ? { label: 'Chat on WhatsApp',
        aria: 'Chat with Quitta on WhatsApp (opens in a new tab)',
        text: "Hi! I found Quitta through the website and would like to talk about my company's overdue receivables." }
    : { label: 'Fale no WhatsApp',
        aria: 'Falar com a Quitta no WhatsApp (abre em nova aba)',
        text: 'Olá! Vim pelo site da Quitta e quero conversar sobre a carteira em atraso da minha empresa.' };

  var css =
    '.q-wa{position:fixed;right:20px;bottom:20px;z-index:70;display:flex;align-items:center;gap:10px;' +
    'height:56px;min-width:56px;padding:0 18px 0 15px;box-sizing:border-box;border-radius:28px;' +
    // Texto escuro sobre o verde do WhatsApp: 8,6:1 (branco daria 2:1 e reprova no WCAG).
    'background:#25D366;color:#0B1F16;font-family:inherit;font-size:15px;font-weight:600;line-height:1;' +
    'text-decoration:none;box-shadow:0 6px 20px rgba(11,31,22,.28);' +
    'transition:transform .15s ease,box-shadow .15s ease}' +
    '.q-wa:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(11,31,22,.34);color:#0B1F16}' +
    '.q-wa:focus-visible{outline:3px solid #0B1F16;outline-offset:3px;box-shadow:0 0 0 3px #fff,0 6px 20px rgba(11,31,22,.28)}' +
    '.q-wa svg{width:26px;height:26px;flex:none;fill:currentColor}' +
    '.q-wa span{white-space:nowrap}' +
    '@media (max-width:767px){.q-wa{right:16px;bottom:16px;padding:0;justify-content:center}.q-wa span{display:none}}' +
    '@media (prefers-reduced-motion:reduce){.q-wa{transition:none}.q-wa:hover{transform:none}}' +
    '@media print{.q-wa{display:none}}' +
    // Some enquanto há painel em tela cheia aberto (detalhe do /diagnostico no mobile, <dialog>).
    'body:has(.detail-static.is-open) .q-wa,body:has(dialog[open]) .q-wa{display:none}';

  function mount() {
    if (document.querySelector('.q-wa')) return;
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var a = document.createElement('a');
    a.className = 'q-wa';
    a.href = 'https://wa.me/' + NUMBER + '?text=' + encodeURIComponent(copy.text);
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', copy.aria);
    a.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>' +
      '<span>' + copy.label + '</span>';
    document.body.appendChild(a);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
