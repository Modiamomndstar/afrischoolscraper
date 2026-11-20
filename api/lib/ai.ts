export type AIProvider = "gemini" | "openrouter";

interface AIRequestOptions {
  provider: AIProvider;
  model?: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
}

export async function getAICompletion(options: AIRequestOptions): Promise<string> {
  const { provider, prompt, systemPrompt, temperature = 0.7 } = options;

  if (provider === "gemini") {
    return callGemini(prompt, systemPrompt, temperature);
  } else if (provider === "openrouter") {
    let modelId = options.model || "meta-llama/llama-3-8b-instruct:free";
    // Map common names to OpenRouter specific IDs
    if (modelId === "gemini-1.5-flash") modelId = "google/gemini-flash-1.5";
    if (modelId === "gemini-1.5-pro") modelId = "google/gemini-pro-1.5";
    
    return callOpenRouter(prompt, systemPrompt, modelId, temperature);
  }


  throw new Error(`Unsupported AI provider: ${provider}`);
}

async function callGemini(prompt: string, systemPrompt?: string, temperature?: number): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt ? systemPrompt + "\n\n" : ""}${prompt}` }]
        }
      ],
      generationConfig: {
        temperature,
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callOpenRouter(prompt: string, systemPrompt?: string, model?: string, temperature?: number): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://github.com/afrischoolscraper",
      "X-Title": "Afrischool Scraper",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt }
      ],
      temperature,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function extractStructuredData<T>(
  html: string, 
  schema: string, 
  provider: AIProvider = "gemini",
  model?: string
): Promise<T> {
  const systemPrompt = `You are a specialized data extraction AI. Extract structured information from the provided HTML/Text according to the requested JSON schema. 
Return ONLY valid JSON. Do not include markdown code blocks or any other text.
If a field is not found, use null.`;

  const prompt = `Extract schools data from this content.
Schema: ${schema}

Content:
${html.slice(0, 15000)} // Limiting to avoid token limits`;

  const response = await getAICompletion({
    provider,
    model,
    prompt,
    systemPrompt,
    temperature: 0.1
  });

  try {
    // Clean up response if AI included markdown blocks
    const cleanJson = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson) as T;
  } catch (e) {
    console.error("Failed to parse AI JSON response:", response);
    throw new Error("AI returned invalid JSON");
  }
}

export async function normalizeLocation(
  rawLocation: string,
  country: string,
  provider: AIProvider = "gemini"
): Promise<{ state: string; lga?: string; city?: string }> {
  const systemPrompt = `You are a location normalization expert for African geography.
Standardize the provided raw location into a structured format.
Focus on accuracy for ${country}.
Return ONLY valid JSON.`;

  const prompt = `Normalize this location in ${country}: "${rawLocation}"
Return format: {"state": "string", "lga": "string", "city": "string"}`;

  const response = await getAICompletion({
    provider,
    prompt,
    systemPrompt,
    temperature: 0.1
  });

  try {
    const cleanJson = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    return { state: rawLocation }; // Fallback
  }
}

