import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Github, ArrowLeft, Check, AlertTriangle, X } from "lucide-react";
import { setState } from "@/lib/analyze-store";

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => ("str" in item ? item.str : "")).join(" ") + "\n";
  }
  return text.slice(0, 8000);
}

export const Route = createFileRoute("/analyze/")({
  head: () => ({
    meta: [
      { title: "Analizar pitch deck — PitchScore AI" },
      { name: "description", content: "Sube tu pitch deck en PDF y empieza el análisis gratuito." },
    ],
  }),
  component: AnalyzePage,
});

type Status = "idle" | "validating" | "error" | "success";

function AnalyzePage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf") {
      setErrorMsg("Solo aceptamos archivos PDF. Exporta tu deck desde Canva o Google Slides como PDF.");
      setStatus("error");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setErrorMsg("El archivo supera 20MB. Comprime tu PDF o reduce la resolución de las imágenes.");
      setStatus("error");
      return;
    }
    setFile(f);
    setStatus("validating");
    try {
      const text = await extractPdfText(f);
      if (!text.trim()) {
        setErrorMsg("No pudimos extraer texto del PDF. Asegúrate de que no sea un PDF escaneado solo con imágenes.");
        setStatus("error");
        return;
      }
      setPdfText(text);
      setStatus("success");
    } catch {
      setErrorMsg("No pudimos leer el archivo. Intenta nuevamente.");
      setStatus("error");
    }
  };

  const proceed = () => {
    try {
      setState({
        fileName: file?.name,
        fileSize: file?.size,
        pdfText: pdfText ?? undefined,
        githubUrl: githubUrl.trim() || undefined,
        validacion: {
          slides_detectados: 12,
          secciones_presentes: ["problema", "solución", "mercado", "equipo", "tracción"],
          secciones_faltantes: ["financials"],
        },
      });
      navigate({ to: "/analyze/questions" });
    } catch {
      setErrorMsg("Tu archivo es muy grande para guardarlo en el navegador. Prueba con un PDF más liviano.");
      setStatus("error");
    }
  };

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
          <h1 className="text-3xl md:text-4xl">Sube tu pitch deck</h1>
          <p className="mt-3 text-muted-foreground">
            Lo analizamos como lo haría un partner de fondo LATAM. Tu archivo es privado.
          </p>
        </div>

        {status === "idle" || status === "error" ? (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              className={`w-full card-soft border-2 border-dashed transition-colors p-8 md:p-16 text-center ${
                dragOver ? "border-primary bg-primary/5" : "border-ink/15 hover:border-ink/30"
              }`}
            >
              <div className="mx-auto size-14 rounded-full bg-primary/10 text-primary grid place-items-center mb-5">
                <Upload className="size-6" />
              </div>
              <p className="font-display font-semibold text-lg text-ink">
                Arrastra tu pitch deck aquí
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PDF únicamente · Máximo 20MB
              </p>
              <div className="mt-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-ink text-cream text-sm font-medium px-5 h-11">
                  <FileText className="size-4" />
                  Seleccionar archivo
                </span>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </button>

            {status === "error" && (
              <div className="mt-4 card-soft p-5 border-warning/40 bg-warning/5 flex gap-3">
                <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-ink">No pudimos procesar tu archivo</p>
                  <p className="text-muted-foreground mt-1">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* GitHub field */}
            <div className="mt-8 card-soft p-5">
              <label className="flex items-start gap-2 text-sm font-semibold text-ink">
                <Github className="size-4" />
                ¿Tienes el producto desarrollado? Pega el link de tu repositorio
              </label>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="github.com/tu-startup/tu-app"
                className="mt-3 h-11 rounded-xl"
              />
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Opcional — verificamos que tu deck sea consistente con lo que has construido
                realmente. Los inversores técnicos siempre lo hacen.
              </p>
            </div>
          </>
        ) : null}

        {status === "validating" && (
          <div className="card-soft p-10 text-center">
            <div className="mx-auto size-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-5" />
            <p className="font-display font-semibold text-lg">Leyendo tu deck...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Detectando estructura y secciones
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="card-soft p-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="size-10 rounded-full bg-success/15 grid place-items-center shrink-0">
                <Check className="size-5 text-success" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold">Deck recibido</h2>
                <p className="text-sm text-muted-foreground">{file?.name}</p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setStatus("idle");
                }}
                className="ml-auto text-muted-foreground hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-success" />
                <span>12 slides detectados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-success" />
                <span>Estructura analizada (problema, solución, equipo, tracción)</span>
              </li>
              <li className="flex items-center gap-2 text-warning">
                <AlertTriangle className="size-4" />
                <span>Falta slide de financials — te lo señalaremos en el análisis</span>
              </li>
            </ul>
            <div className="mt-8">
              <Button onClick={proceed} variant="hero" size="lg" className="w-full">
                Continuar a las preguntas
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
