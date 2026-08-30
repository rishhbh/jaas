'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { RoastResultData } from './RoastForm';
import { Zap, Flame, Copy, Check, ExternalLink, GitBranch, Terminal } from 'lucide-react';

interface RoastOutputProps {
  data: RoastResultData | null;
}

export const RoastOutput: React.FC<RoastOutputProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleCopy = () => {
    if (data?.roast) {
      navigator.clipboard.writeText(data.roast);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="brutal-card-lg mt-8 p-0 bg-[var(--bg-soft)]">
      {/* Header Bar */}
      <div
        className={`p-4 border-b-4 border-[var(--ink)] flex flex-wrap items-center justify-between gap-3 ${
          data.cached
            ? 'bg-[#2196F3] text-white'
            : 'bg-[#FF5252] text-white'
        }`}
      >
        <div className="flex items-center gap-3 font-mono font-black text-sm uppercase tracking-wider">
          {data.cached ? (
            <Zap className="w-5 h-5 fill-yellow-300 text-yellow-300" />
          ) : (
            <Flame className="w-5 h-5 fill-yellow-300 text-yellow-300" />
          )}
          <span>
            {data.cached
              ? '[CACHED] ROAST VERDICT (UPSTASH REDIS 24H)'
              : '[LIVE] GROQ GPT-OSS-120B VERDICT OUTPUT'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="brutal-btn brutal-btn-yellow text-xs py-1.5 px-3"
        >
          {copied ? (
            <span className="flex items-center gap-1.5 text-black">
              <Check className="w-4 h-4 stroke-[3]" /> COPIED!
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-black">
              <Copy className="w-4 h-4 stroke-[3]" /> COPY VERDICT
            </span>
          )}
        </button>
      </div>

      <div className="p-6">
        {/* Repo Metadata Banner if applicable */}
        {data.source === 'github' && data.owner && data.repo && (
          <div className="mb-6 p-3 bg-[var(--bg-softer)] border-2 border-[var(--ink)] shadow-[3px_3px_0px_var(--shadow-color)] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 font-bold uppercase">
              <GitBranch className="w-4 h-4 text-[var(--brutal-yellow)]" />
              <span>
                TARGET REPO: <span className="text-[var(--brutal-yellow)]">{data.owner}/{data.repo}</span>
              </span>
            </div>

            {data.metadata?.html_url && (
              <a
                href={data.metadata.html_url}
                target="_blank"
                rel="noreferrer"
                className="brutal-badge brutal-badge-yellow hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                <span>OPEN ON GITHUB</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Terminal Output Screen */}
        <div className="bg-[#000000] border-4 border-[var(--ink)] p-6 shadow-[6px_6px_0px_#FFEB3B] overflow-x-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-zinc-800 font-mono text-xs text-emerald-400 font-bold tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>ROAST_VERDICT_OUTPUT.LOG</span>
            </div>
            <span className="text-zinc-500">FORMAT: MARKDOWN / UTF-8</span>
          </div>

          <div className="prose prose-invert prose-green max-w-none font-mono text-sm leading-relaxed text-zinc-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {data.roast}
            </ReactMarkdown>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCopy}
            className="brutal-btn brutal-btn-yellow text-sm py-2 px-6"
          >
            {copied ? (
              <span className="flex items-center gap-2 text-black font-black">
                <Check className="w-5 h-5 stroke-[3]" /> VERDICT COPIED TO CLIPBOARD
              </span>
            ) : (
              <span className="flex items-center gap-2 text-black font-black">
                <Copy className="w-5 h-5 stroke-[3]" /> COPY FULL MARKDOWN
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
