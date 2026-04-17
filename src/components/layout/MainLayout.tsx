import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from 'antd';
import { ThemeToggle } from '../common/ThemeToggle';

const pageMeta: Record<string, string> = {
  '/': '模板选择',
  '/luoxiaohei': '罗小黑人物双色海报',
};

export function MainLayout() {
  const location = useLocation();
  const title = pageMeta[location.pathname] ?? '模板工作台';

  return (
    <div className="app-shell">
      <header className="top-nav">
        <Link className="brand" to="/">
          PhotoForge
        </Link>
        <div className="search-pill" role="status" aria-live="polite">
          <span>模板浏览</span>
          <span className="search-pill-sep" />
          <span>{title}</span>
        </div>
        <div className="top-nav-right">
          <span className="host-link">Become a Creator</span>
          <ThemeToggle />
          <Link to="/">
            <Button type="default">全部模板</Button>
          </Link>
        </div>
      </header>
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}
