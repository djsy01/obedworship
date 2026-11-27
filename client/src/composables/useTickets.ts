import { onMounted, ref } from "vue";
import { ticketApi, type Ticket } from "@/api/tickets";

export function useTickets() {
  const tickets = ref<Ticket[]>([]);
  const error = ref(false);
  const loading = ref(false);
  async function reload() {
    error.value = false;
    loading.value = true;
    try {
      const { data } = await ticketApi.getAll();
      tickets.value = data.sort((a, b) => b.id - a.id);
    } catch {
      error.value = true;
    } finally {
      loading.value = false;
    }
  }
  onMounted(reload);
  return { tickets, error, loading, reload };
}
