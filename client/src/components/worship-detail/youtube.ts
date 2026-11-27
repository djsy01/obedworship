export const getYouTubeEmbedUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";

    const [, section, pathId] = url.pathname.split("/");
    let id: string | null = null;
    if (url.hostname === "youtu.be") {
      id = section;
    } else if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
      id = section === "watch" ? url.searchParams.get("v") : null;
      if (section === "embed" || section === "shorts" || section === "live") id = pathId;
    }
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube.com/embed/${id}` : "";
  } catch {
    return "";
  }
};
