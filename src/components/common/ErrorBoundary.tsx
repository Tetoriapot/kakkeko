import { Component } from 'react';
import type { ReactNode } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { downloadText } from '../../utils/download';
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="page narrow">
        <h1>画面を表示できませんでした</h1>
        <p>編集中のデータをJSONで退避してから、再読み込みしてください。</p>
        <pre className="error-box" role="alert">
          {this.state.error.message}
        </pre>
        <div className="actions">
          <button
            onClick={() => {
              const doc = useProjectStore.getState().document;
              if (doc)
                downloadText(
                  JSON.stringify(doc, null, 2),
                  'kakkeko-recovery.json',
                );
            }}
            disabled={!useProjectStore.getState().document}
          >
            編集中のJSONを保存
          </button>
          <button className="primary" onClick={() => window.location.reload()}>
            再読み込み
          </button>
        </div>
      </main>
    );
  }
}
