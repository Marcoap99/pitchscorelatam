import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/analyze/")({
  head: () => ({
    meta: [
      { title: "Cuéntanos sobre tu startup — PitchScore AI" },
      {
        name: "description",
        content:
          "Responde 4 preguntas como si estuvieras frente a un inversor. Toma menos de 3 minutos.",
      },
    ],
  }),
  component: AnalyzePage,
});

function AnalyzePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen px-6 py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink mb-8"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>

        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
            Paso 1 de 3
          </p>
          <h1 className="text-3xl md:text-4xl">Cuéntanos sobre tu startup</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Responde 4 preguntas como si estuvieras frente a un inversor. Toma menos de 3 minutos.
          </p>
        </div>

        <Button
          variant="hero"
          size="lg"
          onClick={() => navigate({ to: "/analyze/questions" })}
        >
          Empezar
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
