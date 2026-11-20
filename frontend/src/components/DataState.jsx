import React from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';

export function SyncErrorBanner() {
  const { loadError, loading, refresh } = useData();
  if (!loadError) return null;
  return (
    <div
      role="alert"
      className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-rose-900"
    >
      <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
        <CloudOff className="w-5 h-5 text-rose-600" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">Could not load data from the server</p>
        <p className="text-xs text-rose-700 mt-0.5">{loadError}</p>
      </div>
      <button
        onClick={refresh}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 transition disabled:opacity-60"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        Try again
      </button>
    </div>
  );
}

export function LoadingRows({ rows = 5, columns = 5 }) {
  return (
    <div className="p-4 space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
          {Array.from({ length: columns - 1 }).map((__, c) => (
            <div
              key={c}
              className="h-3 rounded-full bg-slate-100 animate-pulse"
              style={{ width: `${c === 0 ? 28 : 12}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
