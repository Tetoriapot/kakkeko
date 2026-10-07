import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { useProjectStore } from '../src/stores/projectStore';
afterEach(() => {
  cleanup();
  useProjectStore.getState().clear();
});
