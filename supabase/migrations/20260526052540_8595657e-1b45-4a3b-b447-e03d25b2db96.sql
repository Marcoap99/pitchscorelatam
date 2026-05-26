CREATE TABLE public.analisis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  etapa TEXT,
  pais TEXT,
  monto TEXT,
  traccion_contexto TEXT,
  inversor TEXT,
  problema TEXT,
  solucion TEXT,
  traccion_detalle TEXT,
  equipo TEXT,
  score_global INTEGER,
  score_problema INTEGER,
  score_mercado INTEGER,
  score_equipo INTEGER,
  score_traccion INTEGER,
  recomendaciones JSONB,
  benchmark JSONB,
  veredicto_inversor TEXT,
  resultado_completo JSONB
);

ALTER TABLE public.analisis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analisis"
  ON public.analisis FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read analisis"
  ON public.analisis FOR SELECT
  TO anon, authenticated
  USING (true);