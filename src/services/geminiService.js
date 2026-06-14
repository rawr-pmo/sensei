const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

function dataUrlToBase64(dataUrl) {
  return dataUrl.split(',')[1];
}

async function callGemini(base64Image, mimeType, prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Please set it in your .env file.');
  }

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: mimeType, data: base64Image } }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024
    }
  };
console.log(JSON.stringify(body, null, 2));
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();

console.log("FULL GEMINI RESPONSE:", data);
console.log("PARTS:", data?.candidates?.[0]?.content?.parts);
console.log("FINISH REASON:", data?.candidates?.[0]?.finishReason);

const text =
  data?.candidates?.[0]?.content?.parts
    ?.map(part => part.text || "")
    .join("\n");

console.log("EXTRACTED TEXT:", text);

if (!text) {
  throw new Error('No response received from Gemini.');
}

const cleanText = text
  .replace(/\*\*/g, '')
  .replace(/\*/g, '')
  .replace(/#/g, '')
  .replace(/`/g, '')
  .replace(/^\s*[-•]\s*/gm, '')
  .replace(/^\s*\d+\.\s*/gm, '')
  .trim();

console.log("CLEAN TEXT:", cleanText);

return cleanText;
}

const PROMPTS = {
  scene: 'Describe this scene in 2-3 clear, concise sentences for a visually impaired person. Focus on layout, people, objects, and any potential hazards.',
  groceries: 'Identify all grocery or food items visible in this image. List each item name clearly and briefly mention quantity or packaging if visible. Keep it short and spoken-friendly.',
  clothing: `Describe the clothing in detail.

  Use plain sentences only.
Do NOT use markdown.
Do NOT use asterisks, bullet points, numbering, or headings.
Do NOT use bold text.

Never use:
*, **, #, bullet points, lists, numbering, markdown, or headings.

For each clothing item identify:
- Type of clothing
- Primary and secondary colors
- Patterns (stripes, checks, plaid, floral, polka dots, prints)
- Logos, graphics, brands, or text
- Texture or material if visible
- Accessories being worn
- Whether items appear to match

Be specific. Do not simply say "blue shirt".
Instead say things like:
"light blue button-down shirt with thin white vertical stripes"
or
"black T-shirt with a large white logo on the chest".`,
  ocr: 'Extract all readable text from this image exactly as it appears, preserving line breaks. If there is no text, respond with "No text detected."'
};

export async function analyzeImage(imageDataUrl, mode = 'scene') {
  const base64 = dataUrlToBase64(imageDataUrl);
  const mimeType = imageDataUrl.substring(imageDataUrl.indexOf(':') + 1, imageDataUrl.indexOf(';'));
  const prompt = PROMPTS[mode] || PROMPTS.scene;
  return callGemini(base64, mimeType, prompt);
}

export async function extractText(imageDataUrl) {
  const base64 = dataUrlToBase64(imageDataUrl);
  const mimeType = imageDataUrl.substring(imageDataUrl.indexOf(':') + 1, imageDataUrl.indexOf(';'));
  return callGemini(base64, mimeType, PROMPTS.ocr);
}
