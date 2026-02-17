const MAX_REDIRECTS = 3;

async function fetchWithRedirects(url, redirects = 0, signal) {
  const response = await fetch(url, { signal, redirect: 'manual' });

  if (response.status >= 300 && response.status < 400) {
    if (redirects >= MAX_REDIRECTS) {
      throw new Error('Límite de redirecciones excedido');
    }
    const next = response.headers.get('location');
    if (!next) {
      throw new Error('Redirección inválida');
    }
    return fetchWithRedirects(new URL(next, url).toString(), redirects + 1, signal);
  }

  return response;
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetchWithRedirects(url, 0, controller.signal);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      throw new Error('Contenido no soportado: solo text/html');
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function collectMatches(html, regex, limit = 5) {
  const matches = [];
  let match;
  while ((match = regex.exec(html)) && matches.length < limit) {
    const value = stripTags(match[1]);
    if (value) matches.push(value);
  }
  return matches;
}

export async function extractFromUrl(url) {
  const html = await fetchHtml(url);

  const title = collectMatches(html, /<title[^>]*>([\s\S]*?)<\/title>/gi, 1)[0] || '';
  const description =
    collectMatches(html, /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/gi, 1)[0] || '';
  const headings = collectMatches(html, /<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi, 5);
  const paragraphs = collectMatches(html, /<p[^>]*>([\s\S]*?)<\/p>/gi, 30);

  return {
    metadata: { title, description, headings },
    fullText: paragraphs.join('\n'),
    keyPassages: paragraphs.slice(0, 5)
  };
}

export function prepareModelInput({ postText = '', extraction }) {
  const normalizedPost = postText.trim();
  const claim = normalizedPost.split('.').map((v) => v.trim()).filter(Boolean)[0] || extraction.metadata.title || 'Sin afirmación explícita';

  const secondaryClaims = normalizedPost
    .split('.')
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(1, 3);

  const dedupedPassages = extraction.keyPassages.filter((passage) => !normalizedPost.includes(passage)).slice(0, 5);

  return {
    metadata: extraction.metadata,
    claim,
    secondary_claims: secondaryClaims,
    key_passages: dedupedPassages
  };
}
