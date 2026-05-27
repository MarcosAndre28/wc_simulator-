"use client";

import { useCallback, useEffect, useState } from "react";

const MIN_SCALE_MOBILE = 0.65;
const MIN_SCALE_TABLET = 0.72;
const MIN_SCALE_DESKTOP = 0.75;

function getMinScale(viewportWidth: number): number {
  if (viewportWidth < 640) {
    return MIN_SCALE_MOBILE;
  }
  if (viewportWidth < 1024) {
    return MIN_SCALE_TABLET;
  }
  return MIN_SCALE_DESKTOP;
}

export type BracketLayoutSize = {
  width: number;
  height: number;
};

export function useBracketScale(
  containerRef: React.RefObject<HTMLElement | null>,
  treeRef: React.RefObject<HTMLElement | null>,
) {
  const [scale, setScale] = useState(1);
  const [naturalSize, setNaturalSize] = useState<BracketLayoutSize>({ width: 0, height: 0 });
  const [layoutSize, setLayoutSize] = useState<BracketLayoutSize>({ width: 0, height: 0 });
  const [atMinScale, setAtMinScale] = useState(false);

  const recalculate = useCallback(() => {
    const container = containerRef.current;
    const tree = treeRef.current;
    if (!container || !tree) {
      return;
    }

    const availableW = container.clientWidth;
    const availableH = container.clientHeight;
    const treeWidth = tree.offsetWidth || tree.scrollWidth;
    const treeHeight = tree.offsetHeight || tree.scrollHeight;

    if (treeWidth <= 0 || treeHeight <= 0) {
      return;
    }

    const minScale = getMinScale(window.innerWidth);
    let scaleW = 1;
    let scaleH = 1;

    if (treeWidth > availableW) {
      scaleW = availableW / treeWidth;
    }
    if (availableH > 48 && treeHeight > availableH) {
      scaleH = availableH / treeHeight;
    }

    const raw = Math.min(scaleW, scaleH);
    const nextScale = raw < 1 ? Math.max(minScale, raw) : 1;

    setScale(nextScale);
    setNaturalSize({ width: treeWidth, height: treeHeight });
    setLayoutSize({
      width: Math.ceil(treeWidth * nextScale),
      height: Math.ceil(treeHeight * nextScale),
    });
    setAtMinScale(
      nextScale <= minScale + 0.02 &&
        (treeWidth > availableW || (availableH > 48 && treeHeight > availableH)),
    );
  }, [containerRef, treeRef]);

  useEffect(() => {
    recalculate();

    const container = containerRef.current;
    const tree = treeRef.current;
    if (!container || !tree) {
      return;
    }

    const observer = new ResizeObserver(() => {
      recalculate();
    });

    observer.observe(container);
    observer.observe(tree);

    window.addEventListener("resize", recalculate);
    window.addEventListener("orientationchange", recalculate);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recalculate);
      window.removeEventListener("orientationchange", recalculate);
    };
  }, [containerRef, treeRef, recalculate]);

  return { scale, naturalSize, layoutSize, atMinScale, recalculate };
}
