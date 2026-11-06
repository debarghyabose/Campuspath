import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import TopNav from './components/TopNav.jsx';
import Landing from './pages/Landing.jsx';
import Explore from './pages/Explore.jsx';
import Navigate from './pages/Navigate.jsx';
import AlgorithmLab from './pages/AlgorithmLab.jsx';
import About from './pages/About.jsx';

export default function App() {
  const location = useLocation();
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <TopNav />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="flex flex-1 flex-col"
        >
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/navigate" element={<Navigate />} />
            <Route path="/lab" element={<AlgorithmLab />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <footer className="border-t border-ink-700 bg-ink-950/80 px-4 py-5 text-center text-xs text-fg-muted sm:px-6">
        <p className="font-medium text-fg">DSA Project · ECE Department</p>
        <p className="mt-1.5 leading-relaxed">
          Built by Debarghya Bose (Roll 291) · Avasyu Roy (Roll 294) · Ashika Ghosh (Roll 303) · Debanik Dey (Roll 291) ·
          Rhitom Dey (Roll 323)
        </p>
      </footer>
    </div>
  );
}
