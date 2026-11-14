// =====================================================================
//  Cercle Cadeaux — application (JavaScript, sans compilation)
// =====================================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
const $app = document.getElementById('app');

// ---------------------------------------------------------------------
// Thèmes par occasion
// ---------------------------------------------------------------------
const LIGHT = { surface: '#FFFFFF', ink: '#1E1B18', muted: '#655E57', border: '#E5DED4', inputBorder: '#B9AE9F', danger: '#B3261E' };
const THEMES = {
  noel:      { ...LIGHT, label: 'Noël', sub: 'Le 25 décembre', icon: 'snow', motifs: ['star', 'snow'], ground: '#F7F3EC', hero: '#1E4434', heroInk: '#F7F3EC', motif: '#D9C38A', accent: '#A3242B', accentInk: '#FFFFFF', accentText: '#A3242B', soft: '#F5E5E1', softMuted: '#6B4A45', tint: '#F5E5E1' },
  stnicolas: { ...LIGHT, label: 'Saint-Nicolas', sub: 'Le 6 décembre', icon: 'mitre', motifs: ['mitre', 'star'], ground: '#FAF5EC', hero: '#5A2A1B', heroInk: '#FBF4E8', motif: '#E0B457', accent: '#8C1D2B', accentInk: '#FFFFFF', accentText: '#8C1D2B', soft: '#F4E6DA', softMuted: '#6A4A3A', tint: '#F4E6DA' },
  anniv:     { ...LIGHT, label: 'Anniversaire', sub: 'Une date à fêter', icon: 'balloon', motifs: ['balloon', 'sparkle'], ground: '#F8F7FC', hero: '#3E2C8F', heroInk: '#FFFFFF', motif: '#F4A259', accent: '#5135C6', accentInk: '#FFFFFF', accentText: '#5135C6', soft: '#ECE8FB', softMuted: '#514A6E', tint: '#ECE8FB' },
  paques:    { ...LIGHT, label: 'Pâques', sub: 'Printemps en famille', icon: 'egg', motifs: ['egg', 'flower'], ground: '#F6F8F0', hero: '#2F6B47', heroInk: '#FBFAF2', motif: '#F2D16B', accent: '#2F6B47', accentInk: '#FFFFFF', accentText: '#2A603F', soft: '#E4EFE3', softMuted: '#45594A', tint: '#E4EFE3' },
  halloween: { label: 'Halloween', sub: 'Le 31 octobre', icon: 'pumpkin', motifs: ['pumpkin', 'moon'], surface: '#231F2A', ink: '#F2EDE6', muted: '#B3AAB9', border: '#3A3342', inputBorder: '#5E5568', danger: '#FF8A80', ground: '#18151D', hero: '#2B1F36', heroInk: '#F6E9DA', motif: '#F08A3C', accent: '#F08A3C', accentInk: '#1A1410', accentText: '#F5A066', soft: '#33262A', softMuted: '#C9B9AE', tint: '#FBE7D8', onLight: '#B4531A' },
  fetes:     { ...LIGHT, label: 'Fête des mères et des pères', sub: 'Mères et pères', icon: 'heart', motifs: ['heart', 'sparkle'], ground: '#FBF6F7', hero: '#7E3452', heroInk: '#FDF3F6', motif: '#F3C1CF', accent: '#A3406A', accentInk: '#FFFFFF', accentText: '#963A61', soft: '#F6E3EA', softMuted: '#6A4A57', tint: '#F6E3EA' },
  autre:     { ...LIGHT, label: 'Autre occasion', sub: 'Mariage, naissance…', icon: 'gift', motifs: ['gift', 'sparkle'], ground: '#F5F7FA', hero: '#1F3B5C', heroInk: '#F5F7FA', motif: '#A9C6E8', accent: '#24578A', accentInk: '#FFFFFF', accentText: '#24578A', soft: '#E3ECF6', softMuted: '#46566A', tint: '#E3ECF6' }
};
const APP = { ...LIGHT, motifs: ['gift', 'sparkle'], ground: '#F6F3EE', hero: '#1E4434', heroInk: '#F7F3EC', motif: '#D9C38A', accent: '#1E1B18', accentInk: '#FFFFFF', accentText: '#1E1B18', soft: '#EDE7DE', softMuted: '#5E574F' };
const ORDER = ['noel', 'stnicolas', 'anniv', 'paques', 'halloween', 'fetes', 'autre'];
const WHO = { moi: 'Membre', enfant: 'Enfant', adulte: 'Adulte', autre: 'Proche' };
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const ICONS = {
  star: 'M12 2.5l2.8 6.2 6.7.7-5 4.5 1.4 6.6L12 17.2l-5.9 3.3 1.4-6.6-5-4.5 6.7-.7z',
  snow: 'M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 3.5l3 2 3-2M9 20.5l3-2 3 2',
  mitre: 'M6.5 21h11l-1-8.5C16.5 8 14.5 5 12 3 9.5 5 7.5 8 7.5 12.5zM12 8.5v8M9 12h6',
  balloon: 'M12 3a6 6 0 0 0-6 6c0 4 2.7 7 6 7s6-3 6-7a6 6 0 0 0-6-6zM11 16h2l-1 1.5zM12 17.5c-1 1.5 1 2.5 0 4',
  sparkle: 'M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z',
  egg: 'M12 3c-3.3 0-6 5.2-6 10a6 6 0 0 0 12 0c0-4.8-2.7-10-6-10zM6.4 12.5l2.3-1.8 2.2 1.8 2.2-1.8 2.2 1.8 2.3-1.8',
  flower: 'M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM12 9V4M12 15v5M9 12H4M15 12h5',
  moon: 'M19.5 14.5A8 8 0 1 1 9.5 4.5a6.3 6.3 0 0 0 10 10z',
  pumpkin: 'M12 7.5c-4.8 0-8 2.9-8 6.5s3.2 6 8 6 8-2.4 8-6-3.2-6.5-8-6.5zM12 7.5c-1.8 0-3 2.9-3 6.3S10.2 20 12 20M12 7.5c1.8 0 3 2.9 3 6.3S13.8 20 12 20M12 7.5V4.5l2-1',
  heart: 'M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z',
  gift: 'M3.5 8.5h17v4h-17zM5 12.5V21h14v-8.5M12 8.5V21M12 8.5C10.5 5 7 4.5 7 6.6S9.5 8.5 12 8.5c2.5 0 5 .2 5-1.9S13.5 5 12 8.5',
  back: 'M15 18l-6-6 6-6',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  ext: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  link: 'M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2',
  close: 'M6 6l12 12M18 6L6 18',
  share: 'M12 3v12M7.5 7.5L12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7',
  idea: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
  home: 'M3.5 10.5L12 4l8.5 6.5V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z'
};
const POS = [
  { x: 52, y: 10, s: 26, r: -12, o: .55 }, { x: 60, y: 58, s: 18, r: 18, o: .4 },
  { x: 67, y: 20, s: 14, r: 0, o: .35 }, { x: 72, y: 62, s: 30, r: -22, o: .5 },
  { x: 79, y: 8, s: 20, r: 12, o: .45 }, { x: 84, y: 44, s: 16, r: -6, o: .35 },
  { x: 89, y: 12, s: 32, r: 16, o: .55 }, { x: 93, y: 64, s: 20, r: -18, o: .45 },
  { x: 45, y: 70, s: 12, r: 0, o: .3 }, { x: 38, y: 14, s: 12, r: 20, o: .25 },
  { x: 97, y: 38, s: 12, r: 0, o: .3 }, { x: 64, y: 84, s: 12, r: 8, o: .3 }
];

// ---------------------------------------------------------------------
// Petits outils
// ---------------------------------------------------------------------
const S = {
  session: null, profile: null, renderId: 0, lastHash: null,
  loginMode: 'login', loginEmail: '', resetSent: false, recovery: false, pendingCode: localStorage.getItem('cc_code') || '',
  draft: null, page: {}, filter: 'tous', filterFor: null, ideasPerson: null,
  preview: null, live: null, liveTimer: null, openInvite: false
};
const me = () => S.session?.user?.id;
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const normCode = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

