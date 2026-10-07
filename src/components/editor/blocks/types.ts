import type { Block } from '../../../domain/types';
export type BlockEditorProps<T extends Block> = {
  block: T;
  onChange: (patch: Partial<T>) => void;
};
