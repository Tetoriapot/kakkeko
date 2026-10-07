import { useEffect, useState, useId } from 'react';
import { safeImageUrl, safeLink } from '../../utils/safety';
export function UrlInput({
  label,
  value,
  onChange,
  image = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  image?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');
  const errorId = useId();
  useEffect(() => {
    setDraft(value);
    setError('');
  }, [value]);
  return (
    <label>
      {label}
      <input
        aria-label={label}
        aria-describedby={error ? errorId : undefined}
        value={draft.startsWith('data:') ? '' : draft}
        placeholder={
          value.startsWith('data:') ? '画像を埋め込み済み' : 'https://…'
        }
        aria-invalid={!!error}
        onChange={(e) => {
          const next = e.target.value;
          setDraft(next);
          const valid = !next || (image ? safeImageUrl(next) : safeLink(next));
          setError(valid ? '' : 'http/httpsの有効なURLを入力してください。');
          if (valid) onChange(next);
        }}
      />
      {error && (
        <span id={errorId} role="status" className="field-error">
          {error} 元の値は保持しています。
        </span>
      )}
    </label>
  );
}
