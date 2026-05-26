// Simple session-storage backed store for the analyze flow.
export type Contexto = {
  etapa?: string;
  pais?: string;
  monto?: string;
  traccion?: string;
  inversor?: string;
};

export type Respuestas = {
  problema?: string;
  solucion?: string;
  traccion?: string;
  equipo?: string;
};

export type AnalyzeState = {
  contexto: Contexto;
  respuestas: Respuestas;
  validacion?: {
    slides_detectados: number;
    secciones_presentes: string[];
    secciones_faltantes: string[];
  };
  pagado?: boolean;
  resultado?: any;
};

const KEY = "pitchscore.analyze";

export function getState(): AnalyzeState {
  if (typeof window === "undefined") return { contexto: {}, respuestas: {} };
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { contexto: {}, respuestas: {}, ...parsed };
  } catch {
    return { contexto: {}, respuestas: {} };
  }
}

export function setState(patch: Partial<AnalyzeState>) {
  const next = { ...getState(), ...patch };
  sessionStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function resetState() {
  sessionStorage.removeItem(KEY);
}

// Mock analysis result kept for reference / fallback.
export const MOCK_RESULT = {
  score_global: 72,
  scores: {
    claridad_problema: { score: 8, justificacion: "", insight_principal: "" },
    mercado: { score: 6, justificacion: "", insight_principal: "" },
    equipo: { score: 7, justificacion: "", insight_principal: "" },
    traccion: { score: 5, justificacion: "", insight_principal: "" },
  },
  recomendaciones: [] as Array<{
    prioridad: number;
    titulo: string;
    descripcion: string;
    impacto: "alto" | "medio" | "bajo";
    fuente?: string;
  }>,
  benchmark_latam: {
    etapa_evaluada: "Seed",
    criterios_clave: [] as string[],
    fortaleza_principal: "",
    gap_principal: "",
  },
  veredicto_inversor: "",
};

