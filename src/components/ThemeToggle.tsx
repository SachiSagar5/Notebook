import { useEffect, useState } from 'react';

const KEY = 'draftbook.theme';

type Theme = 'light' | 'dark';

function getStored(): Theme {
  const raw = localStorage.getItem(KEY);
  if (raw === 'dark' || raw === 'light') return raw;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark');
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getStored);

  useEffect(() => { apply(theme); }, []);

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem(KEY, next);
    apply(next);
  }

  return (
    <button
      onClick={toggle}
      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
    </button>
  );
}
