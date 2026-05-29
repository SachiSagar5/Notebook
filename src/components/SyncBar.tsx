import type { DriveAccount, SyncStatus } from '../lib/drive';

interface Props {
  account: DriveAccount | null;
  status: SyncStatus;
  lastSync: number | null;
  onConnect: () => void;
  onSync: () => void;
  onPull: () => void;
  onDisconnect: () => void;
  compact?: boolean;
}

function timeAgo(ts: number | null) {
  if (!ts) return 'never';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(ts).toLocaleDateString();
}

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
  </svg>
);

export function SyncBar(props: Props) {
  const { account, status } = props;

  if (!account) {
    return (
      <button
        onClick={props.onConnect}
        disabled={status === 'syncing'}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
      >
        {status === 'syncing' ? <Spinner /> : <GoogleIcon />}
        <span className="hidden sm:inline">Connect Drive</span>
        <span className="sm:hidden">Drive</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
      <StatusDot status={status} />
      <div className="hidden flex-col leading-tight sm:flex">
        <span className="text-[11px] font-semibold text-slate-700">Google Drive</span>
        <span className="text-[10px] text-slate-400">
          {status === 'syncing' ? 'Syncing…' : `Synced ${timeAgo(props.lastSync)}`}
        </span>
      </div>
      <button
        onClick={props.onSync}
        disabled={status === 'syncing'}
        title="Sync now"
        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
      >
        {status === 'syncing' ? (
          <Spinner />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 2v6h-6M3 22v-6h6" />
            <path d="M3.5 9a9 9 0 0 1 14.85-3.36L21 8M21 15a9 9 0 0 1-14.85 3.36L3 16" />
          </svg>
        )}
      </button>
      <button
        onClick={props.onPull}
        disabled={status === 'syncing'}
        title="Pull from Drive"
        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
        </svg>
      </button>
      <button
        onClick={props.onDisconnect}
        title="Disconnect"
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function StatusDot({ status }: { status: SyncStatus }) {
  const color =
    status === 'synced' ? 'bg-emerald-500' :
    status === 'syncing' ? 'bg-amber-400' :
    status === 'error' ? 'bg-rose-500' : 'bg-slate-300';
  return <span className={`ml-1 h-2 w-2 rounded-full ${color} ${status === 'syncing' ? 'animate-pulse' : ''}`} />;
}

function Spinner() {
  return (
    <svg className="animate-spin text-indigo-500" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
