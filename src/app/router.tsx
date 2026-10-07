import { Link, Route, Routes } from 'react-router-dom';
import { Home } from '../features/projects/Home';
import { Editor } from '../features/projects/Editor';
import { SettingsPage } from '../features/settings/SettingsPage';
import { ImportPage } from '../features/import/ImportPage';
import { SiteHeader } from '../components/common/SiteHeader';
import { HelpContent } from '../components/common/HelpContent';
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/editor/:projectId" element={<Editor />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/import" element={<ImportPage />} />
      <Route
        path="/help"
        element={
          <>
            <SiteHeader />
            <main id="main" className="page prose">
              <h1>使い方</h1>
              <HelpContent />
              <Link to="/">作品一覧へ</Link>
            </main>
          </>
        }
      />
      <Route
        path="*"
        element={
          <>
            <SiteHeader />
            <main id="main" className="page">
              <h1>ページが見つかりません</h1>
              <Link to="/">作品一覧へ</Link>
            </main>
          </>
        }
      />
    </Routes>
  );
}
