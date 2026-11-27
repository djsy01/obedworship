import { computed, ref, type Ref } from "vue";
import type { VisionMember } from "./visionMember";

type Filter = "all" | "leader" | "worship" | "step";

export function useVisionFilters(members: Ref<VisionMember[]>) {
  const filter = ref<Filter>("all");
  const worshipFilter = ref("");
  const stepFilter = ref("");

  const roleOrder: Record<string, number> = { Pastor: 1, Elder: 2, "Worship Team Leader": 3, "Accounting Leader": 4, "Lead Singer": 5, "Singer Leader": 6, "Session Leader": 7, "Planning Leader": 8, "Media Leader": 9, "Stage Leader": 10, "Prayer Leader": 11 };

  const filteredMembers = computed(() => {
    let f = members.value;
    if (filter.value === "leader") f = f.filter((m) => m.roles.length > 0);
    else if (filter.value === "worship") f = f.filter((m) => m.worship_positions.length > 0);
    else if (filter.value === "step") f = f.filter((m) => m.step_positions.length > 0);

    if (filter.value === "worship" && worshipFilter.value) {
      const wf = worshipFilter.value;
      if (wf === "Piano") f = f.filter((m) => m.worship_positions.some((p) => ["Piano", "Synthesizer"].includes(p)));
      else if (wf === "Guitar") f = f.filter((m) => m.worship_positions.some((p) => ["Acoustic Guitar", "Lead Guitar", "Backing Guitar", "Bass Guitar"].includes(p)));
      else f = f.filter((m) => m.worship_positions.includes(wf));
    }
    if (filter.value === "step" && stepFilter.value) {
      const sf = stepFilter.value;
      if (sf === "Accounting Team") f = f.filter((m) => m.step_positions.includes("Accounting Team") || m.roles.includes("Accounting Leader"));
      else if (sf === "Planning Team") f = f.filter((m) => m.step_positions.some((p) => ["Planning Team", "Instagram Manager", "Poster Designer", "Guidebook Designer"].includes(p)) || m.roles.includes("Planning Leader"));
      else if (sf === "Media Team") f = f.filter((m) => m.step_positions.some((p) => ["Media Team", "Camera Operator", "Video Editor", "YouTube Manager", "Mix Engineer", "Master Engineer", "Music Producer"].includes(p)) || m.roles.includes("Media Leader"));
      else if (sf === "Stage Team") f = f.filter((m) => m.step_positions.some((p) => ["Stage Team", "Live Engineer", "Stage Designer", "Lighting Operator", "Audio Setup", "Preproduction"].includes(p)) || m.roles.includes("Stage Leader"));
      else if (sf === "Prayer Team") f = f.filter((m) => m.step_positions.includes("Prayer Team") || m.roles.includes("Prayer Leader"));
    }

    return [...f].sort((a, b) => {
      const min = (roles: string[]) => roles.length ? Math.min(...roles.map((r) => roleOrder[r] || 99)) : 99;
      return min(a.roles) - min(b.roles) || a.name.localeCompare(b.name, "ko-KR");
    });
  });

  const handleMainFilter = (value: Filter) => { filter.value = value; worshipFilter.value = ""; stepFilter.value = ""; };
  return { filter, worshipFilter, stepFilter, filteredMembers, handleMainFilter };
}
