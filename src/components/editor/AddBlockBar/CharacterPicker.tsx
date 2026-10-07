import { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../../../stores/projectStore';
import { episodeStore } from '../../../stores/episodeStore';
export function CharacterPicker({ episodeId }: { episodeId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const characters = useProjectStore((s) => s.document?.characters);
  const available =
    characters
      ?.filter((c) => !c.isArchived)
      .sort((a, b) => a.order - b.order) ?? [];
  const select = (id: string) => {
    setOpen(false);
    episodeStore.addBlock(episodeId, 'dialogue', id);
  };
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    ref.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus();
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return (
    <div
      className="character-picker"
      ref={ref}
      onKeyDown={(e) => {
        if (!open) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          setOpen(false);
          button.current?.focus();
        } else if (/^[1-9]$/.test(e.key) && !e.altKey) {
          e.preventDefault();
          const c = available[Number(e.key) - 1];
          if (c) select(c.id);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const items = Array.from(
            ref.current?.querySelectorAll<HTMLButtonElement>(
              '[role=menuitem]',
            ) ?? [],
          );
          const index = items.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          items[
            (index + (e.key === 'ArrowDown' ? 1 : -1) + items.length) %
              items.length
          ]?.focus();
        }
      }}
    >
      <button
        ref={button}
        aria-label="キャラを選んでセリフを追加"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        ⌄
      </button>
      {open && (
        <div
          role="menu"
          aria-label="話し手を選択"
          className="character-popover"
        >
          {available.map((c, i) => (
            <button role="menuitem" key={c.id} onClick={() => select(c.id)}>
              <span>{c.name}</span>
              <kbd>{i < 9 ? i + 1 : ''}</kbd>
            </button>
          ))}
          <button role="menuitem" onClick={() => select('')}>
            匿名の話し手
          </button>
        </div>
      )}
    </div>
  );
}
