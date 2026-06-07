"use client";

import { FormEvent, useMemo, useState } from "react";

type SectionOption = { id: string; name: string; code: string };

type MemberItem = {
  membershipId: string;
  skaterId: string;
  sectionId: string;
  sectionName: string;
  firstName: string;
  lastName: string;
  city: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
};

type FormState = {
  sectionId: string;
  firstName: string;
  lastName: string;
  city: string;
  parentEmail: string;
  parentPhone: string;
};

type Props = {
  sections: SectionOption[];
  initialMembers?: MemberItem[];
};

function emptyForm(sectionId = ""): FormState {
  return {
    sectionId,
    firstName: "",
    lastName: "",
    city: "",
    parentEmail: "",
    parentPhone: "",
  };
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function AdminMemberManager({ sections, initialMembers = [] }: Props) {
  const defaultSectionId = sections[0]?.id ?? "";

  const [members, setMembers] = useState<MemberItem[]>(initialMembers);
  const [editingMembershipId, setEditingMembershipId] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<
    "none" | "dance-national" | "dance-adult" | "dance-regional"
  >("none");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(defaultSectionId));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const normalizedSearch = normalize(search.trim());
  const matchingDanceActions = useMemo(() => {
    if (!normalizedSearch) return [] as Array<{
      key: "dance-national" | "dance-adult" | "dance-regional";
      label: string;
    }>;

    const actions = [
      { key: "dance-national" as const, label: "Filtrer les danseurs nationaux" },
      { key: "dance-adult" as const, label: "Filtrer les danseurs adultes" },
      { key: "dance-regional" as const, label: "Filtrer les danseurs regionaux" },
    ];

    return actions.filter((action) => normalize(action.label).includes(normalizedSearch));
  }, [normalizedSearch]);

  const filteredMembers = useMemo(() => {
    const q = normalize(search.trim());

    return members.filter((member) => {
      const normalizedSectionName = normalize(member.sectionName ?? "");

      if (quickFilter === "dance-national" && !normalizedSectionName.includes("danse nationaux")) {
        return false;
      }

      if (quickFilter === "dance-adult" && !normalizedSectionName.includes("danse adultes")) {
        return false;
      }

      if (quickFilter === "dance-regional" && !normalizedSectionName.includes("danse regionaux")) {
        return false;
      }

      if (!q) return true;

      const haystack = normalize(
        [
          member.lastName,
          member.firstName,
          member.parentPhone ?? "",
          member.city ?? "",
          member.parentEmail ?? "",
          member.sectionName ?? "",
        ].join(" "),
      );

      return haystack.includes(q);
    });
  }, [members, quickFilter, search]);

  async function refreshMembers(params?: { sectionId?: string; q?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.sectionId) searchParams.set("sectionId", params.sectionId);
    if (params?.q) searchParams.set("q", params.q);

    const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
    const response = await fetch(`/api/section-members${suffix}`);
    const data = await response.json();
    setMembers(data.members ?? []);
  }

  function openCreatePopup() {
    setEditingMembershipId(null);
    setForm(emptyForm(defaultSectionId));
    setMessage("");
    setFormOpen(true);
  }

  function openEditPopup(member: MemberItem) {
    setEditingMembershipId(member.membershipId);
    setForm({
      sectionId: member.sectionId,
      firstName: member.firstName,
      lastName: member.lastName,
      city: member.city ?? "",
      parentEmail: member.parentEmail ?? "",
      parentPhone: member.parentPhone ?? "",
    });
    setMessage("");
    setFormOpen(true);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const payload = {
      sectionId: form.sectionId,
      firstName: form.firstName,
      lastName: form.lastName,
      city: form.city,
      parentEmail: form.parentEmail,
      parentPhone: form.parentPhone,
    };

    const endpoint = editingMembershipId
      ? `/api/section-members/${editingMembershipId}`
      : "/api/section-members";
    const method = editingMembershipId ? "PATCH" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);

    setLoading(false);

    if (!response.ok) {
      const serverMessage = typeof data?.error === "string" ? data.error : null;
      setMessage(serverMessage ?? "Erreur lors de l'enregistrement de l'adherent.");
      return;
    }

    setFormOpen(false);
    setEditingMembershipId(null);
    setForm(emptyForm(defaultSectionId));
    setMessage(editingMembershipId ? "Adherent modifie." : "Adherent ajoute.");
    await refreshMembers();
  }

  async function removeMember(membershipId: string) {
    const ok = window.confirm("Retirer cet adherent de la section ?");
    if (!ok) return;

    const response = await fetch(`/api/section-members/${membershipId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("Erreur lors de la suppression de l'adherent.");
      return;
    }

    setMessage("Adherent retire de la section.");
    await refreshMembers();
  }

  return (
    <section className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Gestion des adherents</h2>
        <button
          type="button"
          className="rounded-md border border-cyan-700 px-3 py-1.5 text-sm text-cyan-200"
          onClick={openCreatePopup}
        >
          Nouvel adherent
        </button>
      </div>

      <div className="rounded-lg border border-slate-800 p-3">
        <label className="grid gap-1 text-sm">
          Rechercher un adherent
          <input
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
            placeholder="Nom, prenom, telephone, ville..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        {matchingDanceActions.length > 0 ? (
          <div className="mt-3 rounded-md border border-cyan-800/70 bg-cyan-950/40 p-3">
            <p className="text-xs uppercase tracking-wide text-cyan-300">Actions DANSE</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {matchingDanceActions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    quickFilter === action.key
                      ? "border-cyan-300 bg-cyan-100 text-cyan-900"
                      : "border-slate-700 bg-slate-900 text-slate-300"
                  }`}
                  onClick={() => setQuickFilter(action.key)}
                >
                  {action.label}
                </button>
              ))}
              <button
                type="button"
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-300 transition"
                onClick={() => setQuickFilter("none")}
              >
                Retirer le filtre rapide
              </button>
            </div>
          </div>
        ) : null}

        {quickFilter !== "none" ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
            <span>Filtre actif :</span>
            <span className="rounded-full border border-cyan-700 bg-cyan-950/40 px-2 py-1 text-cyan-200">
              {quickFilter === "dance-national"
                ? "Danse nationaux"
                : quickFilter === "dance-adult"
                  ? "Danse adultes"
                  : "Danse regionaux"}
            </span>
            <button
              type="button"
              className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-slate-300"
              onClick={() => setQuickFilter("none")}
            >
              Effacer
            </button>
          </div>
        ) : null}
      </div>

      {message ? <p className="mt-3 text-sm text-slate-300">{message}</p> : null}

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-left text-slate-300">
            <tr>
              <th className="px-3 py-2">Nom</th>
              <th className="px-3 py-2">Prenom</th>
              <th className="px-3 py-2">Ville</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Telephone</th>
              <th className="px-3 py-2">Section</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.membershipId} className="border-t border-slate-800">
                <td className="px-3 py-2">{member.lastName}</td>
                <td className="px-3 py-2">{member.firstName}</td>
                <td className="px-3 py-2">{member.city || "-"}</td>
                <td className="px-3 py-2">{member.parentEmail || "-"}</td>
                <td className="px-3 py-2">{member.parentPhone || "-"}</td>
                <td className="px-3 py-2">{member.sectionName}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      className="rounded-md border border-slate-700 px-2 py-1 text-xs"
                      type="button"
                      onClick={() => openEditPopup(member)}
                    >
                      Modifier
                    </button>
                    <button
                      className="rounded-md border border-rose-700 px-2 py-1 text-xs text-rose-200"
                      type="button"
                      onClick={() => void removeMember(member.membershipId)}
                    >
                      Retirer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-400" colSpan={7}>
                  Aucun adherent correspondant.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold">
                {editingMembershipId ? "Modifier adherent" : "Nouvel adherent"}
              </h3>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setFormOpen(false);
                  setEditingMembershipId(null);
                }}
              >
                Fermer
              </button>
            </div>

            <form className="mt-3 grid gap-3" onSubmit={onSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1 text-sm">
                  Section
                  <select
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={form.sectionId}
                    onChange={(event) => setForm((state) => ({ ...state, sectionId: event.target.value }))}
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
                  Ville
                  <input
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={form.city}
                    onChange={(event) => setForm((state) => ({ ...state, city: event.target.value }))}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  Prenom
                  <input
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={form.firstName}
                    onChange={(event) => setForm((state) => ({ ...state, firstName: event.target.value }))}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  Nom
                  <input
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={form.lastName}
                    onChange={(event) => setForm((state) => ({ ...state, lastName: event.target.value }))}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  Email parent
                  <input
                    className="rounded-md border border-slate-300 px-3 py-2"
                    type="email"
                    value={form.parentEmail}
                    onChange={(event) => setForm((state) => ({ ...state, parentEmail: event.target.value }))}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  Telephone parent
                  <input
                    className="rounded-md border border-slate-300 px-3 py-2"
                    value={form.parentPhone}
                    onChange={(event) => setForm((state) => ({ ...state, parentPhone: event.target.value }))}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingMembershipId(null);
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-cyan-700 bg-cyan-700 px-3 py-2 text-sm font-semibold text-white"
                  disabled={loading}
                >
                  {loading ? "Enregistrement..." : editingMembershipId ? "Modifier" : "Creer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
