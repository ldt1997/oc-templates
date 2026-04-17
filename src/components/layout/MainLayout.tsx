import { Link, Outlet } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';
import './MainLayout.css';

export function MainLayout() {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <Link className="brand" to="/">
          OCTemplate
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
