import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, MessageCircle, BarChart3, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PitchScore AI — Análisis honesto de pitch decks para founders LATAM" },
      {
        name: "description",
        content:
          "Sube tu pitch deck y recibe un análisis basado en criterios reales de fondos LATAM en 60 segundos. Empieza gratis.",
      },
      { property: "og:title", content: "PitchScore AI — Análisis de pitch decks para LATAM" },
      {
        property: "og:description",
        content: "El primer analizador de pitch decks hecho para founders latinoamericanos.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="px-4 pt-12 pb-20 md:pt-28 md:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
            <span className="size-1.5 rounded-full bg-success" />
            Hecho para founders LATAM
          </div>
          <h1 className="text-4xl md:text-6xl leading-[1.05] text-ink">
            ¿Tu pitch deck convence a un inversor?
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Sube tu deck, recibe un análisis honesto en 60 segundos. Basado en criterios reales de
            fondos LATAM.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/analyze">
                Analizar mi deck — es gratis empezar
                <ArrowRight />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              No necesitas cuenta · El primer vistazo es gratis
            </p>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
              Cómo funciona
            </p>
            <h2 className="text-3xl md:text-4xl">Tres pasos. Sin fricción.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Upload,
                step: "01",
                title: "Sube tu deck en PDF",
                body: "Arrastra el archivo. Aceptamos hasta 20MB.",

              },
              {
                icon: MessageCircle,
                step: "02",
                title: "Responde 5 preguntas rápidas",
                body: "Etapa, país, monto, tracción y tipo de inversor. Toma menos de 60 segundos.",
              },
              {
                icon: BarChart3,
                step: "03",
                title: "Recibe tu análisis con score",
                body: "Score por dimensión, recomendaciones priorizadas y benchmarks LATAM.",
              },
            ].map((s) => (
              <div key={s.step} className="card-soft p-5 md:p-7">
                <div className="flex items-center justify-between mb-6">
                  <div className="size-11 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <s.icon className="size-5" />
                  </div>
                  <span className="font-display text-2xl text-ink/20">{s.step}</span>
                </div>
                <h3 className="text-xl mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>




      {/* Final CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl text-center card-soft p-6 md:p-14 bg-ink text-cream border-ink">
          <h2 className="text-3xl md:text-4xl text-cream">
            El primer vistazo es gratis. Siempre.
          </h2>
          <p className="mt-4 text-cream/70">
            No te pedimos cuenta para empezar. Sube tu deck y mira qué encontramos.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-center gap-2 sm:gap-4 text-xs text-cream/60">
            {["Validación de estructura", "Score por dimensión", "Recomendaciones LATAM"].map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-success" />
                {f}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild size="xl" className="bg-cream text-ink hover:bg-cream/90">
              <Link to="/analyze">
                Analizar mi deck
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="px-6 py-5">
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-ink grid place-items-center">
            <span className="text-cream font-display font-bold text-sm">P</span>
          </div>
          <span className="font-display font-bold text-lg">PitchScore</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/dashboard">Iniciar sesión</Link>
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/analyze">Analizar deck</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="px-6 py-12 border-t border-ink/10">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row gap-4 items-center justify-between text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
          <a href="#" className="hover:text-ink">Política de privacidad</a>
          <a href="#" className="hover:text-ink">Términos</a>
          <a href="#" className="hover:text-ink">Contacto</a>
        </div>
        <p>Hecho en LATAM para founders LATAM 🌎</p>
      </div>
    </footer>
  );
}
