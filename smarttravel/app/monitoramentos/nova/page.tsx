"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { GradientButton } from "@/components/ui/GradientButton";
import { CABIN_LABELS, FREQUENCIES } from "@/lib/constants";
import { createRoute } from "../actions";
import { parseRouteFromText } from "./ai-actions";

type FormState = {
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string;
  cabin: string;
  passengers: string;
  max_points: string;
  monitor_frequency: string;
};

const EMPTY: FormState = {
  origin: "",
  destination: "",
  departure_date: "",
  return_date: "",
  cabin: "economica",
  passengers: "1",
  max_points: "",
  monitor_frequency: "1h",
};

export default function NovaRotaPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [aiText, setAiText] = useState("");
  const [aiPending, startAiTransition] = useTransition();
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleAIFill() {
    setAiError(null);
    setAiNote(null);
    startAiTransition(async () => {
      try {
        const r = await parseRouteFromText(aiText);
        setForm((f) => ({
          ...f,
          origin: r.origin || f.origin,
          destination: r.destination || f.destination,
          departure_date: r.departure_date || f.departure_date,
          return_date: r.return_date || "",
          cabin: r.cabin || f.cabin,
          passengers: r.passengers ? String(r.passengers) : f.passengers,
          max_points: r.max_points ? String(r.max_points) : "",
        }));
        if (r.notes) setAiNote(r.notes);
      } catch (e) {
        setAiError(e instanceof Error ? e.message : "Falha ao consultar a IA.");
      }
    });
  }

  return (
    <div className="pt-4">
      <Link href="/monitoramentos" className="text-muted text-sm font-semibold">
        ← Voltar
      </Link>
      <h1 className="font-display text-2xl font-extrabold tracking-tight mt-3 mb-1">Nova rota</h1>
      <p className="text-muted text-sm font-medium mb-5">
        Descreva sua viagem em texto livre — a IA preenche os campos. Ou preencha manualmente.
      </p>

      <div className="rounded-2xl border border-ai/30 bg-gradient-to-b from-ai/10 to-card/80 p-4 mb-6">
        <label className="block">
          <span className="text-muted text-xs font-bold uppercase tracking-wider mb-1.5 block px-1">
            ✨ Descreva sua viagem
          </span>
          <textarea
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder="Ex: Quero ir pra Madrid em julho com minha esposa, executiva, até 200k pts cada"
            rows={3}
            className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3 text-sm outline-none focus:border-turq/50 resize-none"
          />
        </label>
        <GradientButton
          onClick={handleAIFill}
          disabled={aiPending || aiText.trim().length < 5}
          className="w-full mt-3"
        >
          {aiPending ? "Pensando..." : "✨ Preencher com IA"}
        </GradientButton>
        {aiError && <p className="text-danger text-xs mt-3 text-center">{aiError}</p>}
        {aiNote && (
          <p className="text-opp text-xs mt-3 text-center leading-relaxed">Entendi: {aiNote}</p>
        )}
      </div>

      <form action={createRoute} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Origem"
            name="origin"
            placeholder="GRU"
            maxLength={3}
            value={form.origin}
            onChange={(v) => update("origin", v.toUpperCase())}
            required
          />
          <Field
            label="Destino"
            name="destination"
            placeholder="MIA"
            maxLength={3}
            value={form.destination}
            onChange={(v) => update("destination", v.toUpperCase())}
            required
          />
        </div>

        <Field
          label="Data de ida"
          name="departure_date"
          type="date"
          value={form.departure_date}
          onChange={(v) => update("departure_date", v)}
          required
        />
        <Field
          label="Data de volta (opcional)"
          name="return_date"
          type="date"
          value={form.return_date}
          onChange={(v) => update("return_date", v)}
        />

        <SelectField label="Cabine" name="cabin" value={form.cabin} onChange={(v) => update("cabin", v)}>
          {Object.entries(CABIN_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </SelectField>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Passageiros"
            name="passengers"
            type="number"
            min={1}
            max={9}
            value={form.passengers}
            onChange={(v) => update("passengers", v)}
          />
          <Field
            label="Máx. pontos (opcional)"
            name="max_points"
            type="number"
            placeholder="60000"
            value={form.max_points}
            onChange={(v) => update("max_points", v)}
          />
        </div>

        <SelectField
          label="Frequência"
          name="monitor_frequency"
          value={form.monitor_frequency}
          onChange={(v) => update("monitor_frequency", v)}
        >
          {FREQUENCIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </SelectField>

        <GradientButton type="submit" className="w-full mt-2">
          Criar rota
        </GradientButton>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="text-muted text-xs font-bold uppercase tracking-wider mb-1.5 block px-1">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3 text-sm outline-none focus:border-turq/50"
        {...rest}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  children,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-muted text-xs font-bold uppercase tracking-wider mb-1.5 block px-1">{label}</span>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3 text-sm outline-none focus:border-turq/50"
      >
        {children}
      </select>
    </label>
  );
}
