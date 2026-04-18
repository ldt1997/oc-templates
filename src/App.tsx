import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SeoManager } from '@/components/common/SeoManager';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const LuoxiaoheiPage = lazy(() =>
  import('./pages/LuoxiaoheiPage').then((m) => ({ default: m.LuoxiaoheiPage })),
);

function App() {
  return (
    <>
      <SeoManager />
      <Routes>
        <Route
          element={
            <Suspense fallback={<main className="page-content">正在加载模板...</main>}>
              <MainLayout />
            </Suspense>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/luoxiaohei" element={<LuoxiaoheiPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
