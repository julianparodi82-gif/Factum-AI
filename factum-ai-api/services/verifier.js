const trustedDomains = ['.gov', '.edu', 'who.int', 'un.org', 'reuters.com', 'apnews.com'];

function scoreConfidence({ hasClaim, sourcesCount, hasEvidence }) {
  if (!hasClaim || !hasEvidence) return 25;
  if (sourcesCount >= 3) return 85;
  if (sourcesCount >= 1) return 70;
  return 40;
}

function labelFromScore(score) {
  if (score >= 80) return 'Alta';
  if (score >= 60) return 'Media';
  return 'Baja';
}

function classify({ hasEvidence, hasClaim }) {
  if (!hasClaim) return 'No verificable';
  if (!hasEvidence) return 'No verificable';
  return 'Parcialmente correcta';
}

export async function verifyClaim(modelInput) {
  const hasClaim = Boolean(modelInput.claim && modelInput.claim !== 'Sin afirmación explícita');
  const candidateSources = [
    { name: 'Organización Mundial de la Salud', url: 'https://www.who.int' },
    { name: 'Naciones Unidas', url: 'https://www.un.org' },
    { name: 'Reuters', url: 'https://www.reuters.com' }
  ];

  const sources = candidateSources.filter((source) => trustedDomains.some((domain) => source.url.includes(domain))).slice(0, 5);
  const hasEvidence = modelInput.key_passages.length > 0;
  const confidenceScore = scoreConfidence({ hasClaim, sourcesCount: sources.length, hasEvidence });

  return {
    claim: modelInput.claim,
    classification: classify({ hasEvidence, hasClaim }),
    context: [
      `Título detectado: ${modelInput.metadata.title || 'No disponible'}`,
      `Descripción: ${modelInput.metadata.description || 'No disponible'}`,
      ...modelInput.key_passages.slice(0, 3)
    ].slice(0, 5),
    image_analysis: [],
    sources,
    confidence_label: labelFromScore(confidenceScore),
    confidence_score: confidenceScore,
    uncertainties: hasEvidence ? [] : ['Información insuficiente para confirmar.'],
    tokens_used: estimateTokens(modelInput)
  };
}

function estimateTokens(modelInput) {
  const text = JSON.stringify(modelInput);
  return Math.ceil(text.length / 4);
}
