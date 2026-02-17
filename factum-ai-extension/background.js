chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'FACTUM_VERIFY') {
    return;
  }

  fetch('http://localhost:3000/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message.payload)
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((data) => sendResponse({ ok: true, data }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});
