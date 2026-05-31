import React from 'react';

const Loading = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-lg px-4">
        <div className="mb-6 h-1 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-sky-400 via-cyan-400 to-slate-600" />
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.75)] backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-800 p-3 text-sky-400">
              <svg viewBox="0 0 24 24" className="h-full w-full animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07 6.93l-2.83-2.83M8.76 8.76L5.93 5.93m12.02 0l-2.83 2.83M8.76 15.24l-2.83 2.83" />
              </svg>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300/90">Nexus loading</p>
              <h1 className="text-2xl font-semibold text-white">Preparing the next hub...</h1>
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-3 rounded-full bg-slate-800">
              <div className="h-full w-2/3 animate-pulse bg-sky-400/80 rounded-full" />
            </div>
            <div className="h-3 rounded-full bg-slate-800">
              <div className="h-full w-1/2 animate-pulse bg-cyan-400/80 rounded-full" />
            </div>
            <div className="h-3 rounded-full bg-slate-800">
              <div className="h-full w-1/4 animate-pulse bg-slate-500/80 rounded-full" />
            </div>
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-400">
            If navigation takes longer than expected, the system is still working in the background. This loader prevents the page from appearing frozen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
