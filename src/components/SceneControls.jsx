import { Plus, Minus, RotateCcw, Tag } from 'lucide-react';
import { useCampusStore } from '../store/useCampusStore.js';

export default function SceneControls({ className = '' }) {
  const zoom = useCampusStore((s) => s.zoom);
  const resetCamera = useCampusStore((s) => s.resetCamera);
  const toggleLabels = useCampusStore((s) => s.toggleLabels);
  const showLabels = useCampusStore((s) => s.showLabels);

  return (
    <div className={`panel-floating flex flex-col p-1 ${className}`}>
      <button className="icon-btn" onClick={() => zoom(0.72)} title="Zoom in" aria-label="Zoom in">
        <Plus size={16} />
      </button>
      <button className="icon-btn" onClick={() => zoom(1.38)} title="Zoom out" aria-label="Zoom out">
        <Minus size={16} />
      </button>
      <div className="mx-1.5 my-1 h-px bg-ink-700" />
      <button className="icon-btn" onClick={resetCamera} title="Reset view" aria-label="Reset view">
        <RotateCcw size={15} />
      </button>
      <button
        className={`icon-btn ${showLabels ? 'text-accent hover:text-accent' : ''}`}
        onClick={toggleLabels}
        title={showLabels ? 'Hide labels' : 'Show labels'}
        aria-label="Toggle labels"
      >
        <Tag size={15} />
      </button>
    </div>
  );
}

export function SceneHint({ className = '' }) {
  return (
    <div className={`panel-floating hidden items-center gap-3 px-3 py-1.5 text-2xs text-fg-subtle lg:flex ${className}`}>
      <span>
        <span className="text-fg-muted">Drag</span> rotate
      </span>
      <span>
        <span className="text-fg-muted">Right-drag</span> pan
      </span>
      <span>
        <span className="text-fg-muted">Scroll</span> zoom
      </span>
      <span>
        <span className="text-fg-muted">Click</span> select
      </span>
    </div>
  );
}
