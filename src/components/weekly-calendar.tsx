"use client";

import { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { sortSections } from "@/lib/sections";

type Section = { id: string; code: string; name: string };

type ApiTraining = {
  id: string;
  sectionId: string;
  coachId?: string;
  section: string;
  title: string;
  titleKey?: "GLACE" | "PPG" | "SOL";
  type: string;
  typeKey?: "HEBDOMADAIRE" | "STAGE";
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  coach: string;
  notes?: string | null;
  status?: string;
};

type UserOption = {
  id: string;
  name: string;
  role: string;
};

type TrainingFormState = {
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

type TrainingPopup = {
  section: string;
  coach: string;
  training: string;
  courseType: string;
  location: string;
  startTime: string;
  endTime: string;
};

type Props = {
  initialSections: Section[];
  initialTrainings: ApiTraining[];
  canManage?: boolean;
  users?: UserOption[];
  currentUser?: { id: string; role: "coach" | "admin" };
};

type CalendarView = "timeGridWeek" | "timeGridDay";

const PREF_KEY = "epwlm-calendar-preferences";
const DEFAULT_START_MINUTES = 6 * 60 + 40;
const DEFAULT_END_MINUTES = 22 * 60;

const SECTION_COLORS = [
  // Loisirs
  { bg: "#e5e7eb", border: "#cbd5e1", text: "#475569", chip: "#64748b" },

  // Artistique (nuances proches)
  { bg: "#fce7f3", border: "#f9a8d4", text: "#831843", chip: "#be185d" },
  { bg: "#fbcfe8", border: "#f472b6", text: "#831843", chip: "#db2777" },
  { bg: "#f9a8d4", border: "#ec4899", text: "#701a75", chip: "#be185d" },

  // Danse (nuances proches)
  { bg: "#dbeafe", border: "#93c5fd", text: "#1e3a8a", chip: "#2563eb" },
  { bg: "#bfdbfe", border: "#60a5fa", text: "#1e3a8a", chip: "#1d4ed8" },
  { bg: "#93c5fd", border: "#3b82f6", text: "#1e3a8a", chip: "#1e40af" },

  // Synchro (nuances proches)
  { bg: "#dcfce7", border: "#86efac", text: "#14532d", chip: "#16a34a" },
  { bg: "#bbf7d0", border: "#4ade80", text: "#14532d", chip: "#15803d" },
  { bg: "#86efac", border: "#22c55e", text: "#14532d", chip: "#166534" },
];

function asDateTime(date: string, hhmm: string): string {
  return `${date}T${hhmm}:00`;
}

function toMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

function toHhmmss(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, totalMinutes));
  const h = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const m = Math.floor(clamped % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:00`;
}

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

function findDefaultCoachForSection(sectionId: string, sections: Section[], users: UserOption[]) {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return users[0];

  const name = normalize(section.name);
  if (name.includes("danse")) return findCoachByNameKeyword(users, "deborah wattelier") ?? users[0];
  if (name.includes("artistique")) return findCoachByNameKeyword(users, "camille zouita") ?? users[0];
  if (name.includes("synchro")) return findCoachByNameKeyword(users, "angela tamburrino") ?? users[0];
  return users[0];
}

function toDateInput(isoDate: string): string {
  return isoDate.slice(0, 10);
}

function toIsoDate(dateInput: string): string {
  return new Date(`${dateInput}T00:00:00.000Z`).toISOString();
}

function defaultTrainingForm(
  sections: Section[],
  users: UserOption[],
  currentUser?: { id: string; role: "coach" | "admin" },
): TrainingFormState {
  const today = new Date().toISOString().slice(0, 10);
  const sectionId = sections[0]?.id ?? "";
  const coach = findDefaultCoachForSection(sectionId, sections, users);
  const defaultCoachId =
    currentUser?.role === "coach" && currentUser.id ? currentUser.id : coach?.id ?? users[0]?.id ?? "";

  return {
    sectionId,
    coachId: defaultCoachId,
    title: "GLACE",
    type: "HEBDOMADAIRE",
    date: today,
    startTime: "18:00",
    endTime: "19:30",
    location: "Patinoire A",
    notes: "",
  };
}

function withDate(form: TrainingFormState, date: string): TrainingFormState {
  return {
    ...form,
    date,
  };
}

export default function WeeklyCalendar({
  initialSections,
  initialTrainings,
  canManage = false,
  users = [],
  currentUser,
}: Props) {
  const sections = useMemo(() => sortSections(initialSections), [initialSections]);

  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>(
    currentUser?.role === "coach" && currentUser.id ? [currentUser.id] : [],
  );
  const [trainings, setTrainings] = useState<ApiTraining[]>(initialTrainings);
  const [range, setRange] = useState<{ start: string; end: string } | null>(null);
  const [preferredView, setPreferredView] = useState<CalendarView>("timeGridWeek");
  const [isMobile, setIsMobile] = useState(false);
  const [isSectionFiltersOpen, setIsSectionFiltersOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<TrainingPopup | null>(null);
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [trainingForm, setTrainingForm] = useState<TrainingFormState>(() =>
    defaultTrainingForm(sections, users, currentUser),
  );
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const calendarRef = useRef<FullCalendar | null>(null);

  const activeSectionIds = selectedSectionIds.filter((sectionId) =>
    sections.some((section) => section.id === sectionId),
  );
  const activeCoachIds = selectedCoachIds.filter((coachId) =>
    users.some((user) => user.id === coachId),
  );

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api && api.view.type !== preferredView) {
      api.changeView(preferredView);
    }
  }, [preferredView]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");

    const applyMode = (mobile: boolean) => {
      setIsMobile(mobile);
      setPreferredView((prev) => {
        if (mobile && prev === "timeGridWeek") return "timeGridDay";
        if (!mobile && prev === "timeGridDay") return "timeGridWeek";
        return prev;
      });
    };

    applyMode(media.matches);

    const onChange = (event: MediaQueryListEvent) => applyMode(event.matches);
    media.addEventListener("change", onChange);

    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREF_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored) as { sectionIds?: string[] };
      if (Array.isArray(parsed.sectionIds)) {
        setSelectedSectionIds(parsed.sectionIds.filter((id) => typeof id === "string"));
      }
    } catch {
      // localStorage might be blocked or malformed
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        PREF_KEY,
        JSON.stringify({ sectionIds: activeSectionIds, coachIds: activeCoachIds, view: preferredView }),
      );
    } catch {
      // localStorage might be blocked
    }
  }, [activeCoachIds, activeSectionIds, preferredView]);

  const sectionColorByName = useMemo(() => {
    const map = new Map<string, (typeof SECTION_COLORS)[number]>();
    sections.forEach((section, index) => {
      map.set(section.name, SECTION_COLORS[index % SECTION_COLORS.length]);
    });
    return map;
  }, [sections]);

  const { slotMinTime, slotMaxTime } = useMemo(() => {
    if (trainings.length === 0) {
      return { slotMinTime: "06:40:00", slotMaxTime: "22:00:00" };
    }

    const earliest = Math.min(...trainings.map((t) => toMinutes(t.startTime)));
    const latest = Math.max(...trainings.map((t) => toMinutes(t.endTime)));

    const min =
      isMobile && preferredView === "timeGridDay"
        ? Math.max(0, earliest - 10)
        : earliest < DEFAULT_START_MINUTES
          ? Math.max(0, earliest - 10)
          : DEFAULT_START_MINUTES;
    const max = latest > DEFAULT_END_MINUTES ? Math.min(24 * 60, latest + 15) : Math.max(latest + 15, 19 * 60);

    return {
      slotMinTime: toHhmmss(min),
      slotMaxTime: toHhmmss(max),
    };
  }, [isMobile, preferredView, trainings]);

  const events = useMemo(
    () =>
      trainings.map((t) => {
        const color = sectionColorByName.get(t.section) ?? SECTION_COLORS[0];

        return {
          id: t.id,
          title: `${t.section} - ${t.title}`,
          start: asDateTime(t.date.slice(0, 10), t.startTime),
          end: asDateTime(t.date.slice(0, 10), t.endTime),
          backgroundColor: color.bg,
          borderColor: color.border,
          textColor: color.text,
          extendedProps: {
            section: t.section,
            coach: t.coach,
            location: t.location,
            type: t.type,
            titleKind: t.title,
            startTime: t.startTime,
            endTime: t.endTime,
          },
        };
      }),
    [sectionColorByName, trainings],
  );

  async function refreshEvents(
    startStr: string,
    endStr: string,
    sectionIds?: string[],
    coachIds?: string[],
  ) {
    const params = new URLSearchParams({ start: startStr, end: endStr });
    if (sectionIds?.length) {
      for (const id of sectionIds) {
        params.append("sectionId", id);
      }
    }
    if (coachIds?.length) {
      for (const id of coachIds) {
        params.append("coachId", id);
      }
    }

    const response = await fetch(`/api/trainings?${params.toString()}`);
    const data = await response.json();
    setTrainings(data.trainings ?? []);
  }

  function openCreateForm() {
    const api = calendarRef.current?.getApi();
    const viewDate = api?.getDate().toISOString().slice(0, 10);

    setEditingTrainingId(null);
    const base = defaultTrainingForm(sections, users, currentUser);
    setTrainingForm(viewDate ? withDate(base, viewDate) : base);
    setFormMessage("");
    setFormOpen(true);
  }

  function openEditForm(training: ApiTraining) {
    setEditingTrainingId(training.id);
    setTrainingForm({
      sectionId: training.sectionId,
      coachId: training.coachId ?? users[0]?.id ?? "",
      title: training.titleKey ?? "GLACE",
      type: training.typeKey ?? "HEBDOMADAIRE",
      date: toDateInput(training.date),
      startTime: training.startTime,
      endTime: training.endTime,
      location: training.location,
      notes: training.notes ?? "",
    });
    setFormMessage("");
    setFormOpen(true);
  }

  async function submitTrainingForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormLoading(true);
    setFormMessage("");

    const payload = {
      sectionId: trainingForm.sectionId,
      coachId: trainingForm.coachId,
      title: trainingForm.title,
      type: trainingForm.type,
      date: toIsoDate(trainingForm.date),
      startTime: trainingForm.startTime,
      endTime: trainingForm.endTime,
      location: trainingForm.location,
      notes: trainingForm.notes || undefined,
    };

    const endpoint = editingTrainingId ? `/api/trainings/${editingTrainingId}` : "/api/trainings";
    const method = editingTrainingId ? "PATCH" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    setFormLoading(false);

    if (!response.ok) {
      const message =
        typeof data?.error === "string" && data.error.length > 0
          ? data.error
          : "Erreur lors de l'enregistrement du creneau.";
      setFormMessage(message);
      return;
    }

    setFormOpen(false);
    setEditingTrainingId(null);
    const base = defaultTrainingForm(sections, users, currentUser);
    setTrainingForm(withDate(base, trainingForm.date));
    setFormMessage("");

    const api = calendarRef.current?.getApi();
    if (api) {
      void refreshEvents(
        api.view.currentStart.toISOString(),
        api.view.currentEnd.toISOString(),
        activeSectionIds,
        activeCoachIds,
      );
    }
  }

  async function deleteTrainingFromForm() {
    if (!editingTrainingId) return;
    const confirmed = window.confirm("Supprimer ce creneau ?");
    if (!confirmed) return;

    setFormLoading(true);
    setFormMessage("");

    const response = await fetch(`/api/trainings/${editingTrainingId}`, {
      method: "DELETE",
    });
    const data = await response.json().catch(() => null);

    setFormLoading(false);

    if (!response.ok) {
      const message =
        typeof data?.error === "string" && data.error.length > 0
          ? data.error
          : "Erreur lors de la suppression du creneau.";
      setFormMessage(message);
      return;
    }

    setFormOpen(false);
    setEditingTrainingId(null);
    setFormMessage("");

    const api = calendarRef.current?.getApi();
    if (api) {
      void refreshEvents(
        api.view.currentStart.toISOString(),
        api.view.currentEnd.toISOString(),
        activeSectionIds,
        activeCoachIds,
      );
    }
  }

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      {canManage ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            className="rounded-full border border-cyan-700 bg-cyan-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-cyan-800"
            onClick={openCreateForm}
          >
            Ajouter un creneau
          </button>
        </div>
      ) : null}

      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-2 md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              activeSectionIds.length === 0
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            onClick={() => {
              setSelectedSectionIds([]);
              if (!range) return;
              void refreshEvents(range.start, range.end, undefined, activeCoachIds);
            }}
          >
            Toutes sections
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            aria-expanded={isSectionFiltersOpen}
            aria-controls="mobile-section-filters"
            onClick={() => setIsSectionFiltersOpen((open) => !open)}
          >
            Filtrer
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`h-4 w-4 transition-transform ${isSectionFiltersOpen ? "rotate-180" : "rotate-0"}`}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {isSectionFiltersOpen ? (
          <div id="mobile-section-filters" className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
            <p className="w-full text-xs font-semibold uppercase tracking-wide text-slate-500">Disciplines</p>

          {sections.map((section) => {
            const color = sectionColorByName.get(section.name) ?? SECTION_COLORS[0];
            const active = activeSectionIds.includes(section.id);

            return (
              <button
                key={section.id}
                type="button"
                className="rounded-full border px-3 py-1.5 text-sm font-medium transition"
                style={{
                  borderColor: color.border,
                  backgroundColor: active ? color.chip : color.bg,
                  color: active ? "#ffffff" : color.text,
                }}
                onClick={() => {
                  setSelectedSectionIds((prev) => {
                    const next = prev.includes(section.id)
                      ? prev.filter((id) => id !== section.id)
                      : [...prev, section.id];
                    if (range) {
                      void refreshEvents(range.start, range.end, next, activeCoachIds);
                    }
                    return next;
                  });
                }}
              >
                {section.name}
              </button>
            );
          })}
            </div>
          ) : null}
        </div>

      <div className="mb-4 hidden flex-wrap items-center gap-2 md:flex">
        <button
          type="button"
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            activeSectionIds.length === 0
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
          onClick={() => {
            setSelectedSectionIds([]);
            if (!range) return;
            void refreshEvents(range.start, range.end, undefined, activeCoachIds);
          }}
        >
          Toutes sections
        </button>

        {sections.map((section) => {
          const color = sectionColorByName.get(section.name) ?? SECTION_COLORS[0];
          const active = activeSectionIds.includes(section.id);

          return (
            <button
              key={section.id}
              type="button"
              className="rounded-full border px-3 py-1.5 text-sm font-medium transition"
              style={{
                borderColor: color.border,
                backgroundColor: active ? color.chip : color.bg,
                color: active ? "#ffffff" : color.text,
              }}
              onClick={() => {
                setSelectedSectionIds((prev) => {
                  const next = prev.includes(section.id)
                    ? prev.filter((id) => id !== section.id)
                    : [...prev, section.id];
                  if (range) {
                    void refreshEvents(range.start, range.end, next, activeCoachIds);
                  }
                  return next;
                });
              }}
            >
              {section.name}
            </button>
          );
        })}
      </div>

      {currentUser?.role === "coach" ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Entraineurs:</span>
          {users.map((user) => {
            const active = activeCoachIds.includes(user.id);
            const isCurrentUser = currentUser.id === user.id;
            return (
              <button
                key={user.id}
                type="button"
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-cyan-700 bg-cyan-700 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => {
                  setSelectedCoachIds((prev) => {
                    const next = prev.includes(user.id)
                      ? prev.filter((id) => id !== user.id)
                      : [...prev, user.id];
                    if (range) {
                      void refreshEvents(range.start, range.end, activeSectionIds, next);
                    }
                    return next;
                  });
                }}
              >
                {isCurrentUser ? "Moi" : user.name}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="fc-compact-planning">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          firstDay={1}
          allDaySlot={false}
          nowIndicator
          expandRows
          slotMinTime={slotMinTime}
          slotMaxTime={slotMaxTime}
          slotDuration="00:30:00"
          slotLabelInterval="00:30:00"
          slotLabelContent={(arg) => {
            const startMinute = Number(slotMinTime.slice(3, 5));
            const minute = arg.date.getMinutes();

            // Standard case: when the grid aligns on quarter-hours, show labels only on :00.
            if (startMinute % 15 === 0) {
              if (minute !== 0) return { html: "" };
              const hours = arg.date.getHours().toString().padStart(2, "0");
              return { html: `${hours}:00` };
            }

            // Offset case (e.g. 06:40 start): show one full-hour label per hour on the aligned row.
            if (minute !== startMinute) return { html: "" };
            const nextHour = new Date(arg.date.getTime() + (60 - minute) * 60_000);
            const nextHourText = nextHour.getHours().toString().padStart(2, "0");
            return { html: `${nextHourText}:00` };
          }}
          height="auto"
          stickyHeaderDates
          locale="fr"
          events={events}
          eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          eventMinHeight={20}
          eventShortHeight={18}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: isMobile ? "timeGridDay" : "timeGridWeek,timeGridDay",
          }}
          dayHeaderContent={(arg) => {
            const weekday = arg.date
              .toLocaleDateString("fr-FR", { weekday: "short" })
              .replace(".", "")
              .toUpperCase();
            return {
              html: `<div class="fc-gcal-day"><span class="fc-gcal-weekday">${weekday}.</span><span class="fc-gcal-date">${arg.date.getDate()}</span></div>`,
            };
          }}
          datesSet={({ startStr, endStr, view }) => {
            setRange({ start: startStr, end: endStr });
            if (view.type === "timeGridWeek" || view.type === "timeGridDay") {
              setPreferredView(view.type);
            }
            void refreshEvents(startStr, endStr, activeSectionIds, activeCoachIds);
          }}
          eventDidMount={(arg) => {
            const details = arg.event.extendedProps as {
              section: string;
              coach: string;
              location: string;
              type: string;
              titleKind: string;
              startTime: string;
              endTime: string;
            };

            const sectionColor = sectionColorByName.get(details.section) ?? SECTION_COLORS[0];
            const eventStart = arg.event.start?.getTime() ?? 0;
            const isUpcoming = eventStart > new Date().getTime();

            if (isUpcoming) {
              arg.el.classList.add("fc-event-upcoming");
              arg.el.style.backgroundColor = sectionColor.text;
              arg.el.style.borderColor = sectionColor.text;
              arg.el.style.color = "#ffffff";
            } else {
              arg.el.classList.remove("fc-event-upcoming");
            }

            arg.el.style.boxShadow = "0 1px 0 rgba(15,23,42,0.06)";

            arg.el.title = [
              details.section,
              `${details.type.toUpperCase()} - ${details.titleKind}`,
              `Coach: ${details.coach}`,
              `Lieu: ${details.location}`,
              `Horaire: ${details.startTime} - ${details.endTime}`,
            ].join("\n");
          }}
          eventClick={(arg) => {
            const details = arg.event.extendedProps as {
              section: string;
              coach: string;
              location: string;
              type: string;
              titleKind: string;
              startTime: string;
              endTime: string;
            };

            if (canManage) {
              const matched = trainings.find((training) => training.id === arg.event.id);
              if (matched) {
                openEditForm(matched);
              }
              return;
            }

            setSelectedTraining({
              section: details.section,
              coach: details.coach,
              training: details.titleKind,
              courseType: details.type,
              location: details.location,
              startTime: details.startTime,
              endTime: details.endTime,
            });
          }}
          eventContent={(arg) => {
            const details = arg.event.extendedProps as {
              titleKind: string;
              location: string;
              startTime: string;
              endTime: string;
            };

            return (
              <div className="fc-event-card">
                <div className="fc-event-title">{details.titleKind}</div>
                <div className="fc-event-time">
                  De {details.startTime} a {details.endTime}
                </div>
                {details.location?.trim() ? (
                  <div className="fc-event-location-tag">{details.location}</div>
                ) : null}
              </div>
            );
          }}
        />
      </div>

      {selectedTraining ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900">Détails du créneau</h3>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setSelectedTraining(null)}
              >
                Fermer
              </button>
            </div>

            <div className="mt-3 space-y-1.5 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-900">Section :</span> {selectedTraining.section}</p>
              <p><span className="font-semibold text-slate-900">Entraineur :</span> {selectedTraining.coach}</p>
              <p><span className="font-semibold text-slate-900">Entrainement :</span> {selectedTraining.training}</p>
              <p><span className="font-semibold text-slate-900">Stage / Cours :</span> {selectedTraining.courseType}</p>
              <p><span className="font-semibold text-slate-900">Lieu :</span> {selectedTraining.location}</p>
              <p>
                <span className="font-semibold text-slate-900">Horaires :</span> {selectedTraining.startTime} - {selectedTraining.endTime}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {canManage && formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900">
                {editingTrainingId ? "Modifier le creneau" : "Ajouter un creneau"}
              </h3>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setFormOpen(false);
                  setEditingTrainingId(null);
                }}
              >
                Fermer
              </button>
            </div>

            <form className="mt-3 grid gap-3" onSubmit={submitTrainingForm}>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1 text-sm text-slate-700">
                  Section
                  <select
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={trainingForm.sectionId}
                    onChange={(event) => {
                      const sectionId = event.target.value;
                      const suggested = findDefaultCoachForSection(sectionId, sections, users);
                      setTrainingForm((state) => ({
                        ...state,
                        sectionId,
                        coachId: suggested?.id ?? state.coachId,
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

                <label className="grid gap-1 text-sm text-slate-700">
                  Entraineur
                  <select
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={trainingForm.coachId}
                    onChange={(event) =>
                      setTrainingForm((state) => ({ ...state, coachId: event.target.value }))
                    }
                    required
                  >
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1 text-sm text-slate-700">
                  Entrainement
                  <select
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={trainingForm.title}
                    onChange={(event) =>
                      setTrainingForm((state) => ({ ...state, title: event.target.value as "GLACE" | "PPG" | "SOL" }))
                    }
                  >
                    <option value="GLACE">GLACE</option>
                    <option value="PPG">PPG</option>
                    <option value="SOL">SOL</option>
                  </select>
                </label>

                <label className="grid gap-1 text-sm text-slate-700">
                  Stage / Cours
                  <select
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={trainingForm.type}
                    onChange={(event) =>
                      setTrainingForm((state) => ({
                        ...state,
                        type: event.target.value as "HEBDOMADAIRE" | "STAGE",
                      }))
                    }
                  >
                    <option value="HEBDOMADAIRE">COURS</option>
                    <option value="STAGE">STAGE</option>
                  </select>
                </label>

                <label className="grid gap-1 text-sm text-slate-700">
                  Date
                  <input
                    type="date"
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={trainingForm.date}
                    onChange={(event) =>
                      setTrainingForm((state) => ({ ...state, date: event.target.value }))
                    }
                    required
                  />
                </label>

                <label className="grid gap-1 text-sm text-slate-700">
                  Lieu
                  <input
                    type="text"
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={trainingForm.location}
                    onChange={(event) =>
                      setTrainingForm((state) => ({ ...state, location: event.target.value }))
                    }
                    required
                  />
                </label>

                <label className="grid gap-1 text-sm text-slate-700">
                  Debut
                  <input
                    type="time"
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={trainingForm.startTime}
                    onChange={(event) =>
                      setTrainingForm((state) => ({ ...state, startTime: event.target.value }))
                    }
                    required
                  />
                </label>

                <label className="grid gap-1 text-sm text-slate-700">
                  Fin
                  <input
                    type="time"
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={trainingForm.endTime}
                    onChange={(event) =>
                      setTrainingForm((state) => ({ ...state, endTime: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>

              <label className="grid gap-1 text-sm text-slate-700">
                Notes
                <textarea
                  className="min-h-20 rounded-md border border-slate-300 px-3 py-2"
                  value={trainingForm.notes}
                  onChange={(event) =>
                    setTrainingForm((state) => ({ ...state, notes: event.target.value }))
                  }
                />
              </label>

              {formMessage ? <p className="text-sm text-rose-600">{formMessage}</p> : null}

              <div className="flex justify-end gap-2">
                {editingTrainingId ? (
                  <button
                    type="button"
                    className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
                    onClick={() => void deleteTrainingFromForm()}
                    disabled={formLoading}
                  >
                    Supprimer
                  </button>
                ) : null}
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingTrainingId(null);
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-cyan-700 bg-cyan-700 px-3 py-2 text-sm font-semibold text-white"
                  disabled={formLoading}
                >
                  {formLoading ? "Enregistrement..." : editingTrainingId ? "Modifier" : "Creer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
