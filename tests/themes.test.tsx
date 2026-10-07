import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { themes } from '../src/features/themes/themes';
import { EpisodeRenderer } from '../src/renderer/EpisodeRenderer';
import { sampleDocument } from '../src/domain/fixtures';
it('supports five themes without mutating content', () => {
  const before = JSON.stringify(sampleDocument);
  for (const t of themes) {
    const doc = {
      ...sampleDocument,
      project: { ...sampleDocument.project, themeId: t.id },
    };
    const { container, unmount } = render(
      <EpisodeRenderer document={doc} episode={doc.episodes[0]} />,
    );
    expect(container.querySelector(`.theme-${t.id}`)).toBeTruthy();
    expect(container.textContent).toContain('これは大変なことになったお');
    if (t.id === 'aa-classic')
      expect(container.textContent).toContain('（　＾ω＾）');
    unmount();
  }
  expect(JSON.stringify(sampleDocument)).toBe(before);
});
