/**
 * Helper functions for TestManagement
 */

type TranslationEntry = { language: string; value: string };

export const isTranslationArray = (field: unknown): field is TranslationEntry[] =>
  Array.isArray(field);

export const extractText = (field: unknown, lang: string = "vi"): string => {
  if (isTranslationArray(field)) {
    const byLang = field.find((f) => f?.language === lang)?.value?.trim();
    if (byLang) return byLang;
    const vi = field.find((f) => f?.language === "vi")?.value?.trim();
    if (vi) return vi;
    const en = field.find((f) => f?.language === "en")?.value?.trim();
    if (en) return en;
    const first = field.find((f) => f?.value)?.value?.trim();
    return first || "";
  }
  if (typeof field === "string") return field;
  return "";
};

export const getTranslation = (field: unknown, language: string): string => {
  if (isTranslationArray(field)) {
    return field.find((f) => f?.language === language)?.value || "";
  }
  return typeof field === "string" ? field : "";
};

