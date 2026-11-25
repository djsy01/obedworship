import { computed, reactive, onMounted, ref } from "vue";
import { isAxiosError } from "axios";
import { authApi, type User } from "@/api/auth";
import { ticketApplicationApi, type Ticket } from "@/api/tickets";
import { ticketPrices } from "@/composables/useTicketForm";

export function useTicketApplication(ticket: Ticket, close: () => void) {
  const profile = ref<User>();
  const quantities = reactive({ price_infant: 0, price_teen: 0, price_military: 0, price_adult: 0 });
  const total = computed(() => Object.values(quantities).reduce((sum, count) => sum + count, 0));
  const amount = computed(() => ticketPrices.reduce((sum, { key }) => sum + quantities[key] * (ticket[key] ?? 0), 0));
  const note = ref("");
  const agreed = ref(false);
  const saving = ref(false);
  onMounted(async () => {
    try {
      profile.value = (await authApi.getCurrentUser()).data.data;
    } catch {
      alert("신청자 정보를 확인할 수 없습니다. 다시 로그인해주세요.");
      close();
    }
  });
  async function submit() {
    const user = profile.value;
    if (!user || !agreed.value || total.value < 1 || saving.value) return;
    saving.value = true;
    try {
      await ticketApplicationApi.create({
        ticket_id: ticket.id, user_id: user.id, applicant_name: user.name, applicant_phone: user.phone || "미등록",
        applicant_email: user.email, party_size: total.value, memo: note.value || undefined,
      });
      alert("집회 신청이 완료되었습니다.");
      close();
    } catch (err) {
      alert(isAxiosError(err) && err.response?.data?.message || "신청 처리 중 오류가 발생했습니다.");
    } finally {
      saving.value = false;
    }
  }
  return { profile, quantities, total, amount, note, agreed, saving, submit };
}
