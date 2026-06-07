"use client";

import { FormEvent, useMemo, useState } from "react";
import { WeekType } from "@prisma/client";

type SectionOption = { id: string; name: string; code: string };
type UserOption = { id: string; name: string; role: string; email: string };

type TrainingApi = {
  id: string;
  sectionId: string;
  section: string;
  coachId: string;
  coach: string;
  title: string;
  titleKey: "GLACE" | "PPG" | "SOL";
  type: string;
  typeKey: "HEBDOMADAIRE" | "STAGE";
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes?: string | null;
  status?: string;
};

type FormState = {
  sectionId: string;
  coachId: string;
  title: "GLACE" | "PPG" | "SOL";
  type: "HEBDOMADAIRE" | "STAGE";
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
};

type Props = {
  sections?: SectionOption[];
  users?: UserOption[];
  initialItems?: TrainingApi[];
  initialWeekType?: WeekType;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function findCoachByNameKeyword(users: UserOption[], keyword: string) {
  const normalized = normalize(keyword);
  return users.find((u) => normalize(u.name).includes(normalized));
}

function findDefaultCoachForSection(
  sectionId: string,
  sections: SectionOption[],
  users: UserOption[],
) {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return users[0];

  const name = normalize(section.name);
  if (name.includes("danse")) return findCoachByNameKeyword(users, "deborah wattelier") ?? users[0];
  if (name.includes("artistique")) return findCoachByNameKeyword(users, "camille zouita") ?? users[0];
  if (name.includes("synchro")) return findCoachByNameKeyword(users, "angela tamburrino") ?? users[0];
  return users[0];
}

function mondayOfCurrentWeek() {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  return monday;
}

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toIsoDate(dateInput: string): string {
  return new Date(`${dateInput}T00:00:00.000Z`).toISOString();
}

function initialForm(sections: SectionOption[], users: UserOption[]): FormState {
  const monday = mondayOfCurrentWeek();
  const initialSectionId = sections[0]?.id ?? "";
  const suggestedCoach = findDefaultCoachForSection(initialSectionId, sections, users);

  return {
    sectionId: initialSectionId,
    coachId: suggestedCoach?.id ?? users[0]?.id ?? "",
    title: "GLACE",
    type: "HEBDOMADAIRE",
    date: toDateInput(monday),
    startTime: "18:00",
    endTime: "19:30",
    location: "Patinoire A",
    notes: "",
  };
}

function buildWeekRange(startDate: string) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export default function AdminTrainingManager({
  sections = [],
  users = [],
  initialItems = [],
  initialWeekType = WeekType.STANDARD,
}: Props) {
  const defaults = useMemo(() => initialForm(sections, users), [sections, users]);
  const [form, setForm] = useState<FormState>(defaults);
  const [items, setItems] = useState<TrainingApi[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [weekStart, setWeekStart] = useState<string>(toDateInput(mondayOfCurrentWeek()));
  const [weekType, setWeekType] = useState<WeekType>(initialWeekType);

  async function refreshForWeek(startDate: string) {
    const range = buildWeekRange(startDate);
    const params = new URLSearchParams({ start: range.start, end: range.end });
    const response = await fetch(`/api/trainings?${params.toString()}`);
    const data = await response.json();
    setItems(data.trainings ?? []);
  }

  async function refreshWeekMeta(startDate: string) {
    const date = toIsoDate(startDate);
    const response = await fetch(`/api/weeks?date=${encodeURIComponent(date)}`);
    const data = await response.json();
    if (data?.week?.type) {
      setWeekType(data.week.type as WeekType);
    }
  }

  function moveWeek(delta: number) {
    const date = new Date(`${weekStart}T00:00:00.000Z`);
    date.setDate(date.getDate() + delta * 7);
    const next = toDateInput(date);
    setWeekStart(next);
    void refreshForWeek(next);
    void refreshWeekMeta(next);
  }

  async function applyWeekType() {
    const response = await fetch("/api/weeks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: toIsoDate(weekStart),
        type: weekType,
      }),
    });

    if (!response.ok) {
      setMessage("Erreur lors de la mise à jour du type de semaine.");
      return;
    }

    const data = await response.json();
    const inheritedCount = Number(data?.inheritedCount ?? 0);

    if (weekType === WeekType.STANDARD && inheritedCount > 0) {
      setMessage(`Semaine standard appliquée. ${inheritedCount} créneau(x) hérité(s).`);
    } else {
      setMessage(`Semaine ${weekType === WeekType.STANDARD ? "standard" : "stage"} appliquée.`);
    }

    await refreshForWeek(weekStart);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      sectionId: form.sectionId,
      coachId: form.coachId,
      title: form.title,
      type: form.type,
      date: toIsoDate(form.date),
      startTime: form.startTime,
      endTime: form.endTime,
      location: form.location,
      notes: form.notes || undefined,
      weekType,
    };

    const endpoint = editingId ? `/api/trainings/${editingId}` : "/api/trainings";
    const method = editingId ? "PATCH" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!response.ok) {
      setMessage("Erreur lors de l'enregistrement du créneau.");
      return;
    }

    setMessage(editingId ? "Créneau modifié." : "Créneau créé.");
    setEditingId(null);
    setForm(defaults);
    await refreshForWeek(weekStart);
  }

  function onEdit(item: TrainingApi) {
    setEditingId(item.id);
    setForm({
      sectionId: item.sectionId,
      coachId: item.coachId,
      title: item.titleKey,
      type: item.typeKey,
      date: item.date.slice(0, 10),
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      notes: item.notes ?? "",
    });
  }

  async function onDelete(id: string) {
    const ok = window.confirm("Supprimer ce créneau ?");
    if (!ok) return;

    const response = await fetch(`/api/trainings/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Erreur lors de la suppression.");
      return;
    }

    setMessage("Créneau supprimé.");
    await refreshForWeek(weekStart);
  }

  return (
    <section className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gestion des créneaux</h2>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm"
            type="button"
            onClick={() => moveWeek(-1)}
          >
            Semaine -1
          </button>
          <input
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
            onClick={() => void refreshForWeek(weekStart)}
            value={weekStart}
            onChange={(event) => {
              const next = event.target.value;
              setWeekStart(next);
              void refreshForWeek(next);
            }}
          />
          <button
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm"
            type="button"
            onClick={() => moveWeek(1)}
          >
            Semaine +1
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3">
        <p className="text-sm text-slate-300">Type semaine:</p>
        <select
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm"
          value={weekType}
          onChange={(event) => setWeekType(event.target.value as WeekType)}
        >
          <option value={WeekType.STANDARD}>STANDARD</option>
          <option value={WeekType.STAGE}>STAGE</option>
        </select>
        <button
          className="rounded-md border border-cyan-700 px-3 py-1.5 text-sm text-cyan-200"
          type="button"
          onClick={() => void applyWeekType()}
        >
          Appliquer le type
        </button>
        <p className="text-xs text-slate-400">
          Règle: en STANDARD, si la semaine est vide, les créneaux sont hérités de la dernière
          semaine standard.
        </p>
      </div>

      <form className="grid gap-3 rounded-lg border border-slate-800 p-3" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Section
            <select
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              value={form.sectionId}
              onChange={(event) => {
                const sectionId = event.target.value;
                const suggested = findDefaultCoachForSection(sectionId, sections, users);
                setForm((s) => ({
                  ...s,
                  sectionId,
                  coachId: suggested?.id ?? s.coachId,
                }));
              }}
              required
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            Entraîneur
            <select
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              value={form.coachId}
              onChange={(event) => setForm((s) => ({ ...s, coachId: event.target.value }))}
              required
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role.toLowerCase()})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <label className="grid gap-1 text-sm">
            Titre
            <select
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              value={form.title}
              onChange={(event) =>
                setForm((s) => ({ ...s, title: event.target.value as FormState["title"] }))
              }
            >
              <option value="GLACE">Glace</option>
              <option value="PPG">PPG</option>
              <option value="SOL">Sol</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            Type
            <select
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              value={form.type}
              onChange={(event) =>
                setForm((s) => ({ ...s, type: event.target.value as FormState["type"] }))
              }
            >
              <option value="HEBDOMADAIRE">Hebdomadaire</option>
              <option value="STAGE">Stage</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            Date
            <input
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              type="date"
              value={form.date}
              onChange={(event) => setForm((s) => ({ ...s, date: event.target.value }))}
              required
            />
          </label>

          <label className="grid gap-1 text-sm">
            Lieu
            <input
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              value={form.location}
              onChange={(event) => setForm((s) => ({ ...s, location: event.target.value }))}
              required
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm">
            Début
            <input
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              type="time"
              value={form.startTime}
              onChange={(event) => setForm((s) => ({ ...s, startTime: event.target.value }))}
              required
            />
          </label>

          <label className="grid gap-1 text-sm">
            Fin
            <input
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              type="time"
              value={form.endTime}
              onChange={(event) => setForm((s) => ({ ...s, endTime: event.target.value }))}
              required
            />
          </label>

          <label className="grid gap-1 text-sm md:col-span-1">
            Notes
            <input
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
              value={form.notes}
              onChange={(event) => setForm((s) => ({ ...s, notes: event.target.value }))}
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {editingId ? "Enregistrer la modification" : "Créer le créneau"}
          </button>
          {editingId && (
            <button
              className="rounded-md border border-slate-700 px-4 py-2 text-sm"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(defaults);
              }}
            >
              Annuler édition
            </button>
          )}
          {message && <p className="text-sm text-cyan-300">{message}</p>}
        </div>
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Section</th>
              <th className="px-3 py-2 text-left">Créneau</th>
              <th className="px-3 py-2 text-left">Lieu</th>
              <th className="px-3 py-2 text-left">Coach</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{item.date.slice(0, 10)}</td>
                <td className="px-3 py-2">{item.section}</td>
                <td className="px-3 py-2">
                  {item.title} ({item.type}) {item.startTime}-{item.endTime}
                </td>
                <td className="px-3 py-2">{item.location}</td>
                <td className="px-3 py-2">{item.coach}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      className="rounded border border-slate-700 px-2 py-1"
                      type="button"
                      onClick={() => onEdit(item)}
                    >
                      Modifier
                    </button>
                    <button
                      className="rounded border border-rose-700 px-2 py-1 text-rose-300"
                      type="button"
                      onClick={() => void onDelete(item.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-400" colSpan={6}>
                  Aucun créneau trouvé sur la semaine courante.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
