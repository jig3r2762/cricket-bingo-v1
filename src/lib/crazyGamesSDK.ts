// CrazyGames SDK v3 — method names changed from v2:
//   sdkGameLoadingStart → loadingStart
//   sdkGameLoadingStop  → loadingStop
declare global {
  interface Window {
    CrazyGames?: {
      SDK: {
        init: () => Promise<void>;
        game: {
          loadingStart: () => void;
          loadingStop: () => void;
          gameplayStart: () => void;
          gameplayStop: () => void;
        };
        ad: {
          requestAd: (
            type: "midgame" | "rewarded",
            callbacks: {
              adStarted?: () => void;
              adFinished?: () => void;
              adError?: (e: unknown) => void;
            }
          ) => void;
        };
      };
    };
  }
}

const sdk = () => window.CrazyGames?.SDK ?? null;

export async function cgInit(): Promise<void> {
  const s = sdk();
  if (!s) return;
  await s.init();
}

// Use full optional chaining on methods so missing methods never crash the app
export const cgGameLoadingStart = () => sdk()?.game?.loadingStart?.();
export const cgGameLoadingStop  = () => sdk()?.game?.loadingStop?.();
export const cgGameplayStart    = () => sdk()?.game?.gameplayStart?.();
export const cgGameplayStop     = () => sdk()?.game?.gameplayStop?.();

export function cgShowMidgameAd(): Promise<void> {
  return new Promise((resolve) => {
    const s = sdk();
    if (!s?.ad?.requestAd) return resolve();
    s.ad.requestAd("midgame", { adFinished: resolve, adError: () => resolve() });
  });
}

export function cgShowRewardedAd(): Promise<boolean> {
  return new Promise((resolve) => {
    const s = sdk();
    if (!s?.ad?.requestAd) return resolve(false);
    s.ad.requestAd("rewarded", {
      adFinished: () => resolve(true),
      adError:    () => resolve(false),
    });
  });
}
