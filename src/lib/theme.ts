export const THEME_COOKIE = "koala-theme";
export type ThemePreference = "light" | "dark" | "system";

export function isThemePreference(value: string | undefined): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/** Explicit choices are known at render time; "system" is resolved client-side to avoid a server/OS mismatch. */
export function resolvedDataTheme(pref: ThemePreference): "light" | "dark" | undefined {
  return pref === "system" ? undefined : pref;
}
