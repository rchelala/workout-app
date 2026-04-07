import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, TrendingUp, Utensils, User } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',         icon: Home,       label: 'Home'     },
  { to: '/plans',    icon: Dumbbell,   label: 'Plans'    },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/macros',   icon: Utensils,   label: 'Macros'   },
  { to: '/profile',  icon: User,       label: 'Profile'  },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border">
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                isActive ? 'text-accent' : 'text-textMuted'
              }`
            }
          >
            <Icon size={22} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
