'use client';

import React from 'react';
import { Terminal, Crosshair, Flame } from 'lucide-react';

export const VerdictPlaceholder: React.FC = () => {
  const focusInput = () => {
    const el = document.getElementById('repoUrl');
    if (el) (el as HTMLInputElement).focus();
  };

  return (
    <div className="brutal-card-lg mt-8 p-0 bg-[var(--bg-softer)]">
      {/* Header Bar */}
      <div className="p-3.5 sm:p-4 border-b-4 border-[var(--ink)] bg-[#000000] text-yellow-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 font-mono font-black text-xs sm:text-sm uppercase tracking-wider">
          <Crosshair className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
          <span>STANDBY // NO VERDICT GENERATED</span>
        </div>
        <span className="text-[10px] sm:text-xs text-zinc-500 hidden sm:inline">TARGET: UNIDENTIFIED</span>
      </div>

      {/* Terminal Idle Screen */}
      <div className="bg-[#0a0a0c] border-4 border-[var(--ink)] m-4 sm:m-6 p-4 sm:p-6 shadow-[4px_4px_0px_#FFEB3B] sm:shadow-[6px_6px_0px_#FFEB3B] overflow-x-auto">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-zinc-800 font-mono text-[10px] sm:text-xs text-emerald-400 font-bold tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ROAST_VERDICT_OUTPUT.LOG</span>
          </div>
          <span className="text-zinc-500 hidden sm:inline">FORMAT: MARKDOWN / UTF-8</span>
        </div>

        <div className="font-mono text-xs sm:text-sm text-zinc-400 leading-relaxed">
          <p className="text-emerald-400">
            $ jaas --judge --target missing <span className="text-zinc-600">&gt;_</span>
          </p>
          <p className="text-zinc-600 mt-2">// no target detected.</p>
          <p className="text-zinc-600">// awaiting repository url or raw readme markdown.</p>
          <p className="text-zinc-400 mt-3">
            no verdict yet. feed the beast a repo and its{' '}
            <span className="text-yellow-300 font-black">[BRUTAL ROAST]</span> will materialize here.
            <span className="inline-block w-2 h-4 bg-yellow-300 animate-pulse align-middle ml-1.5" />
          </p>
        </div>
      </div>

      {/* Footer Hint */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="font-mono text-[10px] text-[var(--ink-faint)]">
          TIP: PASTE A GITHUB URL ABOVE OR THROW IN RAW README MARKDOWN.
        </p>
        <button
          onClick={focusInput}
          className="brutal-btn brutal-btn-yellow text-[10px] sm:text-xs py-2 px-4 text-black shrink-0"
        >
          <Flame className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
          START A ROAST
        </button>
      </div>
    </div>
  );
};