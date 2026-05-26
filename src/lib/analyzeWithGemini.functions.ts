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

export const analyzeWithGemini = createServerFn({ method: "POST" })
  .inputValidator((data: Input) => {
    if (!data || typeof data.pdfBase64 !== "string" || !data.pdfBase64) {
      throw new Error("pdfBase64 requerido");
    }
    return { pdfBase64: data.pdfBase64, contexto: data.contexto || {} };
  })
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY no está configurada");

    const base64 = data.pdfBase64.includes(",")
      ? data.pdfBase64.split(",")[1]
      : data.pdfBase64;

    const systemPrompt =
      "Eres un analista experto en startups latinoamericanas con experiencia en fondos como Kaszek, ALLVP, 500 LatAm y Endeavor. Analiza este pitch deck y devuelve SOLO el JSON sin texto adicional ni markdown. El contexto del founder es: " +
      JSON.stringify(data.contexto);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Gemini error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const json = await res.json();
    const text: string | undefined =
      json?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .filter(Boolean)
        .join("") ?? json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Respuesta vacía del modelo");

    try {
      return JSON.parse(text) as AnalysisResult;
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No se pudo parsear la respuesta del modelo");
      return JSON.parse(match[0]) as AnalysisResult;
    }
  });
