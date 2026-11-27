import type { Member } from "@/api/members";
import { toAbsoluteFileUrl } from "@/config/env";

const toPosition = (value: string) => value.replace(/_/g, " ");

export function toVisionMember(member: Member, fallbackPhoto: string) {
  return {
    id: member.id,
    name: member.name,
    affiliation: member.affiliation,
    photo_url: member.photo_url ? toAbsoluteFileUrl(member.photo_url) : fallbackPhoto,
    instagram_url: member.instagram_url || null,
    youtube_url: member.youtube_url || null,
    roles: member.member_roles?.map(role => toPosition(role.role_type)) || [],
    worship_positions: member.member_worship_positions?.map(position => toPosition(position.position_type)) || [],
    step_positions: member.member_step_positions?.map(position => toPosition(position.position_type)) || [],
    description: member.description || "",
  };
}

export type VisionMember = ReturnType<typeof toVisionMember>;
