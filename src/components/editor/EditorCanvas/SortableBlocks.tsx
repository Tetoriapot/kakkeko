import {
  DndContext,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useProjectStore } from '../../../stores/projectStore';
import { selectBlock } from '../../../stores/selectors';
import { episodeStore } from '../../../stores/episodeStore';
import { BlockShell } from '../blocks/BlockShell';
import { BlockEditor } from '../blocks/BlockEditor';
const SortableBlock = memo(function SortableBlock({
  id,
  episodeId,
  index,
  total,
}: {
  id: string;
  episodeId: string;
  index: number;
  total: number;
}) {
  const block = useProjectStore((s) => selectBlock(s.document, episodeId, id));
  return block ? (
    <BlockShell block={block} episodeId={episodeId} index={index} total={total}>
      <BlockEditor block={block} episodeId={episodeId} />
    </BlockShell>
  ) : null;
});
export const SortableBlocks = memo(function SortableBlocks({
  episodeId,
}: {
  episodeId: string;
}) {
  const ids = useProjectStore(
    useShallow(
      (s) =>
        s.document?.episodes
          .find((e) => e.id === episodeId)
          ?.blocks.map((b) => b.id) ?? [],
    ),
  );
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const position = (id: string | number) => ids.indexOf(String(id)) + 1;
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      autoScroll
      accessibility={{
        screenReaderInstructions: {
          draggable:
            'スペースキーでブロックをつかみ、上下矢印で移動、スペースキーで確定、Escapeで取り消します。',
        },
        announcements: {
          onDragStart: ({ active }) =>
            `${position(active.id)}番目のブロックを移動します。`,
          onDragOver: ({ over }) =>
            over ? `${position(over.id)}番目へ移動します。` : undefined,
          onDragEnd: ({ over }) =>
            over
              ? `${position(over.id)}番目に移動しました。`
              : '移動を取り消しました。',
          onDragCancel: () => '移動を取り消しました。',
        },
      }}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over.id)
          episodeStore.moveBlock(
            episodeId,
            position(active.id) - 1,
            position(over.id) - 1,
          );
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {ids.map((id, i) => (
          <SortableBlock
            key={id}
            id={id}
            episodeId={episodeId}
            index={i}
            total={ids.length}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
});
