import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface TopBarProps {
  title: string;
  rightAction?: ReactNode;
  showBack?: boolean;
}

export function TopBar({ title, rightAction, showBack = false }: TopBarProps) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center px-4 h-14 bg-background/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-30">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="mr-2 p-2 -ml-2 rounded-full text-textMuted hover:text-textPrimary transition-colors"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <h1 className="text-lg font-display font-semibold tracking-wide text-textPrimary flex-1">{title}</h1>
      {rightAction && <div>{rightAction}</div>}
    </header>
  );
}
