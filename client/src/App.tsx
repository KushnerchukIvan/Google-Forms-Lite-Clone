import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { BuilderPage } from './pages/BuilderPage';
import { FillPage } from './pages/FillPage';
import { ResponsesPage } from './pages/ResponsesPage';

export function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="topbar">
          <a href="/" className="brand">
            <span className="brand-mark">F</span> Forms Lite
          </a>
          <span className="topbar-note">Simple form builder</span>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/forms/new" element={<BuilderPage />} />
          <Route path="/forms/:id/fill" element={<FillPage />} />
          <Route path="/forms/:id/responses" element={<ResponsesPage />} />
          <Route
            path="*"
            element={<main className="page state">Page not found.</main>}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
