# LP Oliveira & Barbosa Advogados — Superendividamento

Landing page estática (HTML/CSS/JS, sem build) — ADS BR.

- `index.html` — LP Superendividamento / Direito Bancário (site `oliveira-barbosa-bancario`)
- `redirect.html` — obrigado → WhatsApp (abre em ~3 s com mensagem de superendividamento)
- `salario-maternidade.html` — LP Salário-maternidade / Previdenciário em `/salario-maternidade` (site `oliveira-barbosa-maternidade`)
- `redirect-salario-maternidade.html` — obrigado → WhatsApp (mensagem de salário-maternidade)
- `dashboard.html` — painel de leads das duas LPs (login Supabase, usuário `admin`)
- `politica-de-privacidade.html`
- `assets/lp.js` — configuração (WhatsApp, Pixel, Supabase) + UTMs, eventos e registro de visitas/leads; cada página pode sobrescrever com `window.OB_PAGE`
- `vercel.json` — cleanUrls (/redirect, /dashboard), cache e noindex

Supabase: projeto ADS BR CLIENTES (tabelas `lp_visits`, `lp_leads`, acesso via `lp_acessos`).
Deploy: Vercel — projeto `lp-oliveira-barbosa` (prj_5hlgEHIGPWnzDHAa6c8lZmTcApnQ, time ADS BR), produção a cada push na `main`.
URL: https://lp-oliveira-barbosa.vercel.app (LP) · /redirect · /dashboard (leads)
# LP Superendividamento — Oliveira e Barbosa Advogados

HTML/CSS/JS puro, sem build. Sobe direto no Vercel (vercel.json com cleanUrls → /redirect e /politica-de-privacidade).

## Configurar antes de publicar — assets/lp.js
- whatsappNumber: hoje = número público do site (5584999843753). Trocar pelo WhatsApp do bancário quando definido.
- metaPixelId: ID do Pixel/Dataset. Vazio = pixel desligado.
- leadWebhookUrl: endpoint futuro do CRM / agente de IA (POST JSON). Vazio = não envia.

## Fluxo
CTAs → #contato (nome + WhatsApp) → evento Lead (com event_id para deduplicar com CAPI) → redirect.html (3 s, evento Contact) → wa.me com mensagem de superendividamento.

## Rastreamento
- Eventos: PageView, Lead, Contact, CTAClick, InicioFormulario, QuizInteracao, FAQAberta (custom).
- Todos levam content_category=bancario, content_name=superendividamento e lp=lp-bancario-superendividamento. Assim você cria conversões personalizadas do bancário separadas do previdenciário.
- UTMs, fbclid e gclid ficam salvos (last touch na sessão, first touch no localStorage) e vão no payload do webhook com fbp/fbc.

## Logos
Logos oficiais enviados pelo escritório, recortados e otimizados:
- assets/logo-cor.webp (horizontal colorido — header com fundo branco e política de privacidade)
- assets/logo-branco.webp (horizontal branco — header sobre o hero, rodapé, seção do escritório, /redirect)
- assets/monograma-branco.webp (marca d'água da chamada final) · assets/favicon.png

## Fotos
Fotos do Freepik baixadas pela conta Magnific da agência (versões licenciadas, sem marca d'água):
hero 12652329 · rotina 11162373 · aposentado 353430881 · assalariado 36291412 ·
mat-hero 11622224 · mat-trabalho 25630321 · mat-casa 11554333 · mat-docs 11193306.
