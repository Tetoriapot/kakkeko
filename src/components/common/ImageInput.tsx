import { useState } from 'react';
import { IMAGE_WARNING_BYTES, readImage } from '../../utils/images';
import { errorMessage } from '../../utils/safety';
export function ImageInput({
  label,
  onChange,
}: {
  label: string;
  onChange: (data: string) => void;
}) {
  const [message, setMessage] = useState('');
  return (
    <div>
      <label>
        {label}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              setMessage(
                file.size > IMAGE_WARNING_BYTES
                  ? '2 MBを超える画像です。保存容量や表示速度に注意してください。'
                  : '',
              );
              onChange(await readImage(file));
            } catch (err) {
              setMessage(errorMessage(err));
            }
            e.target.value = '';
          }}
        />
      </label>
      {message && (
        <p role="status" className="image-warning">
          {message}
        </p>
      )}
    </div>
  );
}