function icon(name, size = 20, sw = 1.8) {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[name] || ICONS.gift}"/></svg>`;
}
function motifs(th, scale = 1) {
  return `<div class="motifs" aria-hidden="true" style="color:${th.motif}">${POS.map((p, i) => {
    const s = Math.round(p.s * scale);
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="left:${p.x}%;top:${p.y}%;transform:rotate(${p.r}deg);opacity:${p.o}"><path d="${ICONS[th.motifs[i % 2]]}"/></svg>`;
  }).join('')}</div>`;
}
function applyTheme(th, heroColor = false) {
  const map = { ground: '--ground', surface: '--surface', ink: '--ink', muted: '--muted', border: '--border', inputBorder: '--input-border', hero: '--hero', heroInk: '--hero-ink', motif: '--motif', accent: '--accent', accentInk: '--accent-ink', accentText: '--accent-text', soft: '--soft', softMuted: '--soft-muted', danger: '--danger' };
  const st = document.documentElement.style;
  for (const k in map) st.setProperty(map[k], th[k]);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', heroColor ? th.hero : th.surface);
}
function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/);
  return ((parts[0]?.[0] || '?') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase();
}
function siteOf(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } }
function safeUrl(u) { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch { return ''; } }
function whenText(iso) {
  if (!iso) return 'Date à définir';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((date - today) / 86400000);
  const label = `${d} ${MONTHS[m - 1]} ${y}`;
  if (days < 0) return label;
  if (days === 0) return `${label} · c’est aujourd’hui !`;
  return `${label} · dans ${plural(days, 'jour')}`;
}
function purchaseOf(g) { const p = g.purchases; return Array.isArray(p) ? (p[0] || null) : (p || null); }
function img(url) { return url ? `<img src="${esc(url)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ''; }
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2800);
}
function showError(form, msg) { const e = form.querySelector('.error'); if (e) { e.textContent = msg; e.hidden = false; } }
function busy(form, on) { form.querySelectorAll('button').forEach((b) => { b.disabled = on; }); }
function confirmTap(el, label) {
  if (el.dataset.armed) return true;
  el.dataset.armed = '1';
  const old = el.innerHTML; el.textContent = label;
  setTimeout(() => { if (el.isConnected) { delete el.dataset.armed; el.innerHTML = old; } }, 4000);
  return false;
}
function openSheet(html) {
  closeSheet();
  const el = document.createElement('div');
  el.className = 'sheet-backdrop'; el.id = 'sheet';
  el.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  el.addEventListener('click', (e) => { if (e.target === el) closeSheet(); });
  document.body.appendChild(el);
}
function closeSheet() { document.getElementById('sheet')?.remove(); }
function sheetHead(title, sub = '') {
  return `<div class="sheet-head"><div><h2 class="h2">${title}</h2>${sub ? `<p class="hint" style="margin-top:4px;font-size:15px">${sub}</p>` : ''}</div><button class="icon-btn" data-action="close-sheet" aria-label="Fermer">${icon('close', 18, 2)}</button></div>`;
}
function joinLink(code) { return `${location.origin}${location.pathname}#/rejoindre/${code}`; }

