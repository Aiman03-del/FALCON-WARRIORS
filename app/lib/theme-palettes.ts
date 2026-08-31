export type ThemePalette = {
  key: string;
  name: string;
  swatch: string; // preview dot color shown in settings UI
  vars: {
    "--fw-brand": string;
    "--fw-brand-hover": string;
    "--fw-brand-soft": string;
    "--fw-button-primary": string;
    "--fw-button-primary-hover": string;
    "--fw-glow": string;
    "--fw-glow-soft": string;
  };
};

export const THEME_PALETTES: ThemePalette[] = [
  {
    key: "indigo",
    name: "Indigo",
    swatch: "#5b75ff",
    vars: {
      "--fw-brand": "#5b75ff",
      "--fw-brand-hover": "#7d8dff",
      "--fw-brand-soft": "rgba(91, 117, 255, 0.16)",
      "--fw-button-primary": "#4b6bff",
      "--fw-button-primary-hover": "#6177ff",
      "--fw-glow": "rgba(91, 117, 255, 0.22)",
      "--fw-glow-soft": "rgba(125, 211, 252, 0.12)",
    },
  },
  {
    key: "gold",
    name: "Gold",
    swatch: "#e9b949",
    vars: {
      "--fw-brand": "#e9b949",
      "--fw-brand-hover": "#f2c968",
      "--fw-brand-soft": "rgba(233, 185, 73, 0.16)",
      "--fw-button-primary": "#d9a838",
      "--fw-button-primary-hover": "#e9b949",
      "--fw-glow": "rgba(233, 185, 73, 0.22)",
      "--fw-glow-soft": "rgba(247, 201, 72, 0.12)",
    },
  },
  {
    key: "emerald",
    name: "Emerald",
    swatch: "#24c77b",
    vars: {
      "--fw-brand": "#24c77b",
      "--fw-brand-hover": "#3fe094",
      "--fw-brand-soft": "rgba(36, 199, 123, 0.16)",
      "--fw-button-primary": "#1fae6b",
      "--fw-button-primary-hover": "#24c77b",
      "--fw-glow": "rgba(36, 199, 123, 0.22)",
      "--fw-glow-soft": "rgba(52, 211, 153, 0.12)",
    },
  },
  {
    key: "crimson",
    name: "Crimson",
    swatch: "#f45b69",
    vars: {
      "--fw-brand": "#f45b69",
      "--fw-brand-hover": "#f77c88",
      "--fw-brand-soft": "rgba(244, 91, 105, 0.16)",
      "--fw-button-primary": "#e94656",
      "--fw-button-primary-hover": "#f45b69",
      "--fw-glow": "rgba(244, 91, 105, 0.22)",
      "--fw-glow-soft": "rgba(248, 113, 113, 0.12)",
    },
  },
  {
    key: "cyan",
    name: "Cyan",
    swatch: "#38bdf8",
    vars: {
      "--fw-brand": "#38bdf8",
      "--fw-brand-hover": "#63cbfa",
      "--fw-brand-soft": "rgba(56, 189, 248, 0.16)",
      "--fw-button-primary": "#1ea9ec",
      "--fw-button-primary-hover": "#38bdf8",
      "--fw-glow": "rgba(56, 189, 248, 0.22)",
      "--fw-glow-soft": "rgba(125, 211, 252, 0.12)",
    },
  },
];

export const DEFAULT_THEME_KEY = "indigo";

export function getThemePalette(key: string): ThemePalette {
  return THEME_PALETTES.find((p) => p.key === key) ?? THEME_PALETTES[0];
}