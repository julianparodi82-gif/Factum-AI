function renderList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return '<p>Sin datos.</p>';
  }
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function renderSources(sources) {
  if (!Array.isArray(sources) || sources.length === 0) {
    return '<p>Sin fuentes.</p>';
  }

  return `<ul>${sources
    .map((source) => `<li><a href="${source.url}" target="_blank" rel="noreferrer">${source.name}</a></li>`)
    .join('')}</ul>`;
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== 'FACTUM_RENDER') {
    return;
  }

  document.getElementById('factum-card')?.remove();

  const card = document.createElement('section');
  card.id = 'factum-card';
  card.innerHTML = `
    <h3>FACTUM AI — Verificación</h3>
    <strong>Afirmación Detectada</strong>
    <p>${message.data.claim || 'No detectada'}</p>
    <strong>Clasificación</strong>
    <p>${message.data.classification || 'No verificable'}</p>
    <strong>Contexto General</strong>
    ${renderList(message.data.context)}
    <strong>Análisis Imagen</strong>
    ${renderList(message.data.image_analysis)}
    <strong>Fuentes</strong>
    ${renderSources(message.data.sources)}
    <strong>Nivel de Confiabilidad</strong>
    <p>${message.data.confidence_label || 'No verificable'} (${message.data.confidence_score || 0})</p>
    <strong>Incertidumbres</strong>
    ${renderList(message.data.uncertainties)}
    <div class="token-count">Tokens utilizados: ${(message.data.tokens_used || 0).toLocaleString('es-ES')}</div>
  `;

  document.body.appendChild(card);
});
