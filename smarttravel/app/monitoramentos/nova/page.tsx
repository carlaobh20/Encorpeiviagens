import Link from "next/link";
import { GradientButton } from "@/components/ui/GradientButton";
import { CABIN_LABELS, FREQUENCIES } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { createRoute } from "../actions";

export const dynamic = "force-dynamic";

export default async function NovaRotaPage() {
  await requireUser();

  return (
    <div className="pt-4">
      <Link href="/monitoramentos" className="text-muted text-sm font-semibold">
        ← Voltar
      </Link>
      <h1 className="font-display text-2xl font-extrabold tracking-tight mt-3 mb-1">Nova rota</h1>
      <p className="text-muted text-sm font-medium mb-6">
        Use os códigos IATA de 3 letras (ex: GRU, MIA, MAD).
      </p>

      <form action={createRoute} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Origem" name="origin" placeholder="GRU" maxLength={3} required />
          <Field label="Destino" name="destination" placeholder="MIA" maxLength={3} required />
        </div>

        <Field label="Data de ida" name="departure_date" type="date" required />
        <Field label="Data de volta (opcional)" name="return_date" type="date" />

        <SelectField label="Cabine" name="cabin" defaultValue="economica">
          {Object.entries(CABIN_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </SelectField>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Passageiros" name="passengers" type="number" min={1} max={9} defaultValue="1" />
          <Field label="Máx. pontos (opcional)" name="max_points" type="number" placeholder="60000" />
        </div>

        <SelectField label="Frequência" name="monitor_frequency" defaultValue="1h">
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
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-muted text-xs font-bold uppercase tracking-wider mb-1.5 block px-1">{label}</span>
      <input
        name={name}
        type={type}
        className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3 text-sm outline-none focus:border-turq/50"
        {...rest}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-muted text-xs font-bold uppercase tracking-wider mb-1.5 block px-1">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-2xl bg-card2 border border-white/10 px-4 py-3 text-sm outline-none focus:border-turq/50"
      >
        {children}
      </select>
    </label>
  );
}
