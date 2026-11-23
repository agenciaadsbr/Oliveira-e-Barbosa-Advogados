/* =====================================================================
   Oliveira e Barbosa Advogados — LP Superendividamento (área bancária)
   Configuração + rastreamento compartilhados por index.html e redirect.html
   ---------------------------------------------------------------------
   PREENCHA AQUI (nada de credenciais inventadas):
   ===================================================================== */
window.OB_CONFIG = {
  // WhatsApp da área bancária — só dígitos, com 55 + DDD.
  // Valor atual = número público do site institucional. Trocar quando o
  // escritório definir o WhatsApp próprio do bancário.
  whatsappNumber: '5584999843753',

  whatsappMessage:
    'Olá! Acessei a página do Oliveira e Barbosa Advogados e gostaria de conversar sobre minha situação financeira e possíveis alternativas para minhas dívidas.',

  // Meta Pixel / Dataset ID. Vazio = pixel não carrega.
  metaPixelId: '',

  // Endpoint futuro do CRM / agente de IA (Power Dash, Edge Function etc.).
  // Vazio = nada é enviado. Recebe POST JSON com o lead + origem.
  leadWebhookUrl: '',

  // Identificação da área — separa campanhas bancárias das previdenciárias
  // em Pixel (content_category), CRM (payload.area) e relatórios.
  area: 'bancario',
  produto: 'superendividamento',
  lpId: 'lp-bancario-superendividamento',

  // Painel de leads (Supabase "ADS BR CLIENTES" — mesmo padrão das demais LPs ADS BR).
  // A chave anon é pública por design; a leitura exige login e é protegida por RLS.
  site: 'oliveira-barbosa-bancario',
  // todas as LPs do escritório exibidas no painel /dashboard
  sites: ['oliveira-barbosa-bancario', 'oliveira-barbosa-maternidade'],
  cliente: 'Oliveira & Barbosa Advogados',
  supabaseUrl: 'https://qxhnjzyhtllmtdrcyygi.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aG5qenlodGxsbXRkcmN5eWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMzczNjgsImV4cCI6MjA5NzgxMzM2OH0.DWf4I_x9F--H7ZZHUt_n4V3B__Nlsf1jNZdUV0vNBLU',

  // Página intermediária e tempo de espera antes de abrir o WhatsApp.
  redirectPath: 'redirect.html',
  redirectDelayMs: 3000
};

// Cada página pode sobrescrever a configuração definindo window.OB_PAGE antes deste arquivo
// (ex.: salario-maternidade.html usa outro site, área, mensagem e redirect).
if (window.OB_PAGE) Object.assign(window.OB_CONFIG, window.OB_PAGE);

(function () {
  var C = window.OB_CONFIG;
  var KEYS = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id','fbclid','gclid','wbraid','gbraid'];

  function store(k, v, persistent) {
    try { (persistent ? localStorage : sessionStorage).setItem(k, v); } catch (e) {}
  }
  function read(k, persistent) {
    try { return (persistent ? localStorage : sessionStorage).getItem(k); } catch (e) { return null; }
  }
  function cookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  /* ---------- Captura de origem (UTMs, click IDs) ---------- */
  var params = new URLSearchParams(location.search);
  var current = {};
  KEYS.forEach(function (k) { var v = params.get(k); if (v) current[k] = v.slice(0, 200); });
  var hasNew = Object.keys(current).length > 0;
  if (hasNew) {
    store('ob_last_touch', JSON.stringify(Object.assign({ ts: Date.now(), landing: location.pathname }, current)));
    if (!read('ob_first_touch', true)) store('ob_first_touch', JSON.stringify(Object.assign({ ts: Date.now() }, current)), true);
  }
  if (!read('ob_referrer') && document.referrer) store('ob_referrer', document.referrer.slice(0, 300));

  window.OB_origin = function () {
    var last = {}, first = {};
    try { last = JSON.parse(read('ob_last_touch') || '{}'); } catch (e) {}
    try { first = JSON.parse(read('ob_first_touch', true) || '{}'); } catch (e) {}
    var fbc = cookie('_fbc');
    if (!fbc && last.fbclid) fbc = 'fb.1.' + (last.ts || Date.now()) + '.' + last.fbclid;
    return {
      area: C.area, produto: C.produto, lp: C.lpId,
      page: location.origin + location.pathname,
      referrer: read('ob_referrer') || '',
      utm: last, first_touch: first,
      fbp: cookie('_fbp'), fbc: fbc || '',
      user_agent: navigator.userAgent
    };
  };

  window.OB_eventId = function (prefix) {
    return (prefix || 'ev') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  };

  /* ---------- Meta Pixel ---------- */
  var base = { content_category: C.area, content_name: C.produto, lp: C.lpId };
  window.OB_track = function (event, data, custom, eventID) {
    if (!window.fbq) return;
    var payload = Object.assign({}, base, data || {});
    var opts = eventID ? { eventID: eventID } : undefined;
    custom ? fbq('trackCustom', event, payload, opts) : fbq('track', event, payload, opts);
  };

  if (C.metaPixelId) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', C.metaPixelId);
    fbq('track', 'PageView', base);
  }

  /* ---------- Envio do lead para o CRM (futuro) ---------- */
  window.OB_sendLead = function (lead) {
    if (!C.leadWebhookUrl) return;
    var body = JSON.stringify(lead);
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(C.leadWebhookUrl, new Blob([body], { type: 'application/json' }));
      } else {
        fetch(C.leadWebhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
      }
    } catch (e) {}
  };

  /* ---------- Supabase: visitas e leads (painel /dashboard) ---------- */
  function sbInsert(table, row) {
    if (!C.supabaseUrl || !C.supabaseAnonKey) return Promise.resolve();
    return fetch(C.supabaseUrl + '/rest/v1/' + table, {
      method: 'POST', keepalive: true,
      headers: { apikey: C.supabaseAnonKey, Authorization: 'Bearer ' + C.supabaseAnonKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row)
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); });
  }
  window.OB_origemTexto = function () {
    var u = {}; try { u = JSON.parse(read('ob_last_touch') || '{}'); } catch (e) {}
    if (u.utm_source || u.utm_medium || u.utm_campaign) return [u.utm_source, u.utm_medium, u.utm_campaign].filter(Boolean).join(' / ');
    if (u.gclid) return 'google / cpc';
    if (u.fbclid) return 'facebook / social';
    var r = read('ob_referrer'); try { return r ? new URL(r).hostname : 'direto'; } catch (e) { return 'direto'; }
  };
  window.OB_saveLead = function (nome, whatsapp) {
    return sbInsert('lp_leads', { site: C.site, nome: nome, whatsapp: whatsapp, origem: window.OB_origemTexto(), servico: C.produto });
  };
  if (!window.OB_NO_VISIT) {
    sbInsert('lp_visits', { site: C.site, path: location.pathname + location.search, referrer: document.referrer || null }).catch(function () {});
  }

  window.OB_whatsUrl = function () {
    return 'https://wa.me/' + C.whatsappNumber + '?text=' + encodeURIComponent(C.whatsappMessage);
  };
})();
