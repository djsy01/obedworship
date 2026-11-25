import { computed, ref } from "vue";
import { ticketApi, type CreateTicketDto, type Ticket } from "@/api/tickets";
import { worshipApi, type Worship } from "@/api/worship";
import { worshipPhotoApi } from "@/api/worship-photos";
import { toAbsoluteFileUrl } from "@/config/env";

export const ticketPrices = [
  { key: "price_infant", label: "영유아", description: "영아, 유치원생, 초등학생" },
  { key: "price_teen", label: "청소년", description: "중학생, 고등학생" },
  { key: "price_military", label: "군인", description: "직업군인 제외" },
  { key: "price_adult", label: "어른", description: "" },
] as const;

function defaults(ticket?: Ticket): CreateTicketDto {
  return {
    title: ticket?.title ?? "", date: ticket?.date ?? "", year: ticket?.year ?? new Date().getFullYear(),
    place: ticket?.place ?? "", preacher: ticket?.preacher ?? "", description: ticket?.description ?? "",
    poster_url: ticket?.poster_url, price_infant: ticket?.price_infant ?? 0, price_teen: ticket?.price_teen ?? 5000,
    price_military: ticket?.price_military ?? 5000, price_adult: ticket?.price_adult ?? 10000, status: ticket?.status ?? "OPEN",
  };
}
export function useTicketForm(ticket?: Ticket) {
  const fields = ref(defaults(ticket));
  const worships = ref<Worship[]>([]);
  const worshipId = ref<number>();
  const saving = ref(false);
  const poster = computed(() => toAbsoluteFileUrl(fields.value.poster_url));

  async function loadWorships() {
    try {
      worships.value = (await worshipApi.getAll()).data;
    } catch {
      alert("집회 안내 정보를 불러오지 못했습니다.");
    }
  }
  function selectWorship() {
    const worship = worships.value.find(item => item.id === worshipId.value);
    fields.value = defaults();
    if (worship) {
      const { title, date, year, location, preacher, description, poster_url } = worship;
      Object.assign(fields.value, { title, date, year, place: location, preacher, description, poster_url });
    }
  }
  async function save(file?: File) {
    saving.value = true;
    try {
      const data = { ...fields.value };
      if (file) data.poster_url = (await worshipPhotoApi.uploadFile(file)).data.url;
      if (ticket) await ticketApi.update(ticket.id, data);
      else await ticketApi.create({ ...data, worship_id: worshipId.value });
      return true;
    } catch {
      alert("집회 정보를 저장하지 못했습니다.");
      return false;
    } finally {
      saving.value = false;
    }
  }
  return { fields, worships, worshipId, loadWorships, selectWorship, poster, saving, save };
}
