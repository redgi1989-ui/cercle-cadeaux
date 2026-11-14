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
    const html = (await res.text()).slice(0, 800_000);

    let title = meta(html, 'og:title') || meta(html, 'twitter:title');
    if (!title) {
      const t = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      title = t ? decode(t[1]) : '';
    }

    let image = meta(html, 'og:image:secure_url') || meta(html, 'og:image') || meta(html, 'twitter:image') || meta(html, 'twitter:image:src');
    if (image) { try { image = new URL(image, finalUrl).href; } catch { image = ''; } }

    let amount = meta(html, 'product:price:amount') || meta(html, 'og:price:amount') || meta(html, 'price');
    let currency = meta(html, 'product:price:currency') || meta(html, 'og:price:currency') || meta(html, 'priceCurrency');
    if (!amount) {
      const p = html.match(/"price"\s*:\s*"?(\d+(?:[.,]\d{1,2})?)"?/);
      if (p) amount = p[1];
      const c = html.match(/"priceCurrency"\s*:\s*"([A-Z]{3})"/);
      if (c) currency = c[1];
    }

    return json({
      site,
      url: finalUrl.href,
      title: title.slice(0, 200),
      image,
      price: amount ? formatPrice(amount, currency) : '',
    });
  } catch (_e) {
    return json({ error: 'Aperçu indisponible' });
  }
});
