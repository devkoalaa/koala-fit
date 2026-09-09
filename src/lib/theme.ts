export const THEME_COOKIE = "koala-theme";
export type ThemePreference = "light" | "dark" | "system";

export function isThemePreference(value: string | undefined): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/** Explicit choices are known at render time; "system" is resolved client-side to avoid a server/OS mismatch. */
export function resolvedDataTheme(pref: ThemePreference): "light" | "dark" | undefined {
  return pref === "system" ? undefined : pref;
}

/**
 * Background of each theme, mirrored from `--color-bg` in tokens.css.
 * Used as `theme-color`, which is what iOS paints behind the status bar of an
 * installed web app — it has to follow the *resolved* theme, not just the OS.
 */
export const THEME_BACKGROUND: Record<"light" | "dark", string> = {
  light: "#faf9f7",
  dark: "#18160f",
};
