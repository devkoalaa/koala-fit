"use client";

import { useState } from "react";
import { Button } from "@/design-system/components/Button";
import { useToast } from "@/design-system/components/Toast";

function download(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportActions({
  json,
  csv,
  analysisPrompt,
}: {
  json: string;
  csv: string;
  analysisPrompt: string;
}) {
  const { show } = useToast();
  const [copying, setCopying] = useState<string | null>(null);

  async function copy(label: string, text: string) {
    setCopying(label);
    try {
      await navigator.clipboard.writeText(text);
      show(`${label} copiado!`, "success");
    } catch {
      show("Não foi possível copiar. Tente novamente.", "danger");
    } finally {
      setCopying(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button fullWidth loading={copying === "JSON"} onClick={() => copy("JSON", json)}>
        Copiar JSON
      </Button>
      <Button
        fullWidth
        variant="secondary"
        onClick={() => download("koala-fit-export.json", json, "application/json")}
      >
        Baixar JSON
      </Button>
      <Button
        fullWidth
        variant="secondary"
        onClick={() => download("koala-fit-series.csv", csv, "text/csv")}
      >
        Baixar CSV (séries)
      </Button>
      <Button
        fullWidth
        variant="secondary"
        loading={copying === "Prompt"}
        onClick={() => copy("Prompt", analysisPrompt)}
      >
        Copiar prompt de análise
      </Button>
    </div>
  );
}
