import { createServerFn } from "@tanstack/react-start";

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

type Input = { pdfBase64: string; contexto: Record<string, unknown> };

export const analyzeWithGroq = createServerFn({ method: "POST" })
  .inputValidator((data: Input) => {
    if (!data || typeof data.pdfBase64 !== "string" || !data.pdfBase64) {
      throw new Error("pdfBase64 requerido");
    }
    return { pdfBase64: data.pdfBase64, contexto: data.contexto || {} };
  })
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const apiKey =
      process.env.GROQ_API_KEY ||
      (typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_GROQ_API_KEY : undefined);
    if (!apiKey) throw new Error("GROQ_API_KEY no está configurada");

    const base64 = data.pdfBase64.includes(",")
      ? data.pdfBase64.split(",")[1]
      : data.pdfBase64;

    const pdfBuffer = Buffer.from(base64, "base64");

    // Extract text from PDF
    const pdfParseMod: any = await import("pdf-parse");
    const pdfParse = pdfParseMod.default || pdfParseMod;
    const parsed = await pdfParse(pdfBuffer);
    const textoExtraido: string = (parsed.text || "").slice(0, 60000);

    const systemPrompt =
      "Eres un analista experto en startups latinoamericanas con experiencia en fondos como Kaszek, ALLVP, 500 LatAm y Endeavor. Analiza pitch decks y devuelves SOLO JSON válido, sin texto adicional, sin markdown, sin bloques de código.";

    const userPrompt =
      "Analiza este pitch deck y devuelve SOLO este JSON exacto: { score_global: number (0-100), scores: { claridad_problema: { score: number (0-10), justificacion: string, insight_principal: string }, mercado: { score: number (0-10), justificacion: string, insight_principal: string }, equipo: { score: number (0-10), justificacion: string, insight_principal: string }, traccion: { score: number (0-10), justificacion: string, insight_principal: string } }, recomendaciones: [ { prioridad: 1, titulo: string, descripcion: string, impacto: 'alto'|'medio'|'bajo' }, { prioridad: 2, titulo: string, descripcion: string, impacto: 'alto'|'medio'|'bajo' }, { prioridad: 3, titulo: string, descripcion: string, impacto: 'alto'|'medio'|'bajo' } ], benchmark_latam: { etapa_evaluada: string, criterios_clave: string[], fortaleza_principal: string, gap_principal: string } } Contexto del founder: " +
      JSON.stringify(data.contexto) +
      " Texto del pitch deck: " +
      textoExtraido;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Groq error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const json = await res.json();
    const text: string | undefined = json?.choices?.[0]?.message?.content;
    if (!text) throw new Error("Respuesta vacía del modelo");

    try {
      return JSON.parse(text) as AnalysisResult;
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No se pudo parsear la respuesta del modelo");
      return JSON.parse(match[0]) as AnalysisResult;
    }
  });
