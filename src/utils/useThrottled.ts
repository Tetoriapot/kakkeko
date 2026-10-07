import { useEffect, useRef, useState } from 'react';
export function useThrottled<T>(value: T, interval = 200): T {
  const latest = useRef(value);
  latest.current = value;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [displayed, setDisplayed] = useState(value);
  useEffect(() => {
    if (timer.current === null)
      timer.current = setTimeout(() => {
        timer.current = null;
        setDisplayed(latest.current);
      }, interval);
  }, [value, interval]);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = null;
    },
    [],
  );
  return displayed;
}
