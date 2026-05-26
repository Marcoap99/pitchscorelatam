// NOTE: La API key está expuesta en el cliente. Mover a un server function cuando sea posible.
const GEMINI_API_KEY = "AIzaSyBaQVRfb8A-vFfojTKexw0vWXDk6G4z9K0";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export type AnalysisResult = {
  score_global: number;
  scores: {
    claridad_problema: { score: number; justificacion: string; insight_principal: string };
    mercado: { score: number; justificacion: string; insight_principal: string };
    equipo: { score: number; justificacion: string; insight_principal: string };
    traccion: { score: number; justificacion: string; insight_principal: string };
  };
  recomendaciones: Array<{
    prioridad: number;
    titulo: string;
    descripcion: string;
    impacto: "alto" | "medio" | "bajo";
  }>;
  benchmark_latam: {
    etapa_evaluada: string;
    criterios_clave: string[];
    fortaleza_principal: string;
    gap_principal: string;
  };
};

export async function analyzeWithGemini(
  pdfBase64: string,
  contexto: object
): Promise<AnalysisResult> {
  const systemPrompt =
    "Eres un analista experto en startups latinoamericanas con experiencia en fondos como Kaszek, ALLVP, 500 LatAm y Endeavor. Analiza este pitch deck y devuelve SOLO un JSON con esta estructura exacta:\n" +
    "{\n" +
    "  score_global: number (0-100),\n" +
    "  scores: {\n" +
    "    claridad_problema: { score: number (0-10), justificacion: string, insight_principal: string },\n" +
    "    mercado: { score: number (0-10), justificacion: string, insight_principal: string },\n" +
    "    equipo: { score: number (0-10), justificacion: string, insight_principal: string },\n" +
    "    traccion: { score: number (0-10), justificacion: string, insight_principal: string }\n" +
    "  },\n" +
    "  recomendaciones: [\n" +
    "    { prioridad: 1, titulo: string, descripcion: string, impacto: 'alto'|'medio'|'bajo' },\n" +
    "    { prioridad: 2, titulo: string, descripcion: string, impacto: 'alto'|'medio'|'bajo' },\n" +
    "    { prioridad: 3, titulo: string, descripcion: string, impacto: 'alto'|'medio'|'bajo' }\n" +
    "  ],\n" +
    "  benchmark_latam: {\n" +
    "    etapa_evaluada: string,\n" +
    "    criterios_clave: string[],\n" +
    "    fortaleza_principal: string,\n" +
    "    gap_principal: string\n" +
    "  }\n" +
    "}\n" +
    "El contexto del founder es: " +
    JSON.stringify(contexto);

  // Strip data URL prefix if present
  const base64 = pdfBase64.includes(",") ? pdfBase64.split(",")[1] : pdfBase64;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt },
          { inline_data: { mime_type: "application/pdf", data: base64 } },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.4,
    },
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join("") ??
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Respuesta vacía del modelo");

  // Try direct parse, fallback to extracting JSON block
  try {
    return JSON.parse(text) as AnalysisResult;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No se pudo parsear la respuesta del modelo");
    return JSON.parse(match[0]) as AnalysisResult;
  }
}
