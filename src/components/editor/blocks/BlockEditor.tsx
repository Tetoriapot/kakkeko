import { memo } from 'react';
import type { Block } from '../../../domain/types';
import { episodeStore } from '../../../stores/episodeStore';
import { DialogueBlockEditor } from './DialogueBlockEditor';
import { NarrationBlockEditor } from './NarrationBlockEditor';
import { HeadingBlockEditor } from './HeadingBlockEditor';
import { ImageBlockEditor } from './ImageBlockEditor';
import { DividerBlockEditor } from './DividerBlockEditor';
import { MemoBlockEditor } from './MemoBlockEditor';
export const BlockEditor = memo(function BlockEditor({
  block,
  episodeId,
}: {
  block: Block;
  episodeId: string;
}) {
  const onChange = (patch: Partial<Block>) =>
    episodeStore.updateBlock(episodeId, block.id, patch);
  switch (block.type) {
    case 'dialogue':
      return <DialogueBlockEditor block={block} onChange={onChange} />;
    case 'narration':
      return <NarrationBlockEditor block={block} onChange={onChange} />;
    case 'heading':
      return <HeadingBlockEditor block={block} onChange={onChange} />;
    case 'image':
      return <ImageBlockEditor block={block} onChange={onChange} />;
    case 'divider':
      return <DividerBlockEditor block={block} onChange={onChange} />;
    case 'memo':
      return <MemoBlockEditor block={block} onChange={onChange} />;
  }
});
