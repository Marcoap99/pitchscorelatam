import { createServerFn } from "@tanstack/react-start";

export type Recomendacion = {
  prioridad: number;
  titulo: string;
  descripcion: string;
  impacto: "alto" | "medio" | "bajo";
  fuente?: string;
};

export type AnalysisResult = {
  score_global: number;
  scores: {
    claridad_problema: { score: number; justificacion: string; insight_principal: string };
    mercado: { score: number; justificacion: string; insight_principal: string };
    equipo: { score: number; justificacion: string; insight_principal: string };
    traccion: { score: number; justificacion: string; insight_principal: string };
  };
  recomendaciones: Recomendacion[];
  benchmark_latam: {
    etapa_evaluada: string;
    criterios_clave: string[];
    fortaleza_principal: string;
    gap_principal: string;
  };
  veredicto_inversor: string;
};

type Contexto = {
  etapa?: string;
  pais?: string;
  monto?: string;
  traccion?: string;
  inversor?: string;
};

type Respuestas = {
  problema?: string;
  solucion?: string;
  traccion?: string;
  equipo?: string;
};

type Input = { contexto: Contexto; respuestas: Respuestas };

function criteriosPorInversor(inversor: string): string {
  const i = inversor || "";
  if (i.includes("Ángeles") || i.includes("Angeles")) {
    return "Priorizas equipo y background fundadores sobre todo lo demás. En etapa temprana el equipo ES el producto. Buscas founders con experiencia directa en el problema, capacidad de ejecución demostrada y resiliencia. Los unit economics no son críticos aún.";
  }
  if (i.includes("Aceleradoras")) {
    return "Piensas como YC o Endeavor. Buscas crecimiento semana a semana aunque sea pequeño, 'why us' muy claro, y un problema grande. Preguntas: ¿están haciendo algo que la gente quiere? ¿Crecen? ¿Por qué este equipo?";
  }
  if (i.includes("Fondos VC LATAM")) {
    return "Piensas como Kaszek, ALLVP o 500 LatAm. Buscas tracción real con métricas de negocio (MRR, retención cohorte M2-M3, CAC/LTV aunque sea preliminar). El mercado debe estar aterrizado en LATAM con SAM/SOM específico, no TAM global. Valoras founders que conocen su regulación local.";
  }
  if (i.includes("internacionales")) {
    return "Piensas como a16z, Softbank o fondos globales mirando LATAM. Buscas potencial de escala regional o global, diferenciación técnica o de modelo, y un path claro a Serie A con métricas internacionales.";
  }
  return "Combinas el criterio de fondos LATAM y aceleradoras: buscas equipo con experiencia en el problema, tracción real aunque sea pequeña, y una tesis clara de por qué este equipo gana en LATAM.";
}

export const analyzeWithGroq = createServerFn({ method: "POST" })
  .inputValidator((data: Input) => {
    if (!data || !data.respuestas) throw new Error("respuestas requeridas");
    return { contexto: data.contexto || {}, respuestas: data.respuestas };
  })
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const apiKey =
      process.env.GROQ_API_KEY ||
      (typeof import.meta !== "undefined"
        ? (import.meta as any).env?.VITE_GROQ_API_KEY
        : undefined);
    if (!apiKey) throw new Error("GROQ_API_KEY no está configurada");

    const { contexto, respuestas } = data;
    const inversor = contexto.inversor || "Aún no lo definimos";
    const pais = contexto.pais || "LATAM";
    const etapa = contexto.etapa || "Seed";
    const criterios = criteriosPorInversor(inversor);

    const systemPrompt = `Eres un analista senior de inversiones especializado en startups latinoamericanas. Evalúas exactamente como lo haría un partner de ${inversor} en ${pais}.

${criterios}

Contexto de mercado LATAM que debes considerar:
- Los fondos LATAM top (Kaszek, ALLVP, 500 LatAm, Endeavor) en 2024-2025 priorizan: retención sobre crecimiento, unit economics desde etapa temprana, y founders con experiencia operativa previa en el sector.
- En LATAM la regulación es fragmentada: lo que funciona en México puede no funcionar en Perú. Los fondos valoran founders que entienden su contexto regulatorio local.
- El ecosistema LATAM está madurando: los inversores ya no aceptan métricas de vanidad (downloads, signups). Quieren MRR, retención cohorte y path to profitability.
- Para etapa ${etapa} en LATAM, genera un benchmark específico realista para esa etapa.

Devuelve SOLO JSON válido sin texto adicional ni markdown.`;

    const userPrompt = `Analiza esta startup y devuelve exactamente este JSON:
{
  "score_global": number (0-100),
  "scores": {
    "claridad_problema": { "score": number (0-10), "justificacion": string (2-3 oraciones específicas sobre LO QUE DIJERON, no genérico), "insight_principal": string (1 acción concreta y específica para mejorar este punto ante ${inversor}) },
    "mercado": { "score": number, "justificacion": string, "insight_principal": string },
    "equipo": { "score": number, "justificacion": string, "insight_principal": string },
    "traccion": { "score": number, "justificacion": string, "insight_principal": string }
  },
  "recomendaciones": [
    { "prioridad": 1, "titulo": string, "descripcion": string (específica para ${inversor} en ${pais}, menciona qué cambiar exactamente), "impacto": "alto"|"medio"|"bajo", "fuente": string (ej: "Criterio público de Kaszek 2024" o "Estándar YC batch W25" o "Benchmark 500 LatAm para etapa Seed") },
    { "prioridad": 2, "titulo": string, "descripcion": string, "impacto": "alto"|"medio"|"bajo", "fuente": string },
    { "prioridad": 3, "titulo": string, "descripcion": string, "impacto": "alto"|"medio"|"bajo", "fuente": string }
  ],
  "benchmark_latam": {
    "etapa_evaluada": string,
    "criterios_clave": string[] (3 criterios específicos del tipo de inversor seleccionado),
    "fortaleza_principal": string (basada en lo que realmente dijeron),
    "gap_principal": string (el gap más crítico para ${inversor} específicamente)
  },
  "veredicto_inversor": string (2-3 oraciones como si fueras el inversor hablándole directamente al founder: qué te gustó, qué te falta para decir sí, qué haría que lo reconsideres. Tono directo y honesto, no genérico)
}

Contexto del founder:
- Etapa: ${etapa}
- País: ${pais}
- Monto buscado: ${contexto.monto || "no especificado"}
- Tracción actual: ${contexto.traccion || "no especificado"}
- Tipo de inversor objetivo: ${inversor}

Respuestas del founder:
PROBLEMA Y POR QUÉ AHORA: ${respuestas.problema || ""}
SOLUCIÓN Y VENTAJA COMPETITIVA: ${respuestas.solucion || ""}
TRACCIÓN Y MÉTRICAS: ${respuestas.traccion || ""}
EQUIPO Y UNFAIR ADVANTAGE: ${respuestas.equipo || ""}`;

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
