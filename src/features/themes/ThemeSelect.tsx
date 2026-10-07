import { useProjectStore } from '../../stores/projectStore';
import { themes } from './themes';
export function ThemeSelect() {
  const theme = useProjectStore((s) => s.document?.project.themeId);
  return (
    <label className="theme-select">
      テーマ
      <select
        value={theme}
        onChange={(e) =>
          useProjectStore.getState().updateProject({ themeId: e.target.value })
        }
      >
        {!themes.some((t) => t.id === theme) && (
          <option value={theme}>未対応テーマ（標準で表示）</option>
        )}
        {themes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  );
}
