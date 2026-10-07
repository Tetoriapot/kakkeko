import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { UrlInput } from '../src/components/common/UrlInput';
it('keeps invalid intermediate URLs out of saved data and accepts a completed safe URL', () => {
  const change = vi.fn();
  render(
    <UrlInput
      label="画像URL"
      value="https://example.com/image.png"
      image
      onChange={change}
    />,
  );
  fireEvent.change(screen.getByLabelText('画像URL'), {
    target: { value: 'java' },
  });
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole('status')).toHaveTextContent('元の値は保持');
  fireEvent.change(screen.getByLabelText('画像URL'), {
    target: { value: 'https://example.com/new.png' },
  });
  expect(change).toHaveBeenCalledWith('https://example.com/new.png');
  expect(screen.queryByRole('status')).toBeNull();
});