// ---------------------------------------------------------------------
// Structure commune des pages
// ---------------------------------------------------------------------
function shell(content, opts = {}) {
  const same = S.lastHash === location.hash;
  const y = window.scrollY;
  $app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#/"><span class="brand-mark">${icon('gift', 20)}</span><span>Cercle Cadeaux</span></a>
      <button class="avatar" data-action="account" aria-label="Mon compte">${esc(initials(S.profile?.display_name))}</button>
    </header>
    ${opts.hero || ''}
    ${content}
    <nav class="tabbar" aria-label="Navigation principale"><div class="tabbar-inner">
      <a href="#/" class="${opts.tab === 'home' ? 'on' : ''}">${icon('home', 22)}<span>Cercles</span></a>
      <a href="#/idees" class="${opts.tab === 'idees' ? 'on' : ''}">${icon('idea', 22)}<span>Mes idées</span></a>
    </div></nav>`;
  window.scrollTo(0, same ? y : 0);
  S.lastHash = location.hash;
}
function parseRoute() {
  const h = location.hash.replace(/^#\/?/, '');
  const [name, id] = h.split('/');
  return { name: name || 'home', id: id ? decodeURIComponent(id) : null };
}

// ---------------------------------------------------------------------
// Rendu principal
// ---------------------------------------------------------------------
async function render() {
  const rid = ++S.renderId;
  const r = parseRoute();
  if (r.name === 'rejoindre' && r.id) {
    S.pendingCode = normCode(r.id);
    localStorage.setItem('cc_code', S.pendingCode);
    location.replace('#/');
    return;
  }
  if (!S.session) return renderLogin();
  if (S.recovery) return renderNewPassword();
  startLive();
  if (!S.profile) {
    const { data } = await sb.from('profiles').select('id, display_name').eq('id', me()).maybeSingle();
    if (rid !== S.renderId) return;
    S.profile = data || { id: me(), display_name: '' };
  }
  if (!S.session.user.user_metadata?.name_set) return renderName();
  if (S.lastHash !== location.hash) {
    shell('<div class="loading">Chargement…</div>', { tab: r.name === 'idees' ? 'idees' : 'home' });
  }
  try {
    if (r.name === 'creer') return pageCreate();
    if (r.name === 'cercle' && r.id) return await pageCircle(r.id, rid);
    if (r.name === 'liste' && r.id) return await pageList(r.id, rid);
    if (r.name === 'idees') return await pageIdeas(rid);
    return await pageHome(rid);
  } catch (err) {
    console.error(err);
    if (rid !== S.renderId) return;
    shell(`<main class="page"><div class="empty">Oups, un problème est survenu.<br><button class="btn-ghost" style="margin-top:12px" data-action="reload">Réessayer</button></div></main>`, { tab: 'home' });
  }
}

// ---------------------------------------------------------------------
// Connexion : e-mail + mot de passe
// ---------------------------------------------------------------------
function renderLogin() {
  applyTheme(APP, true);
  S.lastHash = null;
  const mode = S.loginMode || 'login';
  const invite = S.pendingCode ? `<div class="card soft"><p class="small" style="margin:0">Vous avez été invité à rejoindre le cercle <strong>${esc(S.pendingCode)}</strong>. Connectez-vous ou créez votre compte pour continuer.</p></div>` : '';
  const tabs = mode === 'reset' ? '' : `<div class="tabs">
      <button class="tab" data-action="login-mode" data-k="login" aria-pressed="${mode === 'login'}">Se connecter</button>
      <button class="tab" data-action="login-mode" data-k="signup" aria-pressed="${mode === 'signup'}">Créer un compte</button></div>`;
  const email = `<div class="field"><label for="email">Adresse e-mail</label>
      <input id="email" name="email" type="email" class="input" autocomplete="email" inputmode="email" required value="${esc(S.loginEmail)}"></div>`;
  let form;
  if (mode === 'signup') {
    form = `<form data-form="signup" class="stack" novalidate>
      <div class="field"><label for="su-name">Prénom</label>
      <input id="su-name" name="name" class="input" maxlength="40" autocomplete="given-name" required></div>
      ${email}
      <div class="field"><label for="pw">Mot de passe</label>
      <input id="pw" name="password" type="password" class="input" autocomplete="new-password" minlength="8" required>
      <p class="hint">Au moins 8 caractères.</p></div>
      <p class="error" hidden></p>
      <button class="btn full">Créer mon compte</button></form>`;
  } else if (mode === 'reset') {
    form = S.resetSent
      ? `<div class="card soft"><p style="margin:0">Si un compte existe pour <strong>${esc(S.loginEmail)}</strong>, un e-mail vient d’être envoyé. Ouvrez le lien qu’il contient pour choisir un nouveau mot de passe.</p></div>
         <button class="link-btn" data-action="login-mode" data-k="login">Retour à la connexion</button>`
      : `<form data-form="reset" class="stack" novalidate>
        <h2 class="h2">Mot de passe oublié</h2>
        <p class="muted small" style="margin:0">Entrez votre adresse : vous recevrez un lien pour choisir un nouveau mot de passe.</p>
        ${email}<p class="error" hidden></p>
        <button class="btn full">Envoyer le lien</button>
        <button type="button" class="link-btn" data-action="login-mode" data-k="login">Retour à la connexion</button></form>`;
  } else {
    form = `<form data-form="login" class="stack" novalidate>
      ${email}
      <div class="field"><label for="pw">Mot de passe</label>
      <input id="pw" name="password" type="password" class="input" autocomplete="current-password" required></div>
      <p class="error" hidden></p>
      <button class="btn full">Se connecter</button>
      <button type="button" class="link-btn" data-action="login-mode" data-k="reset">Mot de passe oublié ?</button></form>`;
  }
  $app.innerHTML = `
    <div class="login-hero">${motifs(APP, 1.3)}
      <div class="inner"><span class="brand-mark">${icon('gift', 30, 1.6)}</span>
      <h1>Cercle Cadeaux</h1><p>Les listes de souhaits de toute la famille, au même endroit.</p></div>
    </div>
    <main class="page">${invite}${tabs}${form}</main>`;
}

function renderNewPassword() {
  applyTheme(APP);
  S.lastHash = null;
  $app.innerHTML = `
    <main class="page" style="padding-top:48px">
      <h1 class="h1">Nouveau mot de passe</h1>
      <form data-form="new-password" class="stack" novalidate>
        <div class="field"><label for="npw">Nouveau mot de passe</label>
        <input id="npw" name="password" type="password" class="input" autocomplete="new-password" minlength="8" required>
        <p class="hint">Au moins 8 caractères.</p></div>
        <p class="error" hidden></p>
        <button class="btn full">Enregistrer</button>
      </form>
    </main>`;
}

function renderName() {
  applyTheme(APP);
  S.lastHash = null;
  $app.innerHTML = `
    <main class="page" style="padding-top:48px">
      <h1 class="h1">Comment vous appelle-t-on ?</h1>
      <p class="lead">Votre prénom sera visible par les membres de vos cercles.</p>
      <form data-form="name" class="stack">
        <div class="field"><label for="dn">Prénom</label>
        <input id="dn" name="name" class="input" maxlength="40" required autocomplete="given-name" value=""></div>
        <p class="error" hidden></p>
        <button class="btn full">Continuer</button>
      </form>
    </main>`;
}

// ---------------------------------------------------------------------
// Accueil : mes cercles
// ---------------------------------------------------------------------
async function pageHome(rid) {
  const { data, error } = await sb.from('circle_members')
    .select('role, circles(id, name, occasion, event_date)').eq('user_id', me());
  if (rid !== S.renderId) return;
  if (error) throw error;
  applyTheme(APP);
  const circles = (data || []).filter((r) => r.circles)
    .map((r) => ({ ...r.circles, role: r.role }))
    .sort((a, b) => (a.event_date || '9999').localeCompare(b.event_date || '9999'));
  const cards = circles.map((c) => {
    const th = THEMES[c.occasion] || THEMES.autre;
    return `<a class="circle-card" href="#/cercle/${c.id}">
      <span class="circle-card-hero" style="background:${th.hero}">${motifs(th)}<span class="chip-hero" style="color:${th.heroInk}">${esc(th.label)}</span></span>
      <span class="circle-card-body">
        <span class="serif circle-card-title">${esc(c.name)}</span>
        <span class="muted small">${esc(whenText(c.event_date))}</span>
        <span class="badge">${c.role === 'admin' ? 'Administrateur' : 'Membre'}</span>
      </span></a>`;
  }).join('');
  const first = (S.profile?.display_name || '').split(' ')[0];
  shell(`<main class="page">
    <div class="stack-sm">
      <p class="eyebrow">Bonjour ${esc(first)}</p>
      <h1 class="h1">Mes cercles</h1>
      <p class="lead">${circles.length ? 'Retrouvez vos listes de souhaits partagées.' : 'Créez votre premier cercle, ou rejoignez-en un avec le code reçu.'}</p>
    </div>
    ${S.pendingCode ? joinCard() : ''}
    <div class="stack">${cards}
      <a class="create-card" href="#/creer"><span class="plus">${icon('plus', 26, 2)}</span>
      <span class="serif" style="font-size:21px">Créer un cercle</span>
      <span class="muted small">Noël, Saint-Nicolas, anniversaire, Pâques…</span></a>
    </div>
    ${S.pendingCode ? '' : joinCard()}
  </main>`, { tab: 'home' });
}
function joinCard() {
  return `<section class="card">
    <h2 class="h2">Rejoindre un cercle</h2>
    <p class="muted small" style="margin:0">${S.pendingCode ? 'Vous avez reçu une invitation : appuyez sur « Rejoindre ».' : 'Entrez le code que le créateur du cercle vous a transmis.'}</p>
    <form data-form="join" class="stack-sm" novalidate>
      <label for="join-code">Code du cercle</label>
      <div class="row"><input id="join-code" name="code" class="input code" autocomplete="off" autocapitalize="characters" maxlength="12" placeholder="Ex. NOEL2026" value="${esc(S.pendingCode)}"><button class="btn">Rejoindre</button></div>
      <p class="error" hidden></p>
    </form></section>`;
}

// ---------------------------------------------------------------------
// Créer un cercle
// ---------------------------------------------------------------------
function suggestCode(name) { return ((normCode(name).slice(0, 8) || 'CERCLE') + new Date().getFullYear()).slice(0, 12); }
function codeHelp(d) {
  const c = normCode(d.code);
  if (c && c.length < 4) return 'Au moins 4 caractères.';
  if (!c) return `Laissez vide pour utiliser ${suggestCode(d.name)}, ou choisissez le vôtre.`;
  return 'Lettres et chiffres, 4 à 12 caractères. Vous le transmettrez aux membres.';
}
function createPreview(d) {
  const th = THEMES[d.occasion];
  return `<div class="create-preview" style="background:${th.ground};color:${th.ink}">
    <div class="cp-hero" style="background:${th.hero};color:${th.heroInk}">${motifs(th)}
      <div class="cp-text"><span class="chip-hero">${esc(th.label)}</span><span class="serif cp-title">${esc(d.name.trim() || 'Votre cercle')}</span></div>
    </div>
    <div class="cp-body"><span class="cp-btn" style="background:${th.accent};color:${th.accentInk}">${icon('check', 18, 2.2)} Je l’achète</span></div>
  </div>`;
}
function pageCreate() {
  applyTheme(APP);
  const d = S.draft || (S.draft = { name: '', occasion: 'noel', date: '', code: '', see: true });
  const th = THEMES[d.occasion];
  const occ = ORDER.map((k) => {
    const t = THEMES[k];
    return `<button type="button" class="occ" data-action="pick-occasion" data-k="${k}" aria-pressed="${d.occasion === k}" style="--sel-border:${t.onLight || t.accent};--sel-bg:${t.tint}">
      <span class="occ-icon" style="background:${t.hero};color:${t.motif}">${icon(t.icon, 22, 1.7)}</span>
      <span><span class="strong block" style="font-size:15px">${t.label}</span><span class="hint block">${t.sub}</span></span></button>`;
  }).join('');
  shell(`<main class="page">
    <a class="back-link" href="#/">${icon('back', 18, 2)} Mes cercles</a>
    <div class="stack-sm"><h1 class="h1">Créer un cercle</h1>
    <p class="lead">Choisissez l’occasion : les couleurs et le décor s’adaptent automatiquement.</p></div>
    <div id="create-preview">${createPreview(d)}</div>
    <form data-form="create" class="stack" novalidate>
      <div class="field"><label for="c-name">Nom du cercle</label>
        <input id="c-name" name="name" class="input" maxlength="80" placeholder="Ex. Noël en famille" value="${esc(d.name)}"></div>
      <fieldset class="fieldset"><legend>Quelle est l’occasion ?</legend><div class="occasions">${occ}</div></fieldset>
      <div class="field"><label for="c-date">Date de l’événement</label>
        <input id="c-date" name="date" type="date" class="input" value="${esc(d.date)}"></div>
      <div class="field"><label for="c-code">Code pour rejoindre</label>
        <input id="c-code" name="code" class="input code" maxlength="12" autocomplete="off" autocapitalize="characters" placeholder="${suggestCode(d.name)}" value="${esc(d.code)}">
        <p class="hint" id="code-help">${codeHelp(d)}</p></div>
      <label class="check card"><input type="checkbox" name="see" ${d.see ? 'checked' : ''}>
        <span><span class="strong block">Chacun voit les cadeaux achetés sur sa propre liste</span>
        <span class="hint block">Pratique pour les parents qui gèrent les listes des enfants. Décochez pour garder la surprise.</span></span></label>
      <p class="error" hidden></p>
      <button class="btn full" style="background:${th.onLight || th.accent};color:#FFFFFF">Créer le cercle</button>
    </form>
  </main>`, { tab: 'home' });
}

// ---------------------------------------------------------------------
// Un cercle
// ---------------------------------------------------------------------
async function pageCircle(id, rid) {
  const [c, m, l] = await Promise.all([
    sb.from('circles').select('*').eq('id', id).maybeSingle(),
    sb.from('circle_members').select('user_id, role, profiles(display_name)').eq('circle_id', id),
    sb.from('lists').select('id, owner_user_id, managed_by, person_id, person_name, person_type, info, gifts(id, purchases(gift_id))').eq('circle_id', id).order('created_at')
  ]);
  if (rid !== S.renderId) return;
  if (c.error || m.error || l.error) throw (c.error || m.error || l.error);
  if (!c.data) { applyTheme(APP); return shell(`<main class="page"><div class="empty">Ce cercle n’existe pas ou vous n’en faites pas partie.<br><a class="btn-ghost" style="margin-top:12px" href="#/">Retour à mes cercles</a></div></main>`, { tab: 'home' }); }

  const circle = c.data;
  const th = THEMES[circle.occasion] || THEMES.autre;
  applyTheme(th, true);
  const members = m.data || [];
  const names = new Map(members.map((x) => [x.user_id, x.profiles?.display_name || 'Membre']));
  const isAdmin = members.some((x) => x.user_id === me() && x.role === 'admin');
  const listName = (x) => (x.owner_user_id ? (names.get(x.owner_user_id) || 'Membre') : (x.person_name || 'Sans nom'));
  const rank = (x) => (x.owner_user_id === me() ? 0 : (!x.owner_user_id && x.managed_by === me()) ? 1 : 2);
  const lists = (l.data || []).sort((a, b) => rank(a) - rank(b) || listName(a).localeCompare(listName(b), 'fr'));
  S.page = { circle, isAdmin, lists, names };

  const cards = lists.map((x) => {
    const mine = x.owner_user_id === me();
    const gifts = x.gifts || [];
    const hide = mine && !circle.owners_see_purchases;
    const n = gifts.length;
    const b = hide ? 0 : gifts.filter((g) => purchaseOf(g)).length;
    let tag = 'Membre';
    if (mine) tag = 'Votre liste';
    else if (!x.owner_user_id) tag = `${WHO[x.person_type] || 'Proche'} · liste gérée par ${x.managed_by === me() ? 'vous' : esc(names.get(x.managed_by) || 'un membre')}`;
    else if (members.some((mm) => mm.user_id === x.owner_user_id && mm.role === 'admin')) tag = 'Administrateur';
    const count = n ? `${plural(n, 'idée')}${hide ? '' : ` · ${b} achetée${b > 1 ? 's' : ''}`}` : 'Aucune idée pour l’instant';
    return `<a class="list-card" href="#/liste/${x.id}">
      <span class="person"><span class="pav">${esc(initials(listName(x)))}</span>
        <span><span class="person-name">${mine ? 'Ma liste' : `Liste de ${esc(listName(x))}`}</span><span class="muted small">${tag}</span></span></span>
      <span class="progress"><span style="width:${n && !hide ? Math.round(b / n * 100) : 0}%"></span></span>
      <span class="list-card-foot"><span>${count}</span><span class="strong accent-text">Voir →</span></span>
    </a>`;
  }).join('');

  const avatars = members.slice(0, 5).map((x) => `<span title="${esc(x.profiles?.display_name || '')}">${esc(initials(x.profiles?.display_name))}</span>`).join('');
  const memberItems = members
    .sort((a, b) => (a.role === 'admin' ? -1 : 0) - (b.role === 'admin' ? -1 : 0))
    .map((x) => `<li><span class="pav">${esc(initials(x.profiles?.display_name))}</span><span><span class="strong block">${esc(x.profiles?.display_name || 'Membre')}${x.user_id === me() ? ' (vous)' : ''}</span><span class="hint">${x.role === 'admin' ? 'Administrateur' : 'Membre'}</span></span></li>`).join('');

  const hero = `<section class="hero">${motifs(th, 1.15)}
    <div class="hero-inner">
      <a class="back" href="#/">${icon('back', 18, 2)} Mes cercles</a>
      <span class="chip-hero">${esc(th.label)}</span>
      <h1 class="hero-title">${esc(circle.name)}</h1>
      <p class="hero-sub">${esc(whenText(circle.event_date))}</p>
      <div class="hero-actions"><span class="avatars">${avatars}</span>
        <button class="btn-hero" data-action="invite">${icon('plus', 18, 2)} Inviter</button></div>
    </div></section>`;

  shell(`<main class="page">
    <div class="row between"><h2 class="h2">Les listes de souhaits</h2>
      <button class="btn-ghost sm" data-action="add-list">${icon('plus', 18, 2)} Ajouter une liste</button></div>
    <div class="stack">${cards || '<div class="empty">Aucune liste pour l’instant.</div>'}</div>

    <section class="card"><h2 class="h3">Membres · ${members.length}</h2><ul class="members">${memberItems}</ul>
      <div class="stack-sm" style="border-top:1px solid var(--border);padding-top:14px;margin-top:4px">
        <span class="hint strong">Code du cercle</span><span class="code-big">${esc(circle.join_code)}</span>
        <button class="btn-ghost full" data-action="invite">${icon('share', 18)} Partager le code</button></div>
    </section>

    <section class="card soft"><h2 class="h3">Bon à savoir</h2>
      <p class="small" style="margin:0">Quand vous achetez un cadeau, appuyez sur « Je l’achète » : les autres membres le voient tout de suite et évitent les doublons.</p>
      <p class="hint">${circle.owners_see_purchases ? 'Dans ce cercle, chacun voit aussi ce qui a été acheté sur sa propre liste.' : 'Dans ce cercle, les achats restent une surprise pour le propriétaire de la liste.'}</p>
    </section>

    ${isAdmin ? `<section class="card"><h2 class="h3">Réglages du cercle</h2>
      <label class="check"><input type="checkbox" data-change="toggle-see" ${circle.owners_see_purchases ? 'checked' : ''}>
        <span><span class="strong block">Chacun voit les achats sur sa propre liste</span><span class="hint block">Décochez pour garder la surprise.</span></span></label>
      <button class="link-btn danger" data-action="delete-circle">Supprimer le cercle</button></section>`
    : `<button class="link-btn danger" data-action="leave-circle">Quitter le cercle</button>`}
  </main>`, { tab: 'home', hero });

  if (S.openInvite) { S.openInvite = false; openInvite(); }
}

function openInvite() {
  const { circle, isAdmin } = S.page;
  if (!circle) return;
  openSheet(`${sheetHead('Inviter des membres', 'Partagez le code : chacun l’entre sur l’accueil, dans « Rejoindre un cercle ».')}
    <div class="card soft" style="gap:10px"><span class="hint strong">Code du cercle</span>
      <span class="code-big">${esc(circle.join_code)}</span>
      <div class="row"><button class="btn" data-action="share-code">${icon('share', 18)} Partager</button>
      <button class="btn-ghost" data-action="copy-code">Copier le code</button></div></div>
    ${isAdmin ? `<form data-form="change-code" class="stack-sm" novalidate>
      <label for="new-code">Modifier le code</label>
      <div class="row"><input id="new-code" name="code" class="input code" maxlength="12" autocomplete="off" autocapitalize="characters" value="${esc(circle.join_code)}"><button class="btn-ghost">Enregistrer</button></div>
      <p class="hint">Lettres et chiffres, 4 à 12 caractères. L’ancien code ne fonctionnera plus.</p>
      <p class="error" hidden></p></form>` : ''}`);
}

async function openAddList() {
  const { data: people } = await sb.from('people').select('*').eq('managed_by', me()).order('created_at');
  const used = new Set((S.page.lists || []).map((x) => x.person_id).filter(Boolean));
  const avail = (people || []).filter((p) => !used.has(p.id));
  openSheet(`${sheetHead('Ajouter une liste', 'Pour une personne sans compte : un enfant, un grand-parent… Vous gérerez sa liste et suivrez les achats.')}
    ${avail.length ? `<div class="stack-sm"><span class="label">Une personne que vous gérez déjà</span>
      <div class="chips">${avail.map((p) => `<button class="chip" data-action="add-list-person" data-id="${p.id}">${icon('plus', 16, 2)} ${esc(p.name)}</button>`).join('')}</div>
      <span class="label" style="margin-top:8px">Ou une nouvelle personne</span></div>` : ''}
    ${personForm('add-list', 'Créer la liste')}`);
}
function personForm(formName, submitLabel) {
  return `<form data-form="${formName}" class="stack" novalidate>
    <div class="field"><label for="p-name">Prénom</label><input id="p-name" name="name" class="input" maxlength="60" placeholder="Ex. Emma" required></div>
    <fieldset class="fieldset"><legend>Pour qui est cette liste ?</legend><div class="chips">
      <label class="radio-chip"><input type="radio" name="type" value="enfant" checked><span>Un enfant</span></label>
      <label class="radio-chip"><input type="radio" name="type" value="adulte"><span>Un adulte</span></label>
      <label class="radio-chip"><input type="radio" name="type" value="autre"><span>Autre</span></label>
    </div></fieldset>
    <div class="field"><label for="p-info">Infos utiles (facultatif)</label>
      <input id="p-info" name="info" class="input" maxlength="200" placeholder="Tailles, pointure, goûts…">
      <p class="hint">Visible par les membres des cercles où sa liste est partagée.</p></div>
    <p class="error" hidden></p>
    <button class="btn full">${submitLabel}</button>
  </form>`;
}

// ---------------------------------------------------------------------
// Une liste de souhaits
// ---------------------------------------------------------------------
async function pageList(id, rid) {
  const { data: list, error } = await sb.from('lists').select('*, circles(*)').eq('id', id).maybeSingle();
  if (rid !== S.renderId) return;
  if (error) throw error;
  if (!list || !list.circles) { applyTheme(APP); return shell(`<main class="page"><div class="empty">Cette liste n’existe pas ou n’est pas accessible.<br><a class="btn-ghost" style="margin-top:12px" href="#/">Retour à mes cercles</a></div></main>`, { tab: 'home' }); }
  const circle = list.circles;
  const [g, m] = await Promise.all([
    sb.from('gifts').select('*, purchases(bought_by)').eq('list_id', id).order('created_at', { ascending: false }),
    sb.from('circle_members').select('user_id, profiles(display_name)').eq('circle_id', circle.id)
  ]);
  if (rid !== S.renderId) return;
  if (g.error || m.error) throw (g.error || m.error);

  const th = THEMES[circle.occasion] || THEMES.autre;
  applyTheme(th, true);
  const names = new Map((m.data || []).map((x) => [x.user_id, x.profiles?.display_name || 'un membre']));
  const isMine = list.owner_user_id === me();
  const canEdit = isMine || list.managed_by === me();
  const all = g.data || [];
  S.page = { circle, list, gifts: all, isMine, canEdit };
  if (S.filterFor !== id) { S.filter = 'tous'; S.filterFor = id; S.preview = null; }

  const ownerName = list.owner_user_id ? (names.get(list.owner_user_id) || 'Membre') : (list.person_name || 'Sans nom');
  const title = isMine ? 'Ma liste' : `Liste de ${ownerName}`;
  const bought = (x) => !!purchaseOf(x);
  const counts = { tous: all.length, dispo: all.filter((x) => !bought(x)).length, achete: all.filter(bought).length };
  const hide = isMine && !circle.owners_see_purchases;
  let sub = isMine ? 'Votre liste' : list.owner_user_id ? 'Membre du cercle' : `${WHO[list.person_type] || 'Proche'} · liste gérée par ${list.managed_by === me() ? 'vous' : (names.get(list.managed_by) || 'un membre')}`;
  sub += ` · ${plural(all.length, 'idée')}${hide ? '' : ` · ${counts.achete} achetée${counts.achete > 1 ? 's' : ''}`}`;

  const shown = all.filter((x) => S.filter === 'dispo' ? !bought(x) : S.filter === 'achete' ? bought(x) : true);
  const cards = shown.map((x) => giftCard(x, { isMine, canEdit, names })).join('');
  const tabs = [['tous', 'Tous'], ['dispo', 'Disponibles'], ['achete', 'Achetés']]
    .map(([k, label]) => `<button class="tab" data-action="filter" data-k="${k}" aria-pressed="${S.filter === k}">${label} · ${counts[k]}</button>`).join('');

  const hero = `<section class="hero">${motifs(th, 1.15)}
    <div class="hero-inner">
      <a class="back" href="#/cercle/${circle.id}">${icon('back', 18, 2)} ${esc(circle.name)}</a>
      <div class="hero-person"><span class="pav">${esc(initials(ownerName))}</span>
        <div><h1 class="hero-title" style="font-size:28px">${esc(title)}</h1><p class="hero-sub small">${esc(sub)}</p></div></div>
    </div></section>`;

  const addSection = canEdit ? `<section class="card">
      <h2 class="h2">Ajouter un cadeau</h2>
      <p class="muted small" style="margin:0">Collez le lien de la page du produit : l’image, le titre et le prix s’affichent automatiquement.</p>
      ${addForm('gift')}
      <button class="btn-ghost full" data-action="from-ideas">${icon('idea', 18)} Ajouter depuis mes idées</button>
    </section>` : '';

  let empty = 'Aucun cadeau dans cette catégorie.';
  if (!all.length) empty = canEdit ? 'Cette liste est encore vide. Collez un premier lien ci-dessus.' : 'Pas encore d’idée sur cette liste.';

  shell(`<main class="page">
    ${list.info ? `<section class="card soft" style="gap:4px"><span class="eyebrow" style="color:var(--soft-muted)">Bon à savoir</span><span>${esc(list.info)}</span></section>` : ''}
    ${addSection}
    <div class="stack-sm"><h2 class="h2">Les idées cadeaux</h2><div class="tabs">${tabs}</div></div>
    ${shown.length ? `<div class="stack">${cards}</div>` : `<div class="empty">${empty}</div>`}
  </main>`, { tab: 'home', hero });
}

function giftCard(x, { isMine, canEdit, names }) {
  const p = purchaseOf(x);
  const url = safeUrl(x.url);
  const inner = `
    <span class="gift-img">${icon('gift', 56, 1.3)}${img(x.image_url)}${p ? `<span class="bought-chip">${icon('check', 14, 2.6)} Acheté</span>` : ''}</span>
    <span class="gift-body">
      ${x.site ? `<span class="gift-site">${esc(x.site)} ${url ? icon('ext', 14, 2) : ''}</span>` : ''}
      <span class="gift-title">${esc(x.title)}</span>
      ${x.price ? `<span class="gift-price">${esc(x.price)}</span>` : ''}
      ${x.note ? `<span class="muted small">${esc(x.note)}</span>` : ''}
    </span>`;
  let foot = '';
  if (!p && !isMine) foot = `<button class="btn full" data-action="buy" data-id="${x.id}">${icon('check', 18, 2.2)} Je l’achète</button>`;
  else if (p && p.bought_by === me()) foot = `<div class="row between"><span class="strong accent-text small">Acheté par vous</span><button class="btn-ghost sm" data-action="unbuy" data-id="${x.id}">Annuler</button></div>`;
  else if (p) foot = `<span class="status">Acheté par ${esc(names.get(p.bought_by) || 'un membre')}</span>`;
  else foot = `<span class="status" style="font-weight:600">Pas encore acheté</span>`;
  if (canEdit) foot += `<button class="link-btn danger" data-action="delete-gift" data-id="${x.id}">Retirer de la liste</button>`;
  return `<article class="gift${p ? ' is-bought' : ''}">
    ${url ? `<a class="gift-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${inner}</a>` : `<div class="gift-link">${inner}</div>`}
    <div class="gift-foot">${foot}</div></article>`;
}

// Formulaire « coller un lien » partagé par les listes et « Mes idées »
function addForm(target) {
  return `<form data-form="preview" data-target="${target}" class="stack-sm" novalidate>
      <label for="add-url">Lien du cadeau</label>
      <div class="row"><div class="input-icon">${icon('link', 20)}<input id="add-url" name="url" type="url" inputmode="url" class="input" placeholder="https://…" autocomplete="off"></div>
      <button class="btn">Aperçu</button></div>
      <p class="hint">Pas de lien ? Laissez vide et appuyez sur « Aperçu » pour saisir le cadeau à la main.</p>
      <p class="error" hidden></p>
    </form>
    <div id="preview-slot"></div>`;
}
function previewForm(p, target) {
  const canKeep = target === 'gift' && (S.page.isMine || S.page.list?.person_id);
  return `<form data-form="save-item" data-target="${target}" class="preview" novalidate>
    <div class="preview-img" id="preview-img">${icon('gift', 44, 1.3)}${img(p.image)}</div>
    <label class="btn-ghost sm" style="align-self:flex-start;cursor:pointer">
      <input type="file" accept="image/*" data-change="photo" class="visually-hidden">
      <span id="photo-label">${p.image ? 'Changer la photo' : 'Ajouter une photo'}</span></label>
    ${p.site ? `<p class="hint">${p.found ? `${icon('check', 14, 2.4)} Aperçu récupéré sur ${esc(p.site)}` : `Aperçu indisponible pour ${esc(p.site)} : complétez le titre à la main.`}</p>` : ''}
    <div class="field"><label for="i-title">Titre</label><input id="i-title" name="title" class="input" maxlength="200" required value="${esc(p.title)}"></div>
    <div class="row">
      <div class="field" style="flex:1 1 120px"><label for="i-price">Prix</label><input id="i-price" name="price" class="input" maxlength="30" value="${esc(p.price)}" placeholder="Ex. 25 €"></div>
      <div class="field" style="flex:2 1 180px"><label for="i-note">Précision</label><input id="i-note" name="note" class="input" maxlength="200" placeholder="Taille, couleur…"></div>
    </div>
    ${canKeep ? `<label class="check"><input type="checkbox" name="keep" checked><span class="small">Garder aussi dans mes idées, pour les autres cercles</span></label>` : ''}
    <p class="error" hidden></p>
    <div class="row"><button class="btn" style="flex:1">Ajouter</button><button type="button" class="btn-ghost" data-action="cancel-preview">Annuler</button></div>
  </form>`;
}
async function fetchPreview(url) {
  const base = { url, site: siteOf(url), title: '', image: '', price: '', found: false };
  try {
    const { data, error } = await sb.functions.invoke('link-preview', { body: { url } });
    if (error || !data || data.error) return base;
    return {
      url: safeUrl(data.url) || url, site: data.site || base.site,
      title: data.title || '', image: safeUrl(data.image), price: data.price || '',
      found: !!(data.title || data.image)
    };
  } catch { return base; }
}

async function openFromIdeas() {
  const { list, isMine, gifts } = S.page;
  const pid = isMine ? null : list.person_id;
  if (!isMine && !pid) { toast('Cette liste n’est liée à aucune réserve d’idées.'); return; }
  let q = sb.from('ideas').select('*').eq('owner_user_id', me()).order('created_at', { ascending: false });
  q = pid ? q.eq('person_id', pid) : q.is('person_id', null);
  const { data: ideas, error } = await q;
  if (error) { toast('Impossible de charger vos idées.'); return; }
  S.page.sheetIdeas = ideas || [];
  const already = new Set((gifts || []).map((x) => x.idea_id).filter(Boolean));
  const rows = (ideas || []).map((i) => {
    const done = already.has(i.id);
    return `<label class="pick-row${done ? ' disabled' : ''}">
      <input type="checkbox" name="idea" value="${i.id}" ${done ? 'disabled checked' : ''}>
      <span class="thumb">${icon('gift', 24, 1.5)}${img(i.image_url)}</span>
      <span class="idea-main"><span class="idea-title">${esc(i.title)}</span>
      <span class="hint">${done ? 'Déjà dans la liste' : esc([i.site, i.price].filter(Boolean).join(' · '))}</span></span></label>`;
  }).join('');
  const who = isMine ? 'vos idées' : `les idées pour ${esc(list.person_name)}`;
  openSheet(`${sheetHead('Ajouter depuis mes idées', `Cochez ${who} à ajouter à cette liste.`)}
    ${rows ? `<form data-form="add-from-ideas" class="stack-sm">${rows}<p class="error" hidden></p><button class="btn full" style="margin-top:8px">Ajouter à la liste</button></form>`
      : `<div class="empty">Aucune idée en réserve pour l’instant.<br><a class="btn-ghost" style="margin-top:12px" href="#/idees" data-action="close-sheet">Aller dans « Mes idées »</a></div>`}`);
}

// ---------------------------------------------------------------------
// Mes idées (réserve personnelle)
// ---------------------------------------------------------------------
async function pageIdeas(rid) {
  const { data: people, error: pe } = await sb.from('people').select('*').eq('managed_by', me()).order('created_at');
  if (rid !== S.renderId) return;
  if (pe) throw pe;
  if (S.ideasPerson && !(people || []).some((p) => p.id === S.ideasPerson)) S.ideasPerson = null;
  let q = sb.from('ideas').select('*').eq('owner_user_id', me()).order('created_at', { ascending: false });
  q = S.ideasPerson ? q.eq('person_id', S.ideasPerson) : q.is('person_id', null);
  const { data: ideas, error } = await q;
  if (rid !== S.renderId) return;
  if (error) throw error;
  applyTheme(APP);
  S.page = { people: people || [], ideas: ideas || [], isMine: true };
  S.preview = null;
  const person = (people || []).find((p) => p.id === S.ideasPerson);

  const chips = [`<button class="chip" data-action="ideas-for" data-id="" aria-pressed="${!S.ideasPerson}">Pour moi</button>`]
    .concat((people || []).map((p) => `<button class="chip" data-action="ideas-for" data-id="${p.id}" aria-pressed="${S.ideasPerson === p.id}">${esc(p.name)}</button>`))
    .concat([`<button class="chip" data-action="add-person">${icon('plus', 16, 2)} Un proche</button>`]).join('');

  const rows = (ideas || []).map((i) => {
    const url = safeUrl(i.url);
    return `<div class="idea-row">
      <span class="thumb">${icon('gift', 24, 1.5)}${img(i.image_url)}</span>
      <span class="idea-main"><span class="idea-title">${esc(i.title)}</span>
        <span class="hint ellipsis">${esc([i.site, i.price].filter(Boolean).join(' · '))}</span>
        ${i.note ? `<span class="hint">${esc(i.note)}</span>` : ''}</span>
      <span class="idea-actions">
        ${url ? `<a class="icon-btn" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir la page du produit">${icon('ext', 18)}</a>` : ''}
        <button class="link-btn danger" style="padding:4px 0;min-height:36px" data-action="delete-idea" data-id="${i.id}">Retirer</button>
      </span></div>`;
  }).join('');

  shell(`<main class="page">
    <div class="stack-sm"><h1 class="h1">Mes idées</h1>
    <p class="lead">Votre réserve personnelle, visible par vous seul. Notez vos envies toute l’année, puis cochez-les dans vos cercles.</p></div>
    <div class="chips">${chips}</div>
    ${person?.info ? `<section class="card soft" style="gap:4px"><span class="eyebrow" style="color:var(--soft-muted)">Bon à savoir sur ${esc(person.name)}</span><span>${esc(person.info)}</span></section>` : ''}
    <section class="card"><h2 class="h2">Nouvelle idée${person ? ` pour ${esc(person.name)}` : ''}</h2>${addForm('idea')}</section>
    ${rows ? `<div class="stack-sm">${rows}</div>` : '<div class="empty">Aucune idée pour l’instant.</div>'}
  </main>`, { tab: 'idees' });
}

// ---------------------------------------------------------------------
// Actions (clics)
// ---------------------------------------------------------------------
const actions = {
  'close-sheet': () => closeSheet(),
  reload: () => render(),
  'login-mode': (el) => {
    const email = document.getElementById('email')?.value;
    if (email) S.loginEmail = email.trim();
    S.loginMode = el.dataset.k; S.resetSent = false; renderLogin();
  },
  account: () => {
    openSheet(`${sheetHead('Mon compte', esc(S.session?.user?.email || ''))}
      <form data-form="profile" class="stack-sm" novalidate>
        <label for="acc-name">Prénom affiché</label>
        <div class="row"><input id="acc-name" name="name" class="input" maxlength="40" value="${esc(S.profile?.display_name || '')}"><button class="btn-ghost">Enregistrer</button></div>
        <p class="error" hidden></p></form>
      <button class="btn-ghost full" data-action="logout">Se déconnecter</button>`);
  },
  logout: async () => { closeSheet(); await sb.auth.signOut(); },
  'pick-occasion': (el) => { if (S.draft) { S.draft.occasion = el.dataset.k; pageCreate(); } },
  invite: () => openInvite(),
  'share-code': async () => {
    const { circle } = S.page;
    const link = joinLink(circle.join_code);
    const text = `Rejoins le cercle « ${circle.name} » sur Cercle Cadeaux avec le code ${circle.join_code}`;
    if (navigator.share) { try { await navigator.share({ title: 'Cercle Cadeaux', text, url: link }); } catch { /* annulé */ } return; }
    try { await navigator.clipboard.writeText(`${text} : ${link}`); toast('Invitation copiée'); } catch { toast(link); }
  },
  'copy-code': async () => {
    try { await navigator.clipboard.writeText(S.page.circle.join_code); toast('Code copié'); } catch { toast(S.page.circle.join_code); }
  },
  'add-list': () => openAddList(),
  'add-list-person': async (el) => {
    el.disabled = true;
    const { data: p } = await sb.from('people').select('*').eq('id', el.dataset.id).maybeSingle();
    if (!p) { el.disabled = false; return; }
    const { error } = await sb.from('lists').insert({ circle_id: S.page.circle.id, managed_by: me(), person_id: p.id, person_name: p.name, person_type: p.person_type, info: p.info });
    if (error) { el.disabled = false; toast('Impossible de créer la liste.'); return; }
    closeSheet(); toast(`Liste de ${p.name} ajoutée`); render();
  },
  'delete-circle': async (el) => {
    if (!confirmTap(el, 'Confirmer : tout sera supprimé')) return;
    const { error } = await sb.from('circles').delete().eq('id', S.page.circle.id);
    if (error) return toast('Suppression impossible.');
    toast('Cercle supprimé'); location.hash = '#/';
  },
  'leave-circle': async (el) => {
    if (!confirmTap(el, 'Confirmer : quitter ce cercle')) return;
    const { error } = await sb.from('circle_members').delete().eq('circle_id', S.page.circle.id).eq('user_id', me());
    if (error) return toast('Action impossible.');
    toast('Vous avez quitté le cercle'); location.hash = '#/';
  },
  filter: (el) => { S.filter = el.dataset.k; render(); },
  buy: async (el) => {
    el.disabled = true;
    const { error } = await sb.from('purchases').insert({ gift_id: el.dataset.id, bought_by: me() });
    if (error) toast(error.code === '23505' ? 'Quelqu’un vient déjà de l’acheter !' : 'Action impossible pour le moment.');
    else toast('C’est noté : cadeau acheté !');
    render();
  },
  unbuy: async (el) => {
    el.disabled = true;
    const { error } = await sb.from('purchases').delete().eq('gift_id', el.dataset.id).eq('bought_by', me());
    if (error) toast('Action impossible pour le moment.');
    render();
  },
  'delete-gift': async (el) => {
    if (!confirmTap(el, 'Confirmer le retrait')) return;
    const { error } = await sb.from('gifts').delete().eq('id', el.dataset.id);
    if (error) return toast('Action impossible.');
    render();
  },
  'cancel-preview': () => { S.preview = null; const s = document.getElementById('preview-slot'); if (s) s.innerHTML = ''; const f = document.querySelector('[data-form="preview"]'); if (f) f.reset(); },
  'from-ideas': () => openFromIdeas(),
  'ideas-for': (el) => { S.ideasPerson = el.dataset.id || null; render(); },
  'add-person': () => openSheet(`${sheetHead('Ajouter un proche', 'Un enfant, un grand-parent… quelqu’un sans compte dont vous gérez les idées.')}${personForm('add-person', 'Ajouter')}`),
  'delete-idea': async (el) => {
    if (!confirmTap(el, 'Confirmer')) return;
    const { error } = await sb.from('ideas').delete().eq('id', el.dataset.id);
    if (error) return toast('Action impossible.');
    render();
  }
};

// ---------------------------------------------------------------------
// Formulaires (envois)
// ---------------------------------------------------------------------
const forms = {
  login: async (f) => {
    const email = f.email.value.trim();
    S.loginEmail = email;
    if (!/^\S+@\S+\.\S+$/.test(email)) return showError(f, 'Entrez une adresse e-mail valide.');
    if (!f.password.value) return showError(f, 'Entrez votre mot de passe.');
    busy(f, true);
    const { data, error } = await sb.auth.signInWithPassword({ email, password: f.password.value });
    busy(f, false);
    if (error) {
      if (/confirm/i.test(error.message)) return showError(f, 'Adresse e-mail pas encore confirmée : ouvrez le lien reçu par e-mail.');
      return showError(f, error.status === 429 ? 'Trop de tentatives. Patientez quelques minutes.' : 'E-mail ou mot de passe incorrect.');
    }
    S.session = data.session; render();
  },
  signup: async (f) => {
    const name = f.name.value.trim();
    const email = f.email.value.trim();
    S.loginEmail = email;
    if (!name) return showError(f, 'Entrez votre prénom.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return showError(f, 'Entrez une adresse e-mail valide.');
    if (f.password.value.length < 8) return showError(f, 'Le mot de passe doit contenir au moins 8 caractères.');
    busy(f, true);
    const { data, error } = await sb.auth.signUp({
      email, password: f.password.value,
      options: { data: { display_name: name, name_set: true }, emailRedirectTo: location.origin + location.pathname }
    });
    busy(f, false);
    if (error) {
      if (/registered|already/i.test(error.message)) return showError(f, 'Un compte existe déjà avec cette adresse : connectez-vous.');
      if (/password/i.test(error.message)) return showError(f, 'Mot de passe trop faible : choisissez-en un plus long ou plus varié.');
      return showError(f, error.status === 429 ? 'Trop de tentatives. Patientez quelques minutes.' : 'Création du compte impossible. Réessayez.');
    }
    if (!data.session) return showError(f, 'Compte créé : ouvrez le lien de confirmation reçu par e-mail, puis connectez-vous.');
    S.session = data.session; S.profile = null; render();
  },
  reset: async (f) => {
    const email = f.email.value.trim();
    S.loginEmail = email;
    if (!/^\S+@\S+\.\S+$/.test(email)) return showError(f, 'Entrez une adresse e-mail valide.');
    busy(f, true);
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    busy(f, false);
    if (error) return showError(f, error.status === 429 ? 'Trop de demandes. Patientez quelques minutes.' : 'Envoi impossible. Réessayez plus tard.');
    S.resetSent = true; renderLogin();
  },
  'new-password': async (f) => {
    if (f.password.value.length < 8) return showError(f, 'Au moins 8 caractères.');
    busy(f, true);
    const { error } = await sb.auth.updateUser({ password: f.password.value });
    busy(f, false);
    if (error) return showError(f, 'Enregistrement impossible. Réessayez.');
    S.recovery = false; toast('Mot de passe enregistré'); render();
  },
  name: async (f) => {
    const name = f.name.value.trim();
    if (!name) return showError(f, 'Entrez votre prénom.');
    busy(f, true);
    const { error } = await sb.from('profiles').update({ display_name: name }).eq('id', me());
    if (error) { busy(f, false); return showError(f, 'Enregistrement impossible. Réessayez.'); }
    const { data } = await sb.auth.updateUser({ data: { name_set: true } });
    S.profile = { id: me(), display_name: name };
    if (data?.user) S.session = { ...S.session, user: data.user };
    render();
  },
  profile: async (f) => {
    const name = f.name.value.trim();
    if (!name) return showError(f, 'Entrez votre prénom.');
    busy(f, true);
    const { error } = await sb.from('profiles').update({ display_name: name }).eq('id', me());
    busy(f, false);
    if (error) return showError(f, 'Enregistrement impossible.');
    S.profile.display_name = name; closeSheet(); toast('Prénom enregistré'); render();
  },
  join: async (f) => {
    const code = normCode(f.code.value);
    if (!code) return showError(f, 'Entrez le code reçu.');
    busy(f, true);
    const { data, error } = await sb.rpc('join_circle', { p_code: code });
    busy(f, false);
    if (error) return showError(f, /CODE_INCONNU/.test(error.message) ? 'Code introuvable. Vérifiez-le auprès du créateur du cercle.' : 'Impossible de rejoindre ce cercle pour le moment.');
    S.pendingCode = ''; localStorage.removeItem('cc_code');
    location.hash = `#/cercle/${data}`;
  },
  create: async (f) => {
    const d = S.draft;
    const code = normCode(d.code) || suggestCode(d.name);
    if (code.length < 4) return showError(f, 'Le code doit contenir au moins 4 caractères.');
    busy(f, true);
    const { data, error } = await sb.rpc('create_circle', {
      p_name: d.name.trim() || 'Mon cercle', p_occasion: d.occasion,
      p_event_date: d.date || null, p_code: code, p_owners_see: d.see
    });
    busy(f, false);
    if (error) return showError(f, /CODE_PRIS/.test(error.message) ? `Le code ${code} est déjà utilisé : choisissez-en un autre.` : 'Impossible de créer le cercle. Réessayez.');
    S.draft = null; S.openInvite = true;
    location.hash = `#/cercle/${data}`;
  },
  'change-code': async (f) => {
    const code = normCode(f.code.value);
    if (!/^[A-Z0-9]{4,12}$/.test(code)) return showError(f, 'Lettres et chiffres uniquement, 4 à 12 caractères.');
    busy(f, true);
    const { error } = await sb.from('circles').update({ join_code: code }).eq('id', S.page.circle.id);
    busy(f, false);
    if (error) return showError(f, error.code === '23505' ? 'Ce code est déjà utilisé par un autre cercle.' : 'Modification impossible.');
    closeSheet(); toast(`Nouveau code : ${code}`); render();
  },
  'add-list': async (f) => {
    const name = f.name.value.trim();
    if (!name) return showError(f, 'Entrez un prénom.');
    const type = f.type.value; const info = f.info.value.trim();
    busy(f, true);
    const { data: p, error: e1 } = await sb.from('people').insert({ managed_by: me(), name, person_type: type, info }).select().single();
    if (e1) { busy(f, false); return showError(f, 'Création impossible. Réessayez.'); }
    const { error: e2 } = await sb.from('lists').insert({ circle_id: S.page.circle.id, managed_by: me(), person_id: p.id, person_name: name, person_type: type, info });
    busy(f, false);
    if (e2) return showError(f, 'Création de la liste impossible.');
    closeSheet(); toast(`Liste de ${name} créée`); render();
  },
  'add-person': async (f) => {
    const name = f.name.value.trim();
    if (!name) return showError(f, 'Entrez un prénom.');
    busy(f, true);
    const { data: p, error } = await sb.from('people').insert({ managed_by: me(), name, person_type: f.type.value, info: f.info.value.trim() }).select().single();
    busy(f, false);
    if (error) return showError(f, 'Ajout impossible.');
    S.ideasPerson = p.id; closeSheet(); render();
  },
  preview: async (f) => {
    const raw = f.url.value.trim();
    const slot = document.getElementById('preview-slot');
    let p = { url: '', site: '', title: '', image: '', price: '', found: false };
    if (raw) {
      const url = safeUrl(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      if (!url) return showError(f, 'Ce lien ne semble pas valide.');
      f.querySelector('.error').hidden = true;
      busy(f, true);
      slot.innerHTML = '<p class="hint">Recherche de l’aperçu…</p>';
      p = await fetchPreview(url);
      busy(f, false);
    }
    S.preview = p;
    slot.innerHTML = previewForm(p, f.dataset.target);
    document.getElementById('i-title')?.focus();
  },
  'save-item': async (f) => {
    const p = S.preview || {};
    const title = f.title.value.trim();
    if (!title) return showError(f, 'Donnez un titre au cadeau.');
    const item = { title, url: p.url || null, image_url: p.image || null, site: p.site || null, price: f.price.value.trim() || null, note: f.note.value.trim() };
    busy(f, true);
    if (f.dataset.target === 'idea') {
      const { error } = await sb.from('ideas').insert({ ...item, owner_user_id: me(), person_id: S.ideasPerson || null });
      busy(f, false);
      if (error) return showError(f, 'Ajout impossible. Réessayez.');
      toast('Idée ajoutée'); S.preview = null; render(); return;
    }
    const { list, isMine } = S.page;
    let ideaId = null;
    if (f.keep?.checked) {
      const pid = isMine ? null : list.person_id;
      const { data: idea } = await sb.from('ideas').insert({ ...item, owner_user_id: me(), person_id: pid }).select('id').single();
      ideaId = idea?.id || null;
    }
    const { error } = await sb.from('gifts').insert({ ...item, list_id: list.id, created_by: me(), idea_id: ideaId });
    busy(f, false);
    if (error) return showError(f, 'Ajout impossible. Réessayez.');
    toast('Cadeau ajouté'); S.preview = null; render();
  },
  'add-from-ideas': async (f) => {
    const ids = [...f.querySelectorAll('input[name="idea"]:checked:not(:disabled)')].map((i) => i.value);
    if (!ids.length) return showError(f, 'Cochez au moins une idée.');
    const rows = (S.page.sheetIdeas || []).filter((i) => ids.includes(i.id)).map((i) => ({
      list_id: S.page.list.id, title: i.title, url: i.url, image_url: i.image_url, site: i.site,
      price: i.price, note: i.note || '', created_by: me(), idea_id: i.id
    }));
    busy(f, true);
    const { error } = await sb.from('gifts').insert(rows);
    busy(f, false);
    if (error) return showError(f, 'Ajout impossible. Réessayez.');
    closeSheet(); toast(`${plural(rows.length, 'idée')} ajoutée${rows.length > 1 ? 's' : ''}`); render();
  }
};

