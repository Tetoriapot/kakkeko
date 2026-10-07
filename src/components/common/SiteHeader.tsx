import { SkipLink } from './SkipLink';
import { HeaderUtilities } from './HeaderUtilities';
import { Link, NavLink } from 'react-router-dom';
export function SiteHeader() {
  return (
    <>
      <SkipLink />
      <header className="site-header">
        <Link to="/" className="brand" aria-label="KAKKEKO 作品一覧">
          <span className="brand-mark" aria-hidden="true">
            「<span>」</span>
          </span>
          <span className="brand-name">KAKKEKO</span>
          <span className="beta">LOCAL</span>
        </Link>
        <nav aria-label="メインナビゲーション">
          <NavLink to="/" end>
            作品一覧
          </NavLink>
          <NavLink to="/help">使い方</NavLink>
          <Link to="/?create=1">テンプレート</Link>
          <NavLink to="/import">インポート</NavLink>
          <NavLink to="/settings">設定</NavLink>
        </nav>
        <HeaderUtilities />
      </header>
    </>
  );
}
