import { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { BackupStatus } from '../../components/common/BackupStatus';
import { downloadProjectBackup } from '../export/backup';
import { errorMessage } from '../../utils/safety';

export function ProjectBackup() {
  const project = useProjectStore((s) => s.document?.project);
  const [error, setError] = useState('');
  if (!project) return null;
  return (
    <div className="project-backup">
      <BackupStatus project={project} />
      <button
        onClick={() => {
          try {
            const doc = useProjectStore.getState().document;
            if (doc) downloadProjectBackup(doc);
            setError('');
          } catch (err) {
            setError(errorMessage(err));
          }
        }}
      >
        JSONバックアップ
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
