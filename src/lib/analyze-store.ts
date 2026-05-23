// Simple session-storage backed store for the analyze flow (mock data only).
export type Contexto = {
  etapa?: string;
  pais?: string;
  monto?: string;
  traccion?: string;
  inversor?: string;
};

export type AnalyzeState = {
  fileName?: string;
  fileSize?: number;
  githubUrl?: string;
  contexto: Contexto;
  validacion?: {
    slides_detectados: number;
    secciones_presentes: string[];
    secciones_faltantes: string[];
  };
  pagado?: boolean;
};

const KEY = "pitchscore.analyze";

export function getState(): AnalyzeState {
  if (typeof window === "undefined") return { contexto: {} };
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { contexto: {} };
  } catch {
    return { contexto: {} };
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

// Mock analysis result (used until Gemini is wired in the next prompt).
export const MOCK_RESULT = {
  score_global: 72,
  scores: {
    claridad_problema: {
      score: 8,
      justificacion:
        "El problema está bien articulado en la slide 2 con un caso concreto del mercado peruano. Falta cuantificar el dolor con datos secundarios (encuestas, reportes de la industria) que un inversor pueda verificar.",
      insight_principal:
        "Agrega 1-2 estadísticas verificables del problema en LATAM (ej. cifras de Statista, BID o cámaras de comercio locales). Eso convierte una narrativa en evidencia.",
    },
    mercado: {
      score: 6,
      justificacion:
        "Mencionas TAM global pero no aterrizas el SAM/SOM en LATAM. Los fondos regionales descartan decks que solo muestran números mundiales sin foco geográfico.",
      insight_principal:
        "Divide el mercado en TAM global, SAM LATAM y SOM (los países donde realmente operarás en 18 meses). Sé conservador y defendible.",
    },
    equipo: {
      score: 7,
      justificacion:
        "Founders con experiencia técnica relevante. Falta destacar 'why now / why us' — qué insight único tienen ustedes que un competidor no.",
      insight_principal:
        "Agrega una línea por founder con el 'unfair advantage' (ej. '5 años construyendo infra de pagos en Mercado Libre').",
    },
    traccion: {
      score: 5,
      justificacion:
        "Tracción temprana pero presentada con métricas de vanidad (downloads, signups). Para esta etapa los fondos LATAM esperan retención y revenue, no volumen.",
      insight_principal:
        "Reemplaza downloads por: MRR, retención cohorte M3, y CAC/LTV preliminar. Si son chicos los números, muéstralos con curva de crecimiento %.",
    },
  },
  recomendaciones: [
    {
      prioridad: 1,
      titulo: "Aterriza el mercado a LATAM con SAM/SOM",
      descripcion:
        "Reemplaza el slide de mercado global por un breakdown LATAM. Los fondos regionales necesitan ver que entiendes dónde puedes ganar realmente en los próximos 18 meses.",
      impacto: "alto",
    },
    {
      prioridad: 2,
      titulo: "Cambia métricas de vanidad por métricas de negocio",
      descripcion:
        "Quita downloads/signups del slide de tracción. Pon MRR, retención M3 y un CAC inicial aunque sea aproximado. Eso es lo que pregunta un partner de fondo.",
      impacto: "alto",
    },
    {
      prioridad: 3,
      titulo: "Agrega slide de financials proyectados",
      descripcion:
        "Tu deck no tiene proyecciones a 18 meses. Aunque sean asunciones, los inversores quieren ver cómo piensas usar el capital y cuándo llegarás al siguiente milestone.",
      impacto: "medio",
    },
  ],
  benchmark_latam: {
    etapa_evaluada: "Seed",
    criterios_clave: [
      "Retención de cohorte M3 superior a 35% en consumer / 70% en B2B",
      "Founders con experiencia previa en el sector o ejecución demostrada",
      "Mercado LATAM aterrizado, no solo TAM global",
    ],
    fortaleza_principal:
      "Tu equipo combina experiencia técnica con conocimiento del mercado local — eso es lo primero que validan los fondos LATAM.",
    gap_principal:
      "Falta narrativa de unit economics. Para Seed en LATAM, los fondos quieren ver que tienes un modelo que puede ser rentable, no solo crecer.",
  },
};
