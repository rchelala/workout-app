import { useState, useEffect, useRef, useCallback } from 'react';

interface RestTimer {
  remaining: number;
  isActive: boolean;
  startRest: (durationSecs: number) => void;
  skipRest: () => void;
}

export function useRestTimer(onComplete: () => void): RestTimer {
  const [remaining, setRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isActive && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setIsActive(false);
            onCompleteRef.current();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, remaining]);

  const startRest = useCallback((durationSecs: number) => {
    setRemaining(durationSecs);
    setIsActive(true);
  }, []);

  const skipRest = useCallback(() => {
    setIsActive(false);
    setRemaining(0);
    onCompleteRef.current();
  }, []);

  return { remaining, isActive, startRest, skipRest };
}
