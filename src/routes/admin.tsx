import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronRight, Download, Lock, RefreshCw } from "lucide-react";

const ADMIN_PASSWORD = "pitchscore2026";
const STORAGE_KEY = "pitchscore.admin.ok";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — PitchScore AI" }] }),
  component: AdminPage,
});

type Row = {
  id: string;
  created_at: string;
  etapa: string | null;
  pais: string | null;
  inversor: string | null;
  score_global: number | null;
  problema: string | null;
  resultado_completo: any;
};

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password === ADMIN_PASSWORD) {
              sessionStorage.setItem(STORAGE_KEY, "1");
              setAuthed(true);
              setError("");
            } else {
              setError("Contraseña incorrecta");
            }
          }}
          className="card-soft p-8 w-full max-w-sm"
        >
          <div className="mx-auto size-12 rounded-full bg-primary/10 grid place-items-center mb-5">
            <Lock className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl text-center mb-2">Admin</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Ingresa la contraseña para ver los análisis.
          </p>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="h-11 rounded-xl"
            autoFocus
          />
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          <Button type="submit" variant="hero" className="w-full mt-5">
            Entrar
          </Button>
        </form>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("analisis")
      .select(
        "id, created_at, etapa, pais, inversor, score_global, problema, resultado_completo"
      )
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows((data || []) as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const exportCsv = async () => {
    const { data, error } = await supabase
      .from("analisis")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return;
    const cols = Object.keys(data[0] || {});
    const escape = (v: any) => {
      if (v === null || v === undefined) return "";
      const s = typeof v === "object" ? JSON.stringify(v) : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const csv = [
      cols.join(","),
      ...data.map((row: any) => cols.map((c) => escape(row[c])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analisis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen px-6 py-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl">Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {rows.length} análisis guardados
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Recargar
            </Button>
            <Button variant="hero" onClick={exportCsv}>
              <Download />
              Exportar CSV
            </Button>
          </div>
        </div>

        {error && (
          <div className="card-soft p-5 border-destructive/30 bg-destructive/5 mb-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="card-soft overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold w-8"></th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">País</th>
                  <th className="px-4 py-3 font-semibold">Etapa</th>
                  <th className="px-4 py-3 font-semibold">Inversor</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Problema</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Cargando...
                    </td>
                  </tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Sin análisis todavía
                    </td>
                  </tr>
                )}
                {rows.map((row) => {
                  const isOpen = expanded === row.id;
                  return (
                    <Fragment key={row.id}>
                      <tr
                        key={row.id}
                        className="border-t border-ink/10 hover:bg-ink/5 cursor-pointer"
                        onClick={() => setExpanded(isOpen ? null : row.id)}
                      >
                        <td className="px-4 py-3">
                          {isOpen ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {new Date(row.created_at).toLocaleString("es-419", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-4 py-3">{row.pais || "—"}</td>
                        <td className="px-4 py-3">{row.etapa || "—"}</td>
                        <td className="px-4 py-3">{row.inversor || "—"}</td>
                        <td className="px-4 py-3 font-semibold text-primary">
                          {row.score_global ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {(row.problema || "").slice(0, 50)}
                          {(row.problema || "").length > 50 ? "…" : ""}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr key={row.id + "-d"} className="border-t border-ink/10 bg-ink/[0.02]">
                          <td colSpan={7} className="px-4 py-4">
                            <pre className="text-xs bg-ink text-cream rounded-xl p-4 overflow-auto max-h-[500px] whitespace-pre-wrap break-words">
                              {JSON.stringify(row.resultado_completo, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
