import { Router } from 'express';
import { extractFromUrl, prepareModelInput } from '../services/extractor.js';
import { verifyClaim } from '../services/verifier.js';
import { processImage } from '../services/imageProcessor.js';
import { getCached, setCached, makeCacheKey } from '../services/cache.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const payload = req.body ?? {};
    const cacheKey = makeCacheKey(payload.url, payload.post_text);
    const cached = getCached(cacheKey);

    if (cached) {
      res.json(cached);
      return;
    }

    const extraction = payload.url
      ? await extractFromUrl(payload.url)
      : {
          metadata: {},
          fullText: '',
          keyPassages: []
        };

    const modelInput = prepareModelInput({
      postText: payload.post_text,
      extraction
    });

    const verification = await verifyClaim(modelInput);

    let totalTokens = verification.tokens_used;
    let imageAnalysis = [];
    let uncertainties = [...verification.uncertainties];

    if (payload.analyze_image) {
      const imageResult = await processImage({ imageUrl: payload.image_url, imageBytes: payload.image_bytes });
      imageAnalysis = imageResult.image_analysis;
      uncertainties = [...uncertainties, ...imageResult.uncertainties];
      totalTokens += imageResult.tokens_used;
    }

    const response = {
      ...verification,
      image_analysis: imageAnalysis,
      uncertainties,
      tokens_used: totalTokens
    };

    setCached(cacheKey, response);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
