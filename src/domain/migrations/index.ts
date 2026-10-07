import { validateDocument } from '../schema';
// v1.0.0 is the first published schema. Unknown versions must not be guessed.
export const migrateDocument = (input: unknown) => validateDocument(input);
