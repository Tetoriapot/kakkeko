import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { EpisodeRenderer } from '../src/renderer/EpisodeRenderer';
import { sampleDocument } from '../src/domain/fixtures';
import { createBlock } from '../src/domain/factories';
import {
  publicBlocks,
  contrastRatio,
  readableColor,
} from '../src/renderer/transform';
it('renders character references and excludes hidden blocks and private memos', () => {
  const doc = structuredClone(sampleDocument);
  doc.characters[0].name = '更新した名前';
  doc.episodes[0].blocks.push(
    createBlock('memo', { text: '秘密' }),
    createBlock('narration', { text: '非表示', hidden: true }),
  );
  render(<EpisodeRenderer document={doc} episode={doc.episodes[0]} />);
  expect(screen.getByText('更新した名前')).toBeInTheDocument();
  expect(screen.queryByText('秘密')).toBeNull();
  expect(screen.queryByText('非表示')).toBeNull();
  expect(publicBlocks(doc.episodes[0])).toHaveLength(3);
});
it('renders injected markup as text and corrects low contrast colors', () => {
  const doc = structuredClone(sampleDocument);
  doc.episodes[0].blocks = [
    createBlock('dialogue', {
      text: '<script>alert(1)</script>',
      characterId: 'char_boon',
    }),
  ];
  const { container } = render(
    <EpisodeRenderer document={doc} episode={doc.episodes[0]} />,
  );
  expect(container.querySelector('script')).toBeNull();
  expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument();
  expect(
    contrastRatio(readableColor('#eeeeee'), '#ffffff'),
  ).toBeGreaterThanOrEqual(4.5);
});
