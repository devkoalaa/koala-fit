"use client";

import { useEffect } from "react";

const EDITABLE = "input, textarea, select, [contenteditable]";

/**
 * iOS standalone (WebKit): se o app vai para o segundo plano com o teclado
 * aberto, ao voltar a viewport continua "encolhida" e os elementos fixed (menu
 * de baixo, timer de descanso) ficam presos onde era o topo do teclado, no meio
 * da tela. Duas defesas:
 * - ao esconder o app, tira o foco do campo para o teclado fechar antes;
 * - ao voltar, ou quando a viewport visível cresce (teclado fechou), um scroll
 *   de 1px força o WebKit a recalcular a posição dos elementos fixed.
 */
export function ViewportRecovery() {
  useEffect(() => {
    const relayout = () =>
      requestAnimationFrame(() => {
        const { scrollX, scrollY } = window;
        window.scrollTo(scrollX, scrollY + 1);
        window.scrollTo(scrollX, scrollY);
      });

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        const el = document.activeElement;
        if (el instanceof HTMLElement && el.matches(EDITABLE)) el.blur();
      } else {
        relayout();
      }
    };

    const viewport = window.visualViewport;
    let lastHeight = viewport?.height ?? 0;
    const onViewportResize = () => {
      if (!viewport) return;
      // Só quando cresce de forma significativa: é o teclado fechando.
      if (viewport.height > lastHeight + 100) relayout();
      lastHeight = viewport.height;
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", relayout);
    viewport?.addEventListener("resize", onViewportResize);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", relayout);
      viewport?.removeEventListener("resize", onViewportResize);
    };
  }, []);

  return null;
}
