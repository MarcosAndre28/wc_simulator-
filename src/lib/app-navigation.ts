/** Telas navegáveis com o botão voltar do navegador. */
export type AppScreen = "home" | "cadastro" | "torneio" | "campeao" | "chave";

const SCREEN_PARAM = "tela";

const VALID_SCREENS = new Set<AppScreen>([
  "home",
  "cadastro",
  "torneio",
  "campeao",
  "chave",
]);

export function screenFromSearchParam(tela: string | null): AppScreen {
  if (!tela || tela === "home") {
    return "home";
  }
  if (VALID_SCREENS.has(tela as AppScreen)) {
    return tela as AppScreen;
  }
  return "home";
}

export function hrefForScreen(screen: AppScreen): string {
  if (screen === "home") {
    return "/";
  }
  return `/?${SCREEN_PARAM}=${screen}`;
}

export function readScreenFromLocation(): AppScreen {
  if (typeof window === "undefined") {
    return "home";
  }
  const tela = new URLSearchParams(window.location.search).get(SCREEN_PARAM);
  return screenFromSearchParam(tela);
}
