import { useProjectStore } from '../../stores/projectStore';
import { settingsStore } from '../../stores/settingsStore';
import { ThemeSelect } from '../../features/themes/ThemeSelect';
export function ProjectSettings() {
  const doc = useProjectStore((s) => s.document);
  if (!doc) return null;
  const { project, settings } = doc;
  return (
    <section className="project-settings form-stack">
      <h2>作品設定</h2>
      <ThemeSelect />
      <label>
        作品タイトル
        <input
          value={project.title}
          onChange={(e) =>
            useProjectStore.getState().updateProject({ title: e.target.value })
          }
        />
      </label>
      <label>
        作品の説明
        <textarea
          value={project.description}
          onChange={(e) =>
            useProjectStore
              .getState()
              .updateProject({ description: e.target.value })
          }
        />
      </label>
      <label>
        フォントサイズ
        <select
          value={settings.editor.fontSize}
          onChange={(e) =>
            settingsStore.updateEditor({
              fontSize: e.target.value as typeof settings.editor.fontSize,
            })
          }
        >
          <option value="small">小</option>
          <option value="medium">中</option>
          <option value="large">大</option>
        </select>
      </label>
      <label>
        吹き出し幅
        <select
          value={settings.rendering.bubbleWidth}
          onChange={(e) =>
            settingsStore.updateRendering({
              bubbleWidth: e.target
                .value as typeof settings.rendering.bubbleWidth,
            })
          }
        >
          <option value="compact">コンパクト</option>
          <option value="normal">標準</option>
          <option value="wide">ワイド</option>
        </select>
      </label>
      <label>
        アイコン形状
        <select
          value={settings.rendering.iconShape}
          onChange={(e) =>
            settingsStore.updateRendering({
              iconShape: e.target.value as typeof settings.rendering.iconShape,
            })
          }
        >
          <option value="circle">丸</option>
          <option value="rounded">角丸</option>
          <option value="square">四角</option>
        </select>
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={settings.rendering.showCharacterNames}
          onChange={(e) =>
            settingsStore.updateRendering({
              showCharacterNames: e.target.checked,
            })
          }
        />
        キャラクター名を表示
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={settings.rendering.showPlayerNames}
          onChange={(e) =>
            settingsStore.updateRendering({ showPlayerNames: e.target.checked })
          }
        />
        PL名を表示
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={settings.rendering.showTimestamps ?? false}
          onChange={(e) =>
            settingsStore.updateRendering({ showTimestamps: e.target.checked })
          }
        />
        タイムスタンプを表示
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={settings.editor.autoSave}
          onChange={(e) =>
            settingsStore.updateEditor({ autoSave: e.target.checked })
          }
        />
        自動保存
      </label>
      <label>
        保存頻度
        <select
          value={settings.editor.autoSaveIntervalMs}
          onChange={(e) =>
            settingsStore.updateEditor({
              autoSaveIntervalMs: Number(e.target.value),
            })
          }
        >
          {![600, 1200, 3000].includes(settings.editor.autoSaveIntervalMs) && (
            <option value={settings.editor.autoSaveIntervalMs}>
              {settings.editor.autoSaveIntervalMs / 1000}秒
            </option>
          )}
          <option value={600}>0.6秒</option>
          <option value={1200}>1.2秒</option>
          <option value={3000}>3秒</option>
        </select>
      </label>
    </section>
  );
}
