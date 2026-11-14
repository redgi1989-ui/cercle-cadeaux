// =====================================================================
//  Cercle Cadeaux — fonction « link-preview »
//  Lit une page produit et renvoie : titre, image, prix, site.
//  À déployer dans Supabase > Edge Functions, sous le nom : link-preview
// =====================================================================

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { ...CORS, 'Content-Type': 'application/json' } });
}

function decode(s: string) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}

function meta(html: string, key: string) {
  const k = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const a = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${k}["'][^>]*content=["']([^"']*)["']`, 'i');
  const b = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name|itemprop)=["']${k}["']`, 'i');
  const m = html.match(a) || html.match(b);
  return m ? decode(m[1]) : '';
}

// Refuse les adresses internes (sécurité)
function blockedHost(h: string) {
  return /^(localhost|127\.|10\.|0\.|169\.254\.|192\.168\.|\[)/i.test(h)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(h)
    || h.endsWith('.local') || h.endsWith('.internal');
}

function formatPrice(amount: string, currency: string) {
  const n = parseFloat(amount.replace(/\s/g, '').replace(',', '.'));
  if (!isFinite(n) || n <= 0) return '';
  const value = n.toFixed(2).replace('.', ',');
  return `${value} ${!currency || currency === 'EUR' ? '€' : currency}`;
}

// Pages Amazon : image, titre et prix sont à des endroits particuliers
function amazon(html: string) {
  const out = { title: '', image: '', price: '' };
  const t = html.match(/id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i);
  if (t) out.title = decode(t[1]);
  const hi = html.match(/"hiRes"\s*:\s*"(https:[^"]+)"/)
    || html.match(/data-old-hires=["'](https:[^"']+)["']/i)
    || html.match(/"large"\s*:\s*"(https:[^"]+)"/)
    || html.match(/id=["']landingImage["'][^>]*src=["'](https:[^"']+)["']/i);
  if (hi) out.image = hi[1];
  else {
    const dyn = html.match(/data-a-dynamic-image=["']\{&quot;(https:[^&]+)&quot;/i) || html.match(/data-a-dynamic-image=["']\{"(https:[^"]+)"/i);
    if (dyn) out.image = dyn[1];
  }
  const p = html.match(/class=["']a-offscreen["'][^>]*>\s*([\d\s.,]+)\s*(?:&nbsp;)?\s*€/i)
    || html.match(/class=["']a-offscreen["'][^>]*>\s*€\s*([\d\s.,]+)/i);
  if (p) out.price = formatPrice(p[1].replace(/\.(?=\d{3})/g, ''), 'EUR');
  return out;
}

function isBlocked(html: string) {
  return /captcha|validateCaptcha|api-services-support@amazon|Robot Check|Access Denied/i.test(html.slice(0, 60000));
}

// Service de secours (gratuit, limité) quand le site refuse la lecture directe
async function fallback(url: string) {
  try {
    const r = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(9000) });
    const j = await r.json();
    if (j?.status !== 'success') return { title: '', image: '' };
    return { title: j.data?.title || '', image: j.data?.image?.url || '' };
  } catch {
    return { title: '', image: '' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { url } = await req.json();
    let target: URL;
    try { target = new URL(String(url)); } catch { return json({ error: 'URL invalide' }); }
    if (!/^https?:$/.test(target.protocol) || blockedHost(target.hostname)) return json({ error: 'URL non autorisée' });

    const res = await fetch(target.href, {
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-BE,fr;q=0.9,en;q=0.8',
      },
    });
    const finalUrl = new URL(res.url || target.href);
    const site = finalUrl.hostname.replace(/^www\./, '');
    if (!(res.headers.get('content-type') || '').includes('html')) {
      return json({ site, url: finalUrl.href, title: '', image: '', price: '' });
    }
    const html = (await res.text()).slice(0, 1_500_000);
    const blocked = !res.ok || isBlocked(html);
    const isAmazon = /(^|\.)amazon\.|amzn\./i.test(site);

    let title = '', image = '', price = '';
    if (!blocked) {
      if (isAmazon) ({ title, image, price } = amazon(html));
      title = title || meta(html, 'og:title') || meta(html, 'twitter:title');
      if (!title) {
        const t = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        title = t ? decode(t[1]) : '';
      }
      image = image || meta(html, 'og:image:secure_url') || meta(html, 'og:image') || meta(html, 'twitter:image') || meta(html, 'twitter:image:src');
      if (!price) {
        let amount = meta(html, 'product:price:amount') || meta(html, 'og:price:amount') || meta(html, 'price');
        let currency = meta(html, 'product:price:currency') || meta(html, 'og:price:currency') || meta(html, 'priceCurrency');
        if (!amount) {
          const p = html.match(/"price"\s*:\s*"?(\d+(?:[.,]\d{1,2})?)"?/);
          if (p) amount = p[1];
          const c = html.match(/"priceCurrency"\s*:\s*"([A-Z]{3})"/);
          if (c) currency = c[1];
        }
        if (amount) price = formatPrice(amount, currency);
      }
    }
    // Un titre réduit au nom du site (ex. « Amazon.fr ») n'est pas un vrai titre de produit
    if (/^amazon(\.[a-z.]+)?$/i.test(title.trim())) title = '';

    if (!title || !image) {
      const fb = await fallback(finalUrl.href);
      if (!/^amazon(\.[a-z.]+)?$/i.test(fb.title.trim())) title = title || fb.title;
      image = image || fb.image;
    }
    if (image) { try { image = new URL(image, finalUrl).href; } catch { image = ''; } }

    return json({ site, url: finalUrl.href, title: title.slice(0, 200), image, price });
  } catch (_e) {
    return json({ error: 'Aperçu indisponible' });
  }
});
