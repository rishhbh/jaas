'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RateLimitIndicator } from '../components/RateLimitIndicator';
import { RoastForm, RoastResultData } from '../components/RoastForm';
import { RoastOutput } from '../components/RoastOutput';
import {
  Flame,
  Zap,
  LogIn,
  User as UserIcon,
  Cpu,
  ShieldCheck,
  Lock,
  Moon,
  Sun,
  Terminal,
  Layers,
  ArrowRight,
  LogOut,
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated, loginAsGuest, loginWithCredential, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'workbench' | 'architecture'>('workbench');
  const [roastResult, setRoastResult] = useState<RoastResultData | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    /* Initialize Google Identity Services button */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win && win.google?.accounts?.id) {
      try {
        win.google.accounts.id.initialize({
          client_id:
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
            '28458431264-1fga81arnfrsr9t7msqo0ui5d8eeoe17.apps.googleusercontent.com',
          callback: (response: { credential?: string }) => {
            if (response.credential) {
              loginWithCredential(response.credential);
            }
          },
        });

        const btnElement = document.getElementById('googleSignInBtn');
        if (btnElement) {
          win.google.accounts.id.renderButton(btnElement, {
            theme: theme === 'dark' ? 'filled_black' : 'outline',
            size: 'large',
            type: 'standard',
          });
        }
      } catch (e) {
        console.warn('Google GSI init warning:', e);
      }
    }
  }, [loginWithCredential, theme]);

  const triggerGoogleSignIn = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win && win.google?.accounts?.id) {
      try {
        win.google.accounts.id.prompt();
      } catch (e) {
        console.warn('Google prompt exception:', e);
      }
    }
    const btn = document.getElementById('googleSignInBtn');
    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col font-mono selection:bg-[var(--brutal-yellow)] selection:text-black">
      {/* Main Structural Navbar / HUD Dock */}
      <header className="sticky top-0 bg-[var(--bg-soft)] border-b-3 border-[var(--ink)] z-40 shadow-[0px_3px_0px_var(--shadow-color)] max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Top Row / Left: Logo & Brand */}
          <div className="flex items-center gap-2">
            <div className="p-1 bg-[var(--brutal-red)] text-white border-2 border-[var(--ink)] shadow-[2px_2px_0px_var(--shadow-color)] shrink-0">
              <Flame className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-mono font-black text-sm sm:text-base tracking-tight uppercase text-[var(--ink)]">
                JaaS<span className="text-[var(--brutal-yellow)]">.ENGINE</span>
              </h1>
              <span className="brutal-badge brutal-badge-yellow text-[8px] sm:text-[9px] py-0.5 px-1 sm:px-1.5">v2.0 BRUTAL</span>
            </div>
          </div>

          {/* Nav Links & Controls */}
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('workbench')}
              className={`brutal-btn text-[10px] sm:text-[11px] py-1 px-2 sm:px-2.5 ${
                activeTab === 'workbench' ? 'brutal-btn-yellow' : 'brutal-btn-dark'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 mr-1 shrink-0" />
              <span>WORKBENCH</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`brutal-btn text-[10px] sm:text-[11px] py-1 px-2 sm:px-2.5 ${
                activeTab === 'architecture' ? 'brutal-btn-blue' : 'brutal-btn-dark'
              }`}
            >
              <Layers className="w-3.5 h-3.5 mr-1 shrink-0" />
              <span>SPECS</span>
            </button>

            {/* Single Unified Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Light/Dark Theme"
              className="brutal-btn brutal-btn-dark p-1 sm:p-1.5 text-[10px] sm:text-[11px]"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-[var(--brutal-yellow)] shrink-0" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[var(--brutal-blue)] shrink-0" />
              )}
            </button>

            {/* Quick Auth Status Indicator */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2 p-1 bg-[var(--bg-softer)] border-2 border-[var(--ink)] shadow-[2px_2px_0px_var(--shadow-color)] font-mono text-xs">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[var(--ink)] object-cover shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[var(--brutal-yellow)] text-black border-2 border-[var(--ink)] flex items-center justify-center font-black text-xs shrink-0">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="font-bold text-[10px] sm:text-xs truncate max-w-[75px] sm:max-w-[110px] leading-none px-0.5">{user?.name}</span>
                <button
                  onClick={logout}
                  className="h-5 sm:h-6 px-1.5 sm:px-2 bg-[var(--brutal-red)] text-white border-2 border-[var(--ink)] font-mono font-bold text-[9px] sm:text-[10px] uppercase flex items-center gap-1 hover:bg-[var(--ink)] transition-colors shadow-none cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>OUT</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  onClick={triggerGoogleSignIn}
                  className="brutal-btn brutal-btn-yellow text-[10px] sm:text-[11px] py-1 px-2 sm:px-2.5 text-black font-black"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1 shrink-0" />
                  <span className="hidden sm:inline">GOOGLE </span><span>SIGN IN</span>
                </button>

                <button
                  onClick={() => loginAsGuest('Developer Guest', 'guest@jaas.dev')}
                  className="brutal-btn brutal-btn-dark text-[10px] sm:text-[11px] py-1 px-2 sm:px-2.5 opacity-80 hover:opacity-100"
                >
                  <span>GUEST</span><span className="hidden sm:inline"> (1 TRIAL)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Top Neubrutalist Rate Limit Tracker */}
        <RateLimitIndicator />

        {/* 12-Column Bento Matrix Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento Hero Left Card (8 cols) */}
          <div className="md:col-span-8 brutal-card-lg p-6 sm:p-8 bg-[var(--bg-soft)] relative overflow-hidden flex flex-col justify-between">
            {/* Background Decorative Outline Typography */}
            <div className="absolute right-[-20px] bottom-[-20px] select-none pointer-events-none opacity-10 font-mono font-black text-9xl tracking-tighter uppercase text-outline">
              JAAS
            </div>

            <div>
              {/* Badge Cloud */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="brutal-badge brutal-badge-yellow">GROQ GPT-OSS-120B</span>
                <span className="brutal-badge brutal-badge-blue">BUN EXPRESS RUNTIME</span>
                <span className="brutal-badge brutal-badge-red">UPSTASH REDIS CACHE</span>
              </div>

              {/* Headline */}
              <h2 className="font-black text-3xl sm:text-5xl tracking-tight uppercase leading-none mb-4">
                BRUTAL AI <span className="text-[var(--brutal-yellow)]">REPOSITORY</span> & README JUDGE
              </h2>

              {/* Description */}
              <p className="font-mono text-sm sm:text-base leading-relaxed text-[var(--ink-dim)] max-w-2xl mb-6">
                Paste your GitHub repository URL or raw README Markdown to receive an unhinged, high-velocity technical critique generated by <strong className="text-[var(--ink)] font-bold">Groq GPT-OSS-120B</strong>. Cached instantly for 24 hours.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 border-t-3 border-[var(--ink)] pt-4 font-mono text-xs">
              <div className="p-2.5 bg-[var(--bg-softer)] border-2 border-[var(--ink)]">
                <div className="text-[var(--ink-dim)] uppercase text-[10px]">CACHE TTL</div>
                <div className="font-black text-sm text-[var(--brutal-yellow)]">24 HOURS</div>
              </div>
              <div className="p-2.5 bg-[var(--bg-softer)] border-2 border-[var(--ink)]">
                <div className="text-[var(--ink-dim)] uppercase text-[10px]">AUTH LIMIT</div>
                <div className="font-black text-sm text-[var(--brutal-blue)]">67 / DAY</div>
              </div>
              <div className="p-2.5 bg-[var(--bg-softer)] border-2 border-[var(--ink)]">
                <div className="text-[var(--ink-dim)] uppercase text-[10px]">GUEST TRIAL</div>
                <div className="font-black text-sm text-[var(--brutal-red)]">1 ROAST</div>
              </div>
            </div>
          </div>

          {/* Bento Right Authentication Card (4 cols) */}
          <div className="md:col-span-4 brutal-card p-6 bg-[var(--bg-soft)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-[var(--ink)] font-mono text-xs font-black uppercase">
                <UserIcon className="w-4 h-4 text-[var(--brutal-yellow)]" />
                <span>DEVELOPER AUTHENTICATION</span>
              </div>

              {isAuthenticated ? (
                <div className="flex flex-col gap-4 text-center py-2">
                  <div className="p-3 bg-[var(--bg-softer)] border-2 border-[var(--ink)] shadow-[3px_3px_0px_var(--shadow-color)] flex items-center gap-3 text-left">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="w-12 h-12 border-2 border-black object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[var(--brutal-yellow)] text-black border-2 border-black flex items-center justify-center font-mono font-black text-xl">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="truncate">
                      <div className="font-mono font-black text-sm truncate">{user?.name}</div>
                      <div className="font-mono text-xs text-[var(--ink-dim)] truncate">{user?.email}</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[var(--brutal-yellow)] text-black border-2 border-black font-mono text-xs font-bold">
                    67 ROASTS / 24H ACTIVE
                  </div>

                  <button
                    onClick={logout}
                    className="brutal-btn brutal-btn-red text-xs py-2 w-full"
                  >
                    LOG OUT SESSION
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 py-2">
                  <p className="font-mono text-xs text-[var(--ink-dim)] leading-normal">
                    Sign in with Google to unlock full <strong className="text-[var(--ink)]">67 roasts / 24 hr</strong> quota. Unauthenticated guests receive 1 trial roast.
                  </p>

                  {/* Google OAuth Button Container */}
                  <div id="googleSignInBtn" className="min-h-[42px] flex justify-center w-full" />

                  <div className="flex items-center gap-2 my-1">
                    <div className="flex-1 h-[2px] bg-[var(--ink-faint)]" />
                    <span className="font-mono text-[10px] text-[var(--ink-dim)] font-bold">OR QUICK ACCESS</span>
                    <div className="flex-1 h-[2px] bg-[var(--ink-faint)]" />
                  </div>

                  <button
                    onClick={() => loginAsGuest('Developer Guest', 'guest@jaas.dev')}
                    className="brutal-btn brutal-btn-dark text-xs py-2 w-full opacity-80 hover:opacity-100"
                  >
                    <span>CONTINUE AS GUEST (1 TRIAL ROAST)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t-2 border-dashed border-[var(--ink-faint)] font-mono text-[10px] text-[var(--ink-faint)] flex items-center justify-between">
              <span>SECURITY: HTTPONLY JWT</span>
              <Lock className="w-3 h-3 text-[var(--brutal-yellow)]" />
            </div>
          </div>
        </div>

        {/* Dynamic Section Switcher */}
        {activeTab === 'workbench' ? (
          <div className="mt-8 brutal-card-lg p-6 sm:p-8 bg-[var(--bg-soft)]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-3 border-[var(--ink)]">
              <div className="p-2 bg-[var(--brutal-yellow)] text-black border-2 border-black">
                <Terminal className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-mono font-black text-lg uppercase tracking-tight">
                  ROAST WORKBENCH
                </h3>
                <p className="font-mono text-xs text-[var(--ink-dim)]">
                  Submit repository link or raw README markdown
                </p>
              </div>
            </div>

            <RoastForm onRoastComplete={(res) => setRoastResult(res)} />
            <RoastOutput data={roastResult} />
          </div>
        ) : (
          /* System Architecture & Specs Section */
          <div className="mt-8 brutal-card-lg p-6 sm:p-8 bg-[var(--bg-soft)]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-3 border-[var(--ink)]">
              <div className="p-2 bg-[var(--brutal-blue)] text-white border-2 border-[var(--ink)]">
                <Layers className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-mono font-black text-lg uppercase tracking-tight">
                  SYSTEM SPECS
                </h3>
                <p className="font-mono text-xs text-[var(--ink-dim)]">
                  Technical specifications for runtime, AI engine, and caching
                </p>
              </div>
            </div>

            {/* 4-Card Bento Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Spec 1: Runtime */}
              <div className="brutal-card p-5 bg-[var(--bg-softer)]">
                <div className="p-2 bg-[var(--brutal-yellow)] text-black border-2 border-black inline-block mb-3">
                  <Cpu className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h4 className="font-mono font-black text-sm uppercase mb-2">RUNTIME & SERVER</h4>
                <ul className="font-mono text-xs space-y-1.5 text-[var(--ink-dim)]">
                  <li><strong className="text-[var(--ink)]">RUNTIME:</strong> Bun ES Modules</li>
                  <li><strong className="text-[var(--ink)]">SERVER:</strong> Express.js (v5)</li>
                  <li><strong className="text-[var(--ink)]">LOGGING:</strong> Morgan Dev</li>
                </ul>
              </div>

              {/* Spec 2: AI Engine */}
              <div className="brutal-card p-5 bg-[var(--bg-softer)]">
                <div className="p-2 bg-[var(--brutal-red)] text-white border-2 border-[var(--ink)] inline-block mb-3">
                  <Zap className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h4 className="font-mono font-black text-sm uppercase mb-2">AI ROAST ENGINE</h4>
                <ul className="font-mono text-xs space-y-1.5 text-[var(--ink-dim)]">
                  <li><strong className="text-[var(--ink)]">PROVIDER:</strong> Groq SDK</li>
                  <li><strong className="text-[var(--ink)]">MODEL:</strong> <code>gpt-oss-120b</code></li>
                  <li><strong className="text-[var(--ink)]">CONTRACT:</strong> Zod Validation</li>
                </ul>
              </div>

              {/* Spec 3: Upstash Redis */}
              <div className="brutal-card p-5 bg-[var(--bg-softer)]">
                <div className="p-2 bg-[var(--brutal-blue)] text-white border-2 border-[var(--ink)] inline-block mb-3">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h4 className="font-mono font-black text-sm uppercase mb-2">CACHE & LIMITS</h4>
                <ul className="font-mono text-xs space-y-1.5 text-[var(--ink-dim)]">
                  <li><strong className="text-[var(--ink)]">REDIS:</strong> Upstash REST</li>
                  <li><strong className="text-[var(--ink)]">CACHE TTL:</strong> 24h (SHA-256)</li>
                  <li><strong className="text-[var(--ink)]">AUTH QUOTA:</strong> 67 Roasts / 24h</li>
                </ul>
              </div>

              {/* Spec 4: Auth & Security */}
              <div className="brutal-card p-5 bg-[var(--bg-softer)]">
                <div className="p-2 bg-[var(--bg-soft)] text-[var(--ink)] border-2 border-[var(--ink)] inline-block mb-3">
                  <Lock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h4 className="font-mono font-black text-sm uppercase mb-2">SECURITY STACK</h4>
                <ul className="font-mono text-xs space-y-1.5 text-[var(--ink-dim)]">
                  <li><strong className="text-[var(--ink)]">AUTH:</strong> Google OAuth 2.0</li>
                  <li><strong className="text-[var(--ink)]">COOKIES:</strong> HttpOnly / Secure</li>
                  <li><strong className="text-[var(--ink)]">TOKENS:</strong> Access & Refresh</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveTab('workbench')}
                className="brutal-btn brutal-btn-yellow text-xs py-2.5 px-6 text-black"
              >
                <span>RETURN TO WORKBENCH</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Neubrutalist Footer */}
      <footer className="mt-12 bg-[var(--bg-soft)] border-t-4 border-[var(--ink)] py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-[var(--brutal-yellow)] text-black border border-black font-black">JaaS</span>
            <span className="text-[var(--ink-dim)]">© 2026 JUDGING-AS-A-SERVICE // RAW EDITORIAL BRUTALISM</span>
          </div>

          <div className="flex flex-wrap gap-4 text-[var(--ink-dim)]">
            <span className="hover:text-[var(--brutal-yellow)] cursor-pointer">BUN RUNTIME</span>
            <span>//</span>
            <span className="hover:text-[var(--brutal-yellow)] cursor-pointer">GROQ GPT-OSS-120B</span>
            <span>//</span>
            <span className="hover:text-[var(--brutal-yellow)] cursor-pointer">UPSTASH REDIS</span>
          </div>
        </div>
      </footer>

      {/* Bottom Scrolling Marquee Ticker */}
      <div className="bg-[var(--brutal-yellow)] text-black border-t-3 border-black py-1.5 overflow-hidden font-mono font-black text-xs uppercase tracking-widest z-50">
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-6">// JaaS // JUDGING-AS-A-SERVICE</span>
          <span className="mx-6">[GROQ GPT-OSS-120B] LLM ENGINE</span>
          <span className="mx-6 font-mono bg-black text-yellow-300 px-2 py-0.5">UNHINGED README ROASTER</span>
          <span className="mx-6">[UPSTASH REDIS] RATE LIMITING (67/24H & GUEST 1-TRIAL)</span>
          <span className="mx-6">[BUN ENGINE] EXPRESS JS RUNTIME</span>
          <span className="mx-6">// JaaS // JUDGING-AS-A-SERVICE</span>
          <span className="mx-6">[GROQ GPT-OSS-120B] LLM ENGINE</span>
          <span className="mx-6 font-mono bg-black text-yellow-300 px-2 py-0.5">UNHINGED README ROASTER</span>
          <span className="mx-6">[UPSTASH REDIS] RATE LIMITING (67/24H & GUEST 1-TRIAL)</span>
        </div>
      </div>
    </div>
  );
}
