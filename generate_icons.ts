import { GoogleGenAI } from "@google/genai";

async function generateIcons() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const bridePrompt = "A high-quality 3D clay style icon of a cute bride with a small wedding veil, soft lighting, pastel colors, minimalist background, centered, high resolution, 3D render style";
  const groomPrompt = "A high-quality 3D clay style icon of a cute groom with a small bowtie, soft lighting, pastel colors, minimalist background, centered, high resolution, 3D render style";

  console.log("Generating Bride Icon...");
  const brideResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: bridePrompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  console.log("Generating Groom Icon...");
  const groomResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: groomPrompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  const brideBase64 = brideResponse.candidates[0].content.parts.find(p => p.inlineData)?.inlineData.data;
  const groomBase64 = groomResponse.candidates[0].content.parts.find(p => p.inlineData)?.inlineData.data;

  if (brideBase64 && groomBase64) {
    console.log("BRIDE_BASE64_START");
    console.log(brideBase64);
    console.log("BRIDE_BASE64_END");
    console.log("GROOM_BASE64_START");
    console.log(groomBase64);
    console.log("GROOM_BASE64_END");
  } else {
    console.error("Failed to generate images.");
  }
}

generateIcons();
