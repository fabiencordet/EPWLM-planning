"use client";

import { useState } from "react";
import type { WeekType } from "@prisma/client";
import AdminMemberManager from "@/components/admin-member-manager";
import AdminTrainingManager from "@/components/admin-training-manager";

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

type Props = {
  sections: SectionOption[];
  users: UserOption[];
  initialItems: TrainingApi[];
  initialWeekType: WeekType;
  initialMembers: MemberItem[];
};

export default function AdminBackofficeTabs({
  sections,
  users,
  initialItems,
  initialWeekType,
  initialMembers,
}: Props) {
  const [activeTab, setActiveTab] = useState<"members" | "trainings">("members");

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-700 pb-3">
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "members"
              ? "bg-cyan-700 text-white"
              : "border border-slate-700 bg-slate-900 text-slate-300"
          }`}
          onClick={() => setActiveTab("members")}
        >
          Gestion des adherents
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "trainings"
              ? "bg-cyan-700 text-white"
              : "border border-slate-700 bg-slate-900 text-slate-300"
          }`}
          onClick={() => setActiveTab("trainings")}
        >
          Gestion des creneaux
        </button>
      </div>

      {activeTab === "members" ? (
        <AdminMemberManager
          sections={sections}
          initialMembers={initialMembers}
        />
      ) : (
        <AdminTrainingManager
          sections={sections}
          users={users}
          initialItems={initialItems}
          initialWeekType={initialWeekType}
        />
      )}
    </>
  );
}
