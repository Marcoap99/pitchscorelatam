import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — PitchScore AI" }] }),
  component: Dashboard,
});

const MOCK_ANALYSES = [
  { id: "1", name: "Pitch v3 — Serie Seed", date: "Hace 2 días", score: 72, etapa: "Seed" },
  { id: "2", name: "Pitch v2 — Serie Seed", date: "Hace 9 días", score: 64, etapa: "Seed" },
  { id: "3", name: "Pitch v1 — Serie Seed", date: "Hace 3 semanas", score: 51, etapa: "Seed" },
];

function Dashboard() {
  const latest = MOCK_ANALYSES[0].score;
  const previous = MOCK_ANALYSES[1].score;
  const delta = latest - previous;

  return (
    <div className="min-h-screen px-6 py-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
              Plan founder · Activo
            </p>
            <h1 className="text-3xl md:text-4xl">Tu historial de análisis</h1>
          </div>
          <Button asChild variant="hero" size="lg">
            <Link to="/analyze">
              <Plus />
              Nuevo análisis
            </Link>
          </Button>
        </div>

        {/* Evolution */}
        <div className="card-soft p-7 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <h2 className="text-xl font-display font-semibold">Evolución del score</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Comparación de las últimas 3 versiones
              </p>
            </div>
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                delta >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
              }`}
            >
              {delta >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
              {delta >= 0 ? "+" : ""}
              {delta} puntos vs versión anterior
            </div>
          </div>

          {/* Simple line chart */}
          <div className="relative h-40">
            <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                points={MOCK_ANALYSES
                  .slice()
                  .reverse()
                  .map((a, i) => {
                    const x = (i / (MOCK_ANALYSES.length - 1)) * 290 + 5;
                    const y = 100 - a.score;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
              {MOCK_ANALYSES.slice().reverse().map((a, i) => {
                const x = (i / (MOCK_ANALYSES.length - 1)) * 290 + 5;
                const y = 100 - a.score;
                return <circle key={a.id} cx={x} cy={y} r="3.5" fill="var(--color-primary)" />;
              })}
            </svg>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {MOCK_ANALYSES.map((a) => (
            <Link
              key={a.id}
              to="/analyze/results"
              className="card-soft p-5 flex items-center justify-between gap-4 hover:border-ink/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold truncate">{a.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {a.date} · Etapa {a.etapa}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-bold text-primary">
                  {a.score}
                  <span className="text-sm text-muted-foreground">/100</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
