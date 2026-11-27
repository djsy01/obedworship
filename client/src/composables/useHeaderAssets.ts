import { ref } from "vue";
import { assetApi } from "@/api/assets";
import { toAbsoluteFileUrl } from "@/config/env";

export function useHeaderAssets() {
  const logo = ref("");
  const playlist = ref<string[]>([]);

  assetApi.getByKey("home_logo").then(({ data }) => {
    if (data.file_url) logo.value = toAbsoluteFileUrl(data.file_url);
  }).catch(() => {});
  assetApi.getByCategory("songs").then(({ data }) => {
    if (!Array.isArray(data)) return;
    playlist.value = data.slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .filter(song => song.file_url).map(song => toAbsoluteFileUrl(song.file_url));
  }).catch(() => {});

  return { logo, playlist };
}
