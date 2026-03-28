import { GoogleGenAI } from "@google/genai";

async function generateIcons() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const bridePrompt = "Generate a high-quality 3D clay style icon of a cute bride. She has brown hair, a white flower crown, a white lace wedding dress, and a pearl necklace. Centered, circular composition, soft lighting, pastel pink background with small hearts, high resolution 3D render.";
  const groomPrompt = "Generate a high-quality 3D clay style icon of a cute groom. He has brown hair, a blue suit, a grey bow tie, and a pink rose boutonniere. Centered, circular composition, soft lighting, beige background with small hearts, high resolution 3D render.";

  console.log("Generating Bride Icon...");
  const brideResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: bridePrompt,
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  console.log("Generating Groom Icon...");
  const groomResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: groomPrompt,
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  const bridePart = brideResponse.candidates[0].content.parts.find(p => p.inlineData);
  const groomPart = groomResponse.candidates[0].content.parts.find(p => p.inlineData);

  if (bridePart?.inlineData?.data && groomPart?.inlineData?.data) {
    console.log("BRIDE_BASE64_START");
    console.log(bridePart.inlineData.data);
    console.log("BRIDE_BASE64_END");
    console.log("GROOM_BASE64_START");
    console.log(groomPart.inlineData.data);
    console.log("GROOM_BASE64_END");
  } else {
    console.error("Failed to generate images.");
  }
}

generateIcons();
