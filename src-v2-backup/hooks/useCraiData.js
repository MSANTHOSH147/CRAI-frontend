// ============================================================
// hooks/useCraiData.js
// Generic async data hook giving every page the same
// loading / data / error / empty lifecycle, with abort-on-
// unmount and a manual refresh() escape hatch. This is the
// single pattern all pages use instead of ad-hoc useEffects.
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";

export function useCraiData(fetcher, deps = []) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const controllerRef = useRef(null);

  const run = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((s) => ({ ...s, status: "loading", error: null }));

    fetcher({ signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({ status: "success", data, error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", data: null, error });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const cleanup = run();
    return cleanup;
  }, [run]);

  return { ...state, refresh: run };
}