// ---------------------------------------------------------------------
// Écouteurs globaux
// ---------------------------------------------------------------------
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || !actions[el.dataset.action]) return;
  if (el.tagName === 'BUTTON' || el.dataset.action === 'close-sheet') {
    if (el.tagName === 'BUTTON') e.preventDefault();
    actions[el.dataset.action](el, e);
  }
});
document.addEventListener('submit', (e) => {
  const f = e.target.closest('form[data-form]');
  if (!f || !forms[f.dataset.form]) return;
  e.preventDefault();
  forms[f.dataset.form](f);
});
document.addEventListener('input', (e) => {
  const f = e.target.form;
  if (f?.dataset.form !== 'create' || !S.draft) return;
  const n = e.target.name;
  if (n === 'code') { const v = normCode(e.target.value).slice(0, 12); if (e.target.value !== v) e.target.value = v; S.draft.code = v; }
  else if (n === 'see') S.draft.see = e.target.checked;
  else if (n === 'name' || n === 'date') S.draft[n] = e.target.value;
  if (n === 'name') {
    document.getElementById('create-preview').innerHTML = createPreview(S.draft);
    f.code.placeholder = suggestCode(S.draft.name);
  }
  const help = document.getElementById('code-help');
  if (help) help.textContent = codeHelp(S.draft);
});
// Réduit une photo avant envoi (plus rapide, moins de stockage)
async function resizeImage(file, max = 900) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((resolve) => c.toBlob((b) => resolve(b || file), 'image/jpeg', 0.82));
  } catch { return file; }
}
async function uploadPhoto(input) {
  const file = input.files?.[0];
  if (!file || !S.preview) return;
  const label = document.getElementById('photo-label');
  label.textContent = 'Envoi de la photo…';
  const blob = await resizeImage(file);
  const path = `${me()}/${Date.now()}.jpg`;
  const { error } = await sb.storage.from('gift-images').upload(path, blob, { contentType: 'image/jpeg' });
  if (error) { label.textContent = 'Ajouter une photo'; toast('Envoi de la photo impossible.'); return; }
  const url = sb.storage.from('gift-images').getPublicUrl(path).data.publicUrl;
  S.preview.image = url;
  document.getElementById('preview-img').innerHTML = icon('gift', 44, 1.3) + img(url);
  label.textContent = 'Changer la photo';
  input.value = '';
}

