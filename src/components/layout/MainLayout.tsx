import { Link, Outlet } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';

export function MainLayout() {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <Link className="brand" to="/">
          PhotoForge
        </Link>
        <div className="top-nav-right">
          <ThemeToggle />
        </div>
      </header>
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}
