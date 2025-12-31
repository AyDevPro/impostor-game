import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { Welcome } from './pages/Welcome';
import { Lobby } from './pages/Lobby';
import { RoleReveal } from './pages/RoleReveal';
import { Game } from './pages/Game';

export default function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          {/* Page d'accueil */}
          <Route path="/" element={<Welcome />} />
          <Route path="/lobby/:code" element={<Lobby />} />
          <Route path="/game/:code/role" element={<RoleReveal />} />
          <Route path="/game/:code" element={<Game />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}
