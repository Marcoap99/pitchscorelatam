import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, Lock, Sparkles, ArrowRight } from "lucide-react";
import { getState, MOCK_RESULT, setState } from "@/lib/analyze-store";

export const Route = createFileRoute("/analyze/preview")({
  head: () => ({ meta: [{ title: "Vista previa — PitchScore AI" }] }),
  component: PreviewPage,
});

function PreviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const state = typeof window !== "undefined" ? getState() : { contexto: {}, validacion: undefined };

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <LoadingState />;

  const claridad = MOCK_RESULT.scores.claridad_problema;
  const locked = [
    { key: "Mercado", ...MOCK_RESULT.scores.mercado },
    { key: "Equipo", ...MOCK_RESULT.scores.equipo },
    { key: "Tracción", ...MOCK_RESULT.scores.traccion },
  ];

  const unlock = () => {
    setState({ pagado: true });
    navigate({ to: "/analyze/results" });
  };

  return (
    <div className="min-h-screen px-6 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
            Paso 3 de 3
          </p>
          <h1 className="text-3xl md:text-4xl">Vista previa de tu análisis</h1>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning/15 text-warning text-xs font-semibold px-3 py-1.5">
            <Sparkles className="size-3.5" />
            1 de 4 dimensiones · Desbloquea el resto
          </span>
        </div>

        {/* Validación */}
        {state.validacion && (
          <div className="card-soft p-6 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Validación del deck
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-semibold text-success mb-2">Secciones presentes</p>
                <ul className="space-y-1.5">
                  {state.validacion.secciones_presentes.map((s) => (
                    <li key={s} className="flex items-center gap-2">
                      <Check className="size-4 text-success" />
                      <span className="capitalize">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {state.validacion.secciones_faltantes.length > 0 && (
                <div>
                  <p className="font-semibold text-warning mb-2">Secciones faltantes</p>
                  <ul className="space-y-1.5">
                    {state.validacion.secciones_faltantes.map((s) => (
                      <li key={s} className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-warning" />
                        <span className="capitalize">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Unlocked dimension */}
        <div className="card-soft p-7 mb-4">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Dimensión 1 de 4
              </p>
              <h2 className="text-2xl mt-1">Claridad del problema</h2>
            </div>
            <div className="text-right">
              <p className="font-display text-4xl font-bold text-primary leading-none">
                {claridad.score}
                <span className="text-lg text-muted-foreground">/10</span>
              </p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-ink/10 overflow-hidden mb-5">
            <div
              className="h-full bg-primary"
              style={{ width: `${claridad.score * 10}%` }}
            />
          </div>
          <p className="text-sm leading-relaxed text-ink/80">{claridad.justificacion}</p>
          <div className="mt-5 rounded-2xl bg-primary/10 border border-primary/15 p-5">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
              Insight accionable
            </p>
            <p className="text-sm text-ink">{claridad.insight_principal}</p>
          </div>
        </div>

        {/* Locked dimensions */}
        <div className="relative">
          <div className="grid gap-4">
            {locked.map((l) => (
              <div key={l.key} className="card-soft p-7 blur-locked">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl">{l.key}</h3>
                  <p className="font-display text-3xl font-bold text-primary">
                    {l.score}
                    <span className="text-base text-muted-foreground">/10</span>
                  </p>
                </div>
                <p className="text-sm">{l.justificacion}</p>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 grid place-items-center bg-background/40 rounded-2xl">
            <div className="flex flex-col items-center gap-2 rounded-full bg-ink text-cream px-6 py-3 font-semibold shadow-lg">
              <span className="flex items-center gap-2">
                <Lock className="size-4" />
                Desbloquea el análisis completo
              </span>
            </div>
          </div>
        </div>

        {/* Paywall */}
        <div className="mt-12 rounded-3xl bg-ink text-cream p-6 md:p-10">
          <h2 className="text-3xl text-cream max-w-md">
            Ve todo lo que está bloqueando tu ronda
          </h2>
          <p className="mt-3 text-cream/70 max-w-xl">
            Scores en las 4 dimensiones · 3 recomendaciones priorizadas · Benchmarks LATAM · PDF
            descargable para compartir con tu co-founder.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mt-8">
            {/* One-time */}
            <div className="rounded-2xl border border-cream/15 p-5 flex flex-col">
              <p className="text-sm text-cream/60">Análisis único</p>
              <p className="font-display text-4xl font-bold mt-2">
                $9 <span className="text-base font-normal text-cream/60">USD</span>
              </p>
              <p className="text-sm text-cream/60 mt-1">Un análisis, para siempre</p>
              <ul className="mt-5 space-y-2 text-sm text-cream/80">
                <Feature dark>Reporte completo en PDF</Feature>
                <Feature dark>Validación del repositorio si aplica</Feature>
                <Feature dark>3 recomendaciones priorizadas</Feature>
                <Feature dark>Benchmarks LATAM</Feature>
              </ul>
              <Button
                onClick={unlock}
                size="lg"
                className="mt-6 bg-cream text-ink hover:bg-cream/90 w-full"
              >
                Pagar $9 y ver el análisis
              </Button>
            </div>

            {/* Subscription */}
            <div className="rounded-2xl bg-cream text-ink p-5 flex flex-col relative">
              <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold px-3 py-1">
                Más popular ⭐
              </span>
              <p className="text-sm text-muted-foreground">Plan founder</p>
              <p className="font-display text-4xl font-bold mt-2">
                $29 <span className="text-base font-normal text-muted-foreground">/mes</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">Análisis ilimitados</p>
              <ul className="mt-5 space-y-2 text-sm">
                <Feature>Análisis ilimitados</Feature>
                <Feature>Historial y comparación de versiones</Feature>
                <Feature>Benchmarks actualizados</Feature>
                <Feature>Acceso anticipado a nuevas funciones</Feature>
              </ul>
              <Button onClick={unlock} variant="hero" size="lg" className="mt-6 w-full">
                Suscribirme por $29/mes
                <ArrowRight />
              </Button>
            </div>
          </div>

          <p className="mt-6 text-xs text-cream/50 text-center">
            Pago seguro con Stripe · Cancelar en cualquier momento · Precios en USD
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <li className="flex items-start gap-2">
      <Check className={`size-4 mt-0.5 shrink-0 ${dark ? "text-success" : "text-success"}`} />
      <span>{children}</span>
    </li>
  );
}

function LoadingState() {
  const messages = [
    "Leyendo tu deck...",
    "Analizando el mercado...",
    "Comparando con benchmarks LATAM...",
    "Preparando recomendaciones...",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % messages.length), 600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="text-center">
        <div className="mx-auto size-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
        <p className="font-display font-semibold text-xl">{messages[i]}</p>
        <p className="text-sm text-muted-foreground mt-2">Esto toma 60 segundos en promedio</p>
      </div>
    </div>
  );
}
