import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { MOCK_RESULT } from "@/lib/analyze-store";

export const Route = createFileRoute("/results/$id")({
  head: () => ({ meta: [{ title: "Análisis compartido — PitchScore AI" }] }),
  component: SharedResults,
});

function SharedResults() {
  const r = MOCK_RESULT;
  const dims = [
    { key: "Claridad del problema", score: r.scores.claridad_problema.score },
    { key: "Mercado", score: r.scores.mercado.score },
    { key: "Equipo", score: r.scores.equipo.score },
    { key: "Tracción", score: r.scores.traccion.score },
  ];

  return (
    <div className="min-h-screen px-6 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
            Análisis compartido
          </p>
          <p className={`font-display text-7xl font-bold ${r.score_global >= 80 ? "text-success" : r.score_global >= 60 ? "text-warning" : "text-destructive"}`}>
            {r.score_global}
            <span className="text-3xl text-muted-foreground">/100</span>
          </p>
          <p className="text-muted-foreground mt-2">Score global</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {dims.map((d) => (
            <div key={d.key} className="card-soft p-5">
              <p className="text-sm text-muted-foreground mb-2">{d.key}</p>
              <p className="font-display text-3xl font-bold text-primary">
                {d.score}
                <span className="text-sm text-muted-foreground">/10</span>
              </p>
              <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden mt-3">
                <div className="h-full bg-primary" style={{ width: `${d.score * 10}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card-soft p-7 mb-8">
          <h2 className="font-display font-semibold text-xl mb-5">Recomendaciones principales</h2>
          <div className="space-y-3">
            {r.recomendaciones.map((rec) => (
              <div key={rec.prioridad} className="flex gap-3 items-start">
                <span className="size-7 rounded-full bg-primary text-primary-foreground grid place-items-center font-display font-bold text-sm shrink-0">
                  {rec.prioridad}
                </span>
                <p className="text-sm pt-1">{rec.titulo}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-ink text-cream p-8 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl text-cream">
            Analiza tu propio deck gratis
          </h2>
          <p className="mt-3 text-cream/70">
            Recibe tu análisis con criterios reales de fondos LATAM.
          </p>
          <Button asChild size="lg" className="mt-6 bg-cream text-ink hover:bg-cream/90">
            <Link to="/">
              Empezar análisis
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
