import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please check your AI Studio Secrets configuration.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configure middleware to support large base64 image uploads
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // API endpoint for plant, herb, and disease analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { image, language, mode = 'plant' } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image data is required" });
      }

      let mimeType = "image/jpeg";
      let base64Data = "";

      // Handle Image URL (like preset samples) or base64 uploads
      if (image.startsWith("http://") || image.startsWith("https://")) {
        console.log(`Fetching remote preset image: ${image}`);
        const fetchRes = await fetch(image);
        if (!fetchRes.ok) {
          throw new Error(`Failed to fetch preset image: ${fetchRes.statusText}`);
        }
        const arrayBuffer = await fetchRes.arrayBuffer();
        base64Data = Buffer.from(arrayBuffer).toString("base64");
        mimeType = fetchRes.headers.get("content-type") || "image/jpeg";
      } else if (image.startsWith("data:")) {
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        } else {
          base64Data = image; // fallback
        }
      } else {
        base64Data = image;
      }

      const ai = getGeminiClient();

      // Language translation / generation context instructions
      let langPrompt = "";
      if (language === "hindi") {
        langPrompt = "Write all descriptive text fields (description, originOrCause, treatmentOrCure, usageOrCare, funFact) exclusively in high-quality Devanagari Hindi (हिंदी). Do NOT use English script for these fields. Ensure the words are natural, compassionate, and clear for a local resident or patient.";
      } else if (language === "hinglish") {
        langPrompt = "Write all descriptive text fields (description, originOrCause, treatmentOrCure, usageOrCare, funFact) in natural, conversational Hinglish using the Latin script (e.g., 'Yeh skin condition dry skin ya allergic reaction ki wajah se ho sakti hai. Isme daily moisture maintain karna aur neem paste lagana useful hai...'). Use common Latin letters. Do NOT write in Devanagari Hindi script when Hinglish is chosen.";
      } else {
        langPrompt = "Write all descriptive text fields (description, originOrCause, treatmentOrCure, usageOrCare, funFact) in clear, highly detailed, and professional English.";
      }

      let systemInstruction = "";
      let prompt = "";

      if (mode === 'body') {
        systemInstruction = `You are an expert dermatological advisor, clinical symptoms consultant, wellness and traditional home remedies (Gharelu Nuskhe/Ayurvedic) expert.
Analyze the image uploaded by the user. It will contain a human body part, skin condition, rash, insect bite, irritation, wound, swelling, acne, or physical symptom.
Identify what is shown in the image and provide comprehensive, empathetic, and scientifically accurate symptom guidance.

CRITICAL SAFETY DIRECTIVE:
You MUST ALWAYS include a clear, prominent medical disclaimer at the end or integrated within the instructions (e.g., "यह जानकारी केवल शैक्षणिक उद्देश्य के लिए है। कृपया डॉक्टर से अवश्य परामर्श लें।" or "This is for informational purposes only; consult a physician.").
${langPrompt}

You MUST output your response strictly in raw JSON format matching the specified schema. Ensure all fields are filled with comprehensive details based on the image, avoiding brief or vague summaries. Do not wrap the JSON output with markdown code blocks (\`\`\`json or \`\`\`). Your output must be a clean parseable JSON string.`;

        prompt = `Perform a comprehensive clinical and home-remedy symptom analysis on this body/skin image.
Identify:
- The possible skin disease / symptom / irritation name, medical terms, and descriptions.
- Its trigger factors, causes, or underlying issues (e.g., bacterial, fungal, allergic, friction, heat).
- Comprehensive home remedies (e.g., coconut oil, aloe vera, neem, turmeric) AND standard OTC general treatments (like antiseptic creams, soothing lotions).
- Precautionary care, clean hygiene tips, and critical red-flag signs showing when they MUST seek immediate emergency professional medical care.

Strictly generate a JSON object structured exactly like this:
{
  "category": "Human Body Issue",
  "commonName": "Common Name of the skin issue/symptom (e.g. Ringworm / Dad / दाद, Heat Rash / Ghamori)",
  "scientificName": "Medical / Dermatological term (e.g. Tinea corporis, Miliaria rubra, Acne vulgaris)",
  "localNames": "Hindi, English and common regional synonyms (e.g. Dad, Khaj, Khujli, Muhase, Ghamori)",
  "description": "Provide a thorough and clear overview of this skin condition, explaining how it looks, its typical sensation (itching, burning, mild pain), and what it is.",
  "originOrCause": "What causes this condition (fungal infection, allergy, hot humid climate, blocked sweat glands, bacterial build-up) and how it gets triggered or aggravated.",
  "treatmentOrCure": "Rich step-by-step remedies focusing on natural home treatments (aloe vera, cold compress, neem paste, turmeric antiseptic wash) and also safe standard over-the-counter options (antifungal ointments, calamine lotion). *MUST INCLUDE A CLEAR MEDICAL DISCLAIMER stating this is for educational information and is NOT a substitute for professional medical advice.*",
  "usageOrCare": "Detailed self-care instructions: how to apply the remedy, hygiene practices to prevent spreading (e.g., don't scratch, wear loose cotton clothes, wash sheets, avoid strong soaps), and red-flag symptoms that require a direct doctor's visit.",
  "funFact": "A useful wellness tip, healthy dietary advice, or interesting fact about skin biology, hydration, or healthy immune care.",
  "confidenceScore": 88
}`;
      } else {
        // Mode === 'plant'
        systemInstruction = `You are an expert botanist, traditional Ayurvedic herbalist (Jadi-Buti specialist), organic plant gardener, and agricultural plant pathologist.
Analyze the image uploaded by the user. It will contain either:
1. A healthy plant, tree, or medicinal herb (jadi-buti).
2. A plant disease, pest damage, mold, rot, or agricultural crop problem.
3. A screen capture/screenshot containing plant information or an outdoor leaf photo.

Your task is to identify what is shown and provide fully accurate, deep botanical and disease insights.
${langPrompt}

You MUST output your response strictly in raw JSON format matching the specified schema. Ensure all fields are filled with comprehensive details based on the image, avoiding brief or vague summaries. Do not wrap the JSON output with markdown code blocks (\`\`\`json or \`\`\`). Your output must be a clean parseable JSON string.`;

        prompt = `Perform a comprehensive analysis on this image.
Identify either:
- The plant / medicinal herb (jadi buti) name, botanical properties, organic care, benefits, and how to consume or use it.
- OR the plant disease / pest infestation / physical stress, its cause, and both organic/natural and chemical remedies.

Strictly generate a JSON object structured exactly like this:
{
  "category": "Plant/Herb" or "Plant Disease" or "Other/Unknown",
  "commonName": "Common Name of the plant, herb, or plant disease",
  "scientificName": "Botanical / scientific name of the plant or disease pathogen (e.g. Ocimum tenuiflorum, Alternaria solani)",
  "localNames": "Hindi, English and popular local names of the item (e.g. Tulsi / Holy Basil / तुलसी)",
  "description": "Provide a thorough and rich overview of what this item is, explaining its main characteristics, importance, and appearance.",
  "originOrCause": "For healthy plants/herbs: Where does it grow/originate, what are its preferred weather/soil conditions. For diseases/pests: What caused this disease (fungi, bacteria, pests, overwatering, humidity, nutrient deficiency) and how it spreads.",
  "treatmentOrCure": "For plant diseases/pest: Rich step-by-step remedies focusing heavily on organic and natural treatments (e.g., neem spray, baking soda, milk spray, manual removal) and also mentioning effective standard agricultural chemical treatments if critical. For healthy plants/herbs: How to cultivate, soil mixture, and water requirements.",
  "usageOrCare": "For herbs/plants: Detailed usage instructions, medicinal recipes (e.g., tulsi tea preparation, safe dosage, skin paste) or precautions. For diseases: Safe guidelines to prevent future outbreaks and protect surrounding plants.",
  "funFact": "An interesting botanical fact, gardening tip, traditional Ayurvedic secret, or piece of folklore related to this item.",
  "confidenceScore": 95
}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          prompt
        ],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
        }
      });

      const jsonText = response.text || "{}";
      
      // Clean up potential markdown wrappers
      let cleanedJson = jsonText.trim();
      if (cleanedJson.startsWith("```json")) {
        cleanedJson = cleanedJson.substring(7);
      }
      if (cleanedJson.startsWith("```")) {
        cleanedJson = cleanedJson.substring(3);
      }
      if (cleanedJson.endsWith("```")) {
        cleanedJson = cleanedJson.substring(0, cleanedJson.length - 3);
      }
      cleanedJson = cleanedJson.trim();

      let resultObj;
      try {
        resultObj = JSON.parse(cleanedJson);
      } catch (parseErr) {
        console.error("JSON parsing error on Gemini response:", cleanedJson, parseErr);
        // Fallback robust object
        resultObj = {
          category: mode === 'body' ? "Human Body Issue" : "Other/Unknown",
          commonName: mode === 'body' ? "Symptom Diagnosis Needed" : "Analyzer Update Required",
          scientificName: "N/A",
          localNames: "N/A",
          description: "We couldn't parse structured JSON data from the model. Here is the raw output: " + jsonText,
          originOrCause: "Check if the image clearly displays the skin rash, symptom, or body issue.",
          treatmentOrCure: "Try re-taking the picture with better lighting and closer focus.",
          usageOrCare: "Always verify medical recommendations with a real healthcare physician.",
          funFact: "Did you know that drinking adequate water can solve up to 60% of common skin irritation issues?",
          confidenceScore: 40
        };
      }

      res.json(resultObj);
    } catch (error: any) {
      console.error("Analysis route error:", error);
      res.status(500).json({ error: error.message || "An unexpected error occurred during image analysis." });
    }
  });

  // Serve static assets based on environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