document.addEventListener('change', async (e) => {
  if (e.target.dataset.change === 'photo') return uploadPhoto(e.target);
  const f = e.target.form;
  if (f?.dataset.form === 'create' && S.draft && e.target.name === 'see') S.draft.see = e.target.checked;
  if (e.target.dataset.change === 'toggle-see') {
    const value = e.target.checked;
    const { error } = await sb.from('circles').update({ owners_see_purchases: value }).eq('id', S.page.circle.id);
    if (error) { e.target.checked = !value; toast('Modification impossible.'); return; }
    toast('Réglage enregistré'); render();
  }
});
window.addEventListener('hashchange', () => { closeSheet(); render(); });

// Mises à jour en direct : quand quelqu'un coche « acheté », les autres le voient
function startLive() {
  if (S.live) return;
  const refresh = () => {
    const r = parseRoute().name;
    if (r !== 'cercle' && r !== 'liste') return;
    clearTimeout(S.liveTimer);
    S.liveTimer = setTimeout(() => {
      if (S.preview || document.getElementById('sheet') || document.activeElement?.matches('input, textarea')) return;
      render();
    }, 600);
  };
  S.live = sb.channel('cercle-cadeaux-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'purchases' }, refresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, refresh)
    .subscribe();
}
function stopLive() { if (S.live) { sb.removeChannel(S.live); S.live = null; } }

// ---------------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------------
(async function start() {
  const { data } = await sb.auth.getSession();
  S.session = data.session;
  if (/access_token|error_description/.test(location.hash)) history.replaceState(null, '', `${location.pathname}#/`);
  sb.auth.onAuthStateChange((event, session) => {
    const had = !!S.session;
    S.session = session;
    if (event === 'PASSWORD_RECOVERY') { S.recovery = true; setTimeout(render, 0); }
    else if (event === 'SIGNED_OUT') { S.profile = null; S.recovery = false; stopLive(); setTimeout(render, 0); }
    else if (event === 'SIGNED_IN' && !had) setTimeout(render, 0);
  });
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
