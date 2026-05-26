import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Download, RefreshCw, Share2, ArrowLeft, UserRound } from "lucide-react";
import { getState, resetState } from "@/lib/analyze-store";

export const Route = createFileRoute("/analyze/results")({
  head: () => ({ meta: [{ title: "Tu análisis completo — PitchScore AI" }] }),
  component: ResultsPage,
});

function ResultsPage() {
  const navigate = useNavigate();
  const state = typeof window !== "undefined" ? getState() : { contexto: {} as any, resultado: undefined as any };
  const r = state.resultado;

  useEffect(() => {
    if (!r) navigate({ to: "/analyze" });
  }, [r, navigate]);

  if (!r) return null;

  const scoreColor =
    r.score_global >= 80 ? "text-success" : r.score_global >= 60 ? "text-warning" : "text-destructive";
  const scoreBand =
    r.score_global >= 80 ? "por encima del" : r.score_global >= 60 ? "en línea con el" : "por debajo del";

  const dims = [
    { key: "Claridad del problema", ...r.scores.claridad_problema },
    { key: "Mercado", ...r.scores.mercado },
    { key: "Equipo", ...r.scores.equipo },
    { key: "Tracción", ...r.scores.traccion },
  ];

  return (
    <div className="min-h-screen px-6 py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink mb-6"
        >
          <ArrowLeft className="size-4" />
          Inicio
        </Link>

        {/* Header / Score global */}
        <div className="card-soft p-8 md:p-10 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
                Score global
              </p>
              <p className={`font-display text-6xl md:text-8xl font-bold leading-none ${scoreColor}`}>
                {r.score_global}
                <span className="text-3xl text-muted-foreground">/100</span>
              </p>
            </div>
            <div className="md:border-l md:border-ink/10 md:pl-6 flex-1">
              <p className="text-lg leading-snug">
                Tu deck está <strong>{scoreBand}</strong> promedio LATAM para rondas{" "}
                <strong>{state.contexto?.etapa || "Seed"}</strong>.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Analizado contra criterios de Kaszek, 500 LatAm, ALLVP y aceleradoras como YC y
                Endeavor.
              </p>
            </div>
          </div>
        </div>

        {/* 4 dimensions */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {dims.map((d) => (
            <div key={d.key} className="card-soft p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-display font-semibold">{d.key}</h3>
                <p className="font-display text-3xl font-bold text-primary">
                  {d.score}
                  <span className="text-sm text-muted-foreground">/10</span>
                </p>
              </div>
              <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden mb-4">
                <div className="h-full bg-primary" style={{ width: `${d.score * 10}%` }} />
              </div>
              <p className="text-sm leading-relaxed text-ink/80">{d.justificacion}</p>
              <div className="mt-4 rounded-xl bg-primary/8 border border-primary/15 p-4">
                <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1.5">
                  Insight
                </p>
                <p className="text-sm">{d.insight_principal}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Veredicto del inversor */}
        {r.veredicto_inversor && (
          <div className="rounded-3xl bg-ink text-cream p-7 md:p-8 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <UserRound className="size-5 text-cream/80" />
              <p className="text-xs uppercase tracking-widest text-cream/60 font-semibold">
                Lo que diría un partner de {state.contexto?.inversor || "fondo LATAM"}
              </p>
            </div>
            <p className="text-lg md:text-xl leading-relaxed text-cream italic">
              &ldquo;{r.veredicto_inversor}&rdquo;
            </p>
          </div>
        )}


        {/* Benchmark */}
        <div className="card-soft p-7 mb-6">
          <h2 className="text-xl font-display font-semibold mb-1">Benchmark LATAM</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Etapa evaluada: <strong>{r.benchmark_latam.etapa_evaluada}</strong>
          </p>
          <div className="mb-5">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">
              Criterios clave en esta etapa
            </p>
            <ul className="space-y-2">
              {r.benchmark_latam.criterios_clave.map((c: string) => (
                <li key={c} className="flex items-start gap-2 text-sm">
                  <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-success/10 border border-success/20 p-4">
              <p className="text-xs uppercase tracking-widest font-semibold text-success mb-2">
                Fortaleza principal
              </p>
              <p className="text-sm">{r.benchmark_latam.fortaleza_principal}</p>
            </div>
            <div className="rounded-xl bg-warning/10 border border-warning/20 p-4">
              <p className="text-xs uppercase tracking-widest font-semibold text-warning mb-2">
                Gap principal
              </p>
              <p className="text-sm">{r.benchmark_latam.gap_principal}</p>
            </div>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Benchmarks basados en criterios de fondos LATAM activos. Estudio completo disponible en
            Q3 2026.
          </p>
        </div>

        {/* Recomendaciones */}
        <div className="card-soft p-7 mb-8">
          <h2 className="text-xl font-display font-semibold mb-5">
            3 recomendaciones priorizadas
          </h2>
          <div className="space-y-4">
            {r.recomendaciones.map((rec: { prioridad: number, titulo: string, descripcion: string, impacto: string, fuente?: string }) => (
              <div key={rec.prioridad} className="flex gap-4 p-4 rounded-xl border border-ink/10">
                <div className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-display font-bold shrink-0">
                  {rec.prioridad}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-semibold">{rec.titulo}</h3>
                    <span
                      className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                        rec.impacto === "alto"
                          ? "bg-success/15 text-success"
                          : rec.impacto === "medio"
                            ? "bg-warning/15 text-warning"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      Impacto {rec.impacto}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {rec.descripcion}
                  </p>
                  {rec.fuente && (
                    <p className="text-xs text-muted-foreground/70 mt-2 italic">
                      Basado en: {rec.fuente}
                    </p>
                  )}
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <Button variant="hero" size="lg" className="w-full sm:w-auto">
            <Download />
            Descargar PDF del análisis
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => {
              resetState();
              navigate({ to: "/analyze" });
            }}
          >
            <RefreshCw />
            Analizar nueva versión
          </Button>
          <Button variant="ghost" size="lg" className="w-full sm:w-auto">
            <Share2 />
            Compartir link
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">
        {label}
      </p>
      <p className="font-display font-semibold text-ink">{value}</p>
    </div>
  );
}
