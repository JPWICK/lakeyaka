import maskNaga from "@/assets/mask-naga.jpg";
import maskGurulu from "@/assets/mask-gurulu2.jpg";
import maskMaru from "@/assets/mask-maru.jpg";
import maskSanni from "@/assets/mask-sanni.jpg";
import maskKolam from "@/assets/mask-kolam.jpg";
import heroMask from "@/assets/hero-mask.jpg";
import giniMask from "@/assets/gini-mask.jpg";

const map: Record<string, string> = {
  "mask-naga": maskNaga,
  "mask-gurulu": maskGurulu,
  "mask-maru": maskMaru,
  "mask-sanni": maskSanni,
  "mask-kolam": maskKolam,
  "hero-mask": heroMask,
  "gini-mask": giniMask,
};

export function resolveImage(slug?: string | null): string {
  if (!slug) return heroMask;
  if (slug.startsWith("http")) return slug;
  return map[slug] ?? heroMask;
}

export const heroImage = heroMask;
