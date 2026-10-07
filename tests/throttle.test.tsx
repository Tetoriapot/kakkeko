import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useThrottled } from '../src/utils/useThrottled';
it('updates to the latest value after StrictMode remount and continuous typing', () => {
  vi.useFakeTimers();
  try {
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useThrottled(value),
      { initialProps: { value: 'a' }, wrapper: StrictMode },
    );
    rerender({ value: 'ab' });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: 'abc' });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('abc');
    rerender({ value: 'abcd' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('abcd');
    unmount();
  } finally {
    vi.useRealTimers();
  }
});
