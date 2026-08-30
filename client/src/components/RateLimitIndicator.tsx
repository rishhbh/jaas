'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Clock, ShieldCheck, AlertCircle, Zap, UserPlus } from 'lucide-react';

export const RateLimitIndicator: React.FC = () => {
  const { rateLimit, user } = useAuth();

  const isGuest = user?.isGuest ?? rateLimit.isGuest ?? true;
  const limit = rateLimit.limit ?? (isGuest ? 1 : 67);
  const remaining = rateLimit.remaining ?? limit;
  const used = rateLimit.used ?? Math.max(0, limit - remaining);

  const formatResetTime = (resetAt: string | null) => {
    if (!resetAt) return 'AFTER FIRST GENERATION';
    try {
      const d = new Date(resetAt);
      return (
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' (' +
        d.toLocaleDateString() +
        ')'
      );
    } catch {
      return resetAt;
    }
  };

  const percentage = Math.min(100, Math.max(0, Math.round((remaining / limit) * 100)));

  return (
    <div className="brutal-card mb-6 p-0 bg-[var(--bg-soft)] overflow-hidden">
      {/* Status Header */}
      <div
        className={`p-3 border-b-3 border-[var(--ink)] flex flex-wrap items-center justify-between gap-2 font-mono text-xs font-black uppercase tracking-wider ${
          isGuest
            ? 'bg-[var(--brutal-yellow)] text-black'
            : 'bg-[var(--brutal-blue)] text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          {isGuest ? (
            <AlertCircle className="w-4 h-4 stroke-[3]" />
          ) : (
            <ShieldCheck className="w-4 h-4 stroke-[3]" />
          )}
          <span>
            {isGuest
              ? 'GUEST MODE // 1 SINGLE ROAST TRIAL'
              : 'AUTHENTICATED USER // 67 ROASTS / 24H WINDOW'}
          </span>
        </div>

        <div className="brutal-badge bg-black text-white border-black font-bold">
          <span>UPSTASH REDIS SLIDING WINDOW</span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Quota Counter */}
          <div className="flex items-center gap-3">
            <div className={`p-2.5 border-2 border-[var(--ink)] shadow-[2px_2px_0px_var(--shadow-color)] ${isGuest ? 'bg-[var(--brutal-red)] text-white' : 'bg-[var(--brutal-yellow)] text-black'}`}>
              <Flame className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-mono font-black text-lg tracking-tight uppercase">
                {remaining}/{limit} ROASTS REMAINING
              </div>
              <div className="font-mono text-xs text-[var(--ink-dim)]">
                {used} / {limit} USED IN THIS 24-HR CYCLE
              </div>
            </div>
          </div>

          {/* Hard Shadow Progress Bar */}
          <div className="flex-1 max-w-xs w-full">
            <div className="h-6 w-full bg-[var(--bg-softer)] border-2 border-[var(--ink)] shadow-[3px_3px_0px_var(--shadow-color)] p-0.5">
              <div
                className={`h-full transition-all duration-300 ${
                  remaining === 0
                    ? 'bg-[#FF5252]'
                    : isGuest
                    ? 'bg-[#FFEB3B]'
                    : 'bg-[#2196F3]'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Reset Time Readout */}
          <div className="flex items-center gap-2 font-mono text-xs bg-[var(--bg-softer)] border-2 border-[var(--ink)] p-2.5 shadow-[2px_2px_0px_var(--shadow-color)]">
            <Clock className="w-4 h-4 text-[var(--brutal-yellow)]" />
            <div>
              <span className="font-bold text-[var(--ink-dim)] uppercase">LIMIT RESET: </span>
              <span className="font-black text-[var(--ink)]">{formatResetTime(rateLimit.resetAt)}</span>
            </div>
          </div>
        </div>

        {/* Guest Upgrade Callout */}
        {isGuest && (
          <div className="mt-4 p-3 bg-[var(--brutal-yellow)] text-black border-2 border-black shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 stroke-[3]" />
              <span>GUEST LIMITED TO 1 TRIAL ROAST. SIGN IN WITH GOOGLE TO UNLOCK 67 ROASTS / DAY!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
