import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { setState, getState } from "@/lib/analyze-store";

export const Route = createFileRoute("/analyze/questions")({
  head: () => ({ meta: [{ title: "Contexto — PitchScore AI" }] }),
  component: QuestionsPage,
});

type Q = {
  key: keyof NonNullable<ReturnType<typeof getState>["contexto"]>;
  question: string;
  options: string[];
  type?: "select";
};

const QUESTIONS: Q[] = [
  {
    key: "etapa",
    question: "¿En qué etapa está tu startup?",
    options: ["Pre-idea", "Pre-seed", "Seed", "Serie A", "Serie B+"],
  },
  {
    key: "pais",
    question: "¿En qué país opera tu startup principalmente?",
    type: "select",
    options: [
      "México", "Colombia", "Perú", "Argentina", "Chile", "Brasil",
      "Uruguay", "Ecuador", "Bolivia", "Paraguay", "Costa Rica",
      "Guatemala", "Panamá", "República Dominicana", "Venezuela", "Otro",
    ],
  },
  {
    key: "monto",
    question: "¿Cuánto buscan levantar en esta ronda?",
    options: ["Menos de $100K", "$100K–$500K", "$500K–$2M", "$2M–$10M", "Más de $10M"],
  },
  {
    key: "traccion",
    question: "¿Tienen tracción actualmente?",
    options: [
      "No hemos lanzado",
      "Usuarios sin revenue",
      "Primeros clientes pagando",
      "$1K–$10K MRR",
      "Más de $10K MRR",
    ],
  },
  {
    key: "inversor",
    question: "¿A qué tipo de inversor van a pitchear?",
    options: [
      "Ángeles",
      "Aceleradoras (YC, Endeavor, 500)",
      "Fondos VC LATAM",
      "Fondos VC internacionales",
      "Aún no lo definimos",
    ],
  },
];

function QuestionsPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => getState().contexto || {});
  const q = QUESTIONS[step];
  const value = answers[q.key];
  const isLast = step === QUESTIONS.length - 1;

  const select = (v: string) => {
    const next = { ...answers, [q.key]: v };
    setAnswers(next);
    if (q.type !== "select") {
      // Auto-advance after a brief delay for button selects
      setTimeout(() => goNext(next), 200);
    }
  };

  const goNext = (a = answers) => {
    if (isLast) {
      setState({ contexto: a });
      navigate({ to: "/analyze/preview" });
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="min-h-screen px-6 py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => (step === 0 ? navigate({ to: "/analyze" }) : setStep((s) => s - 1))}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink mb-8"
        >
          <ArrowLeft className="size-4" />
          Atrás
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold mb-3">
            <span className="text-primary">Paso 2 de 3</span>
            <span className="text-muted-foreground">
              {step + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl mb-8">{q.question}</h1>

        {q.type === "select" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => select(opt)}
                className={`card-soft px-4 py-3 text-sm text-left transition-all ${
                  value === opt
                    ? "border-primary bg-primary/5 text-primary font-semibold"
                    : "hover:border-ink/30"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => select(opt)}
                className={`w-full card-soft px-5 py-4 text-left transition-all flex items-center justify-between group ${
                  value === opt
                    ? "border-primary bg-primary/5"
                    : "hover:border-ink/30"
                }`}
              >
                <span className={value === opt ? "font-semibold text-primary" : ""}>{opt}</span>
                {value === opt && <Check className="size-5 text-primary" />}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-end">
          <Button
            variant="hero"
            size="lg"
            disabled={!value}
            onClick={() => goNext()}
          >
            {isLast ? "Ver mi análisis" : "Siguiente"}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
