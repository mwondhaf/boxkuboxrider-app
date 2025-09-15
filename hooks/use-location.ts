import type { LocationObject, LocationSubscription } from "expo-location";
import {
  getCurrentPositionAsync,
  getForegroundPermissionsAsync,
  LocationAccuracy,
  requestForegroundPermissionsAsync,
  watchPositionAsync,
} from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking, Platform } from "react-native";

export type Status = "granted" | "denied" | "undetermined";

type UseLocationState = {
  status: Status;
  location: LocationObject | null;
  error: string | null;
  isPolling: boolean;
};

type UseLocationOptions = {
  autoStart?: boolean; // if true, request permission and start watching on mount
  listenAppState?: boolean; // if true, refresh permission when app returns to foreground
};

export type UseLocation = UseLocationState & {
  requestPermission: () => Promise<Status>;
  checkPermission: () => Promise<Status>;
  refreshNow: () => Promise<void>;
  start: () => void;
  stop: () => void;
  openSettings: () => Promise<void>;
};
// Watch options per docs: https://docs.expo.dev/versions/latest/sdk/location/#locationoptions
const DISTANCE_INTERVAL_METERS = 10;
const TIME_INTERVAL_MS = 30_000; // 30 seconds
const ACCURACY = LocationAccuracy.Balanced;

export const useLocation = (options: UseLocationOptions = {}): UseLocation => {
  const [state, setState] = useState<UseLocationState>({
    status: "undetermined",
    location: null,
    error: null,
    isPolling: false,
  });
  const subscriptionRef = useRef<LocationSubscription | null>(null);
  const canceledRef = useRef(false);
  const { autoStart = true, listenAppState = false } = options;

  const requestPermission = useCallback(async (): Promise<Status> => {
    try {
      const { status } = await requestForegroundPermissionsAsync();
      setState((s) => ({ ...s, status }));
      return status;
    } catch (e) {
      setState((s) => ({ ...s, error: (e as Error).message }));
      return "denied" as const;
    }
  }, []);

  const checkPermission = useCallback(async (): Promise<Status> => {
    try {
      const { status } = await getForegroundPermissionsAsync();
      setState((s) => ({ ...s, status }));
      return status as Status;
    } catch (e) {
      setState((s) => ({ ...s, error: (e as Error).message }));
      return "denied" as const;
    }
  }, []);

  const fetchOnce = useCallback(async () => {
    try {
      const loc = await getCurrentPositionAsync({});
      if (!canceledRef.current) {
        setState((s) => ({ ...s, location: loc, error: null }));
      }
    } catch (e) {
      if (!canceledRef.current) {
        setState((s) => ({ ...s, error: (e as Error).message }));
      }
    }
  }, []);

  const refreshNow = useCallback(async () => {
    await fetchOnce();
  }, [fetchOnce]);

  const stop = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setState((s) => ({ ...s, isPolling: false }));
  }, []);

  const start = useCallback(() => {
    if (subscriptionRef.current) {
      return; // already running
    }
    // Start watching with the requested intervals; also update immediately via callback.
    const run = async () => {
      try {
        subscriptionRef.current = await watchPositionAsync(
          {
            accuracy: ACCURACY,
            distanceInterval: DISTANCE_INTERVAL_METERS,
            timeInterval: TIME_INTERVAL_MS,
          },
          (loc) => {
            if (!canceledRef.current) {
              setState((s) => ({ ...s, location: loc, error: null }));
            }
          }
        );
        setState((s) => ({ ...s, isPolling: true }));
      } catch (e) {
        if (!canceledRef.current) {
          setState((s) => ({ ...s, error: (e as Error).message }));
        }
      }
    };
    run();
  }, []);

  // Initialize
  useEffect(() => {
    canceledRef.current = false;
    (async () => {
      if (autoStart) {
        const status = await requestPermission();
        if (status === "granted") {
          await fetchOnce();
          start();
        }
      } else {
        await checkPermission();
      }
    })();
    return () => {
      canceledRef.current = true;
      stop();
    };
  }, [autoStart, requestPermission, checkPermission, fetchOnce, start, stop]);

  // Refresh permission when app returns to foreground
  useEffect(() => {
    if (!listenAppState) {
      return;
    }
    const appStateSub = AppState.addEventListener("change", (appState) => {
      if (appState === "active") {
        // Fire and forget; state will be updated by checkPermission
        checkPermission().catch(() => {
          // no-op
        });
      }
    });
    return () => {
      appStateSub.remove();
    };
  }, [listenAppState, checkPermission]);

  const openSettings = useCallback(async () => {
    if (Platform.OS === "ios") {
      await Linking.openURL("app-settings:");
    } else {
      await Linking.openSettings();
    }
  }, []);

  return {
    ...state,
    requestPermission,
    checkPermission,
    refreshNow,
    start,
    stop,
    openSettings,
  };
};

export default useLocation;
