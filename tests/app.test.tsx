import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from '../src/app/App';
test('アプリが起動する', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: '作品一覧' })).toBeInTheDocument();
  expect(
    await screen.findByRole('heading', { name: '最初の会話作品をつくる' }),
  ).toBeInTheDocument();
});
