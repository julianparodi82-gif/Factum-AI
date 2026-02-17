const statusEl = document.getElementById('status');
const verifyBtn = document.getElementById('verifyBtn');
const imageToggle = document.getElementById('imageToggle');

chrome.storage.sync.get(['analyzeImage'], ({ analyzeImage }) => {
  imageToggle.checked = Boolean(analyzeImage);
});

imageToggle.addEventListener('change', () => {
  chrome.storage.sync.set({ analyzeImage: imageToggle.checked });
});

verifyBtn.addEventListener('click', async () => {
  statusEl.textContent = 'Analizando...';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    statusEl.textContent = 'No se pudo leer la pestaña activa';
    return;
  }

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const selectedText = window.getSelection()?.toString()?.trim() || '';
      const imageUrl = document.querySelector('meta[property="og:image"]')?.content || null;
      return { selectedText, imageUrl };
    }
  });

  const payload = {
    url: tab.url,
    post_text: result.selectedText,
    analyze_image: imageToggle.checked,
    image_url: imageToggle.checked ? result.imageUrl : null,
    image_bytes: null
  };

  chrome.runtime.sendMessage({ type: 'FACTUM_VERIFY', payload }, (response) => {
    if (chrome.runtime.lastError) {
      statusEl.textContent = `Error: ${chrome.runtime.lastError.message}`;
      return;
    }

    if (!response?.ok) {
      statusEl.textContent = `Error: ${response?.error || 'No disponible'}`;
      return;
    }

    statusEl.textContent = 'Verificación completada';
    chrome.tabs.sendMessage(tab.id, { type: 'FACTUM_RENDER', data: response.data });
  });
});
