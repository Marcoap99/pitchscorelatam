import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { setState, getState, type Contexto, type Respuestas } from "@/lib/analyze-store";

export const Route = createFileRoute("/analyze/questions")({
  head: () => ({ meta: [{ title: "Contexto — PitchScore AI" }] }),
  component: QuestionsPage,
});

type ContextoQ = {
  key: keyof Contexto;
  question: string;
  options: string[];
  type?: "select";
};

const CONTEXTO_QUESTIONS: ContextoQ[] = [
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

type AbiertaQ = {
  key: keyof Respuestas;
  question: string;
  placeholder: string;
};

const ABIERTAS_QUESTIONS: AbiertaQ[] = [
  {
    key: "problema",
    question:
      "¿Qué problema resuelves, para quién, y qué cambió recientemente que lo hace urgente hoy?",
    placeholder:
      "Ej: Los comerciantes informales en Perú pierden el 35% de ventas por no aceptar pagos digitales. Con el boom de smartphones post-COVID, los compradores ya quieren pagar digital pero los vendedores no pueden recibirlo.",
  },
  {
    key: "solucion",
    question: "¿Qué hace tu producto y por qué ganas contra lo que ya existe en LATAM?",
    placeholder:
      "Ej: App de cobros con QR que no requiere cuenta bancaria. A diferencia de Yape/Plin que sirven a compradores, nosotros servimos al comerciante. Onboarding en 3 minutos vs 3 semanas de un banco.",
  },
  {
    key: "traccion",
    question: "¿Qué números tienes hoy? Si son chicos no importa, importa la tendencia.",
    placeholder:
      "Ej: 120 comerciantes activos, $2.1K MRR, 67% retención mes 2, creciendo 40% mes a mes por referidos.",
  },
  {
    key: "equipo",
    question:
      "¿Por qué ustedes? ¿Qué tienen tú y tu equipo que alguien que leyó este problema hoy no tiene?",
    placeholder:
      "Ej: Yo operé la red de 800 repartidores de Rappi Perú. Mi CTO tiene 6 años en Culqi procesando pagos. Vivimos el problema desde adentro.",
  },
];

const MAX_CHARS = 300;
const MIN_CHARS = 30;
const TOTAL = CONTEXTO_QUESTIONS.length + ABIERTAS_QUESTIONS.length;

function QuestionsPage() {
  const navigate = useNavigate();
  const initial = getState();
  const [step, setStep] = useState(0);
  const [contexto, setContexto] = useState<Record<string, string>>(
    (initial.contexto as Record<string, string>) || {}
  );
  const [respuestas, setRespuestas] = useState<Record<string, string>>(
    (initial.respuestas as Record<string, string>) || {}
  );

  const isContextoStep = step < CONTEXTO_QUESTIONS.length;
  const isLast = step === TOTAL - 1;

  const goBack = () => {
    if (step === 0) navigate({ to: "/analyze" });
    else setStep((s) => s - 1);
  };

  const goNext = () => {
    if (isLast) {
      setState({ contexto, respuestas });
      navigate({ to: "/analyze/preview" });
    } else {
      setStep((s) => s + 1);
    }
  };

  const progress = ((step + 1) / TOTAL) * 100;

  return (
    <div className="min-h-screen px-6 py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink mb-8"
        >
          <ArrowLeft className="size-4" />
          Atrás
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold mb-3">
            <span className="text-primary">Paso 2 de 3</span>
            <span className="text-muted-foreground">
              {step + 1} / {TOTAL}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {isContextoStep ? (
          <ContextoStep
            q={CONTEXTO_QUESTIONS[step]}
            value={contexto[CONTEXTO_QUESTIONS[step].key as string] || ""}
            onSelect={(v) => {
              const next = { ...contexto, [CONTEXTO_QUESTIONS[step].key]: v };
              setContexto(next);
              if (CONTEXTO_QUESTIONS[step].type !== "select") {
                setTimeout(() => setStep((s) => s + 1), 200);
              }
            }}
          />
        ) : (
          <AbiertaStep
            q={ABIERTAS_QUESTIONS[step - CONTEXTO_QUESTIONS.length]}
            value={
              respuestas[ABIERTAS_QUESTIONS[step - CONTEXTO_QUESTIONS.length].key as string] || ""
            }
            onChange={(v) =>
              setRespuestas({
                ...respuestas,
                [ABIERTAS_QUESTIONS[step - CONTEXTO_QUESTIONS.length].key]: v,
              })
            }
          />
        )}

        <div className="mt-10 flex justify-end">
          <Button
            variant="hero"
            size="lg"
            disabled={
              isContextoStep
                ? !contexto[CONTEXTO_QUESTIONS[step].key as string]
                : (respuestas[
                    ABIERTAS_QUESTIONS[step - CONTEXTO_QUESTIONS.length].key as string
                  ] || "").trim().length < MIN_CHARS
            }
            onClick={goNext}
          >
            {isLast ? "Ver mi análisis" : "Siguiente"}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ContextoStep({
  q,
  value,
  onSelect,
}: {
  q: ContextoQ;
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <>
      <h1 className="text-2xl md:text-3xl mb-8">{q.question}</h1>
      {q.type === "select" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`card-soft px-4 py-4 text-sm text-left transition-all ${
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
              onClick={() => onSelect(opt)}
              className={`w-full card-soft px-5 py-4 text-left transition-all flex items-center justify-between group ${
                value === opt ? "border-primary bg-primary/5" : "hover:border-ink/30"
              }`}
            >
              <span className={value === opt ? "font-semibold text-primary" : ""}>{opt}</span>
              {value === opt && <Check className="size-5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function AbiertaStep({
  q,
  value,
  onChange,
}: {
  q: AbiertaQ;
  value: string;
  onChange: (v: string) => void;
}) {
  const count = value.length;
  const tooShort = count > 0 && count < MIN_CHARS;
  return (
    <>
      <h1 className="text-2xl md:text-3xl mb-6">{q.question}</h1>
      <Textarea
        value={value}
        onChange={(e) => {
          const v = e.target.value.slice(0, MAX_CHARS);
          onChange(v);
        }}
        placeholder={q.placeholder}
        rows={6}
        className="min-h-[140px] rounded-2xl p-4 text-base leading-relaxed resize-none"
        maxLength={MAX_CHARS}
      />
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={tooShort ? "text-warning" : "text-muted-foreground"}>
          {tooShort ? `Mínimo ${MIN_CHARS} caracteres` : `Mínimo ${MIN_CHARS} caracteres`}
        </span>
        <span
          className={`font-mono ${count >= MAX_CHARS ? "text-warning" : "text-muted-foreground"}`}
        >
          {count} / {MAX_CHARS}
        </span>
      </div>
    </>
  );
}
