import toast from "react-hot-toast";

export const handleCopyShortUrl = async (shortUrl: string) => {
  try {
    await navigator.clipboard.writeText(shortUrl);
    toast.success("Short URL copied to clipboard!");
  } catch {
    toast.error("Failed to copy URL");
  }
};
