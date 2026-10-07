import { useEffect, useState } from 'react';
import type { Project } from '../../domain/types';
import { backupDue, useBackupStore } from '../../stores/backupStore';

export function BackupStatus({ project }: { project: Project }) {
  const record = useBackupStore((s) => s.projects[project.id]);
  const days = useBackupStore((s) => s.reminderDays);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!days) return;
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, [days]);
  return (
    <div className="backup-status">
      <p>
        {record ? (
          <>
            最終JSON出力:{' '}
            <time dateTime={record.exportedAt}>
              {new Date(record.exportedAt).toLocaleString('ja-JP')}
            </time>
            {record.updatedAt !== project.updatedAt && (
              <strong> · 出力後に変更あり</strong>
            )}
          </>
        ) : (
          'JSONバックアップ: 未出力'
        )}
      </p>
      {backupDue(project, record, days, now) && (
        <p className="backup-reminder">
          バックアップの時期です。最新のJSONを書き出しましょう。
        </p>
      )}
    </div>
  );
}
