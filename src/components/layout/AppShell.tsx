import { type ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

interface AppShellProps {
  title: string;
  rightAction?: ReactNode;
  showBack?: boolean;
  children: ReactNode;
}

export function AppShell({ title, rightAction, showBack, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <TopBar title={title} rightAction={rightAction} showBack={showBack} />
      <main className="flex-1 overflow-y-auto pb-24 px-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
