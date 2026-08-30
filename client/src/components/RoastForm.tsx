'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Link as LinkIcon, FileText, Flame, AlertTriangle, Loader2, Cpu, Eye, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';

export interface RoastResultData {
  source: 'github' | 'direct_text';
  owner: string | null;
  repo: string | null;
  metadata?: {
    name?: string;
    path?: string;
    html_url?: string;
    download_url?: string;
    size?: number;
  } | null;
  readmeMarkdown: string;
  roast: string;
  cached?: boolean;
}

interface RoastFormProps {
  onRoastComplete: (result: RoastResultData) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const RoastForm: React.FC<RoastFormProps> = ({ onRoastComplete }) => {
  const { setRateLimit } = useAuth();
  const [activeTab, setActiveTab] = useState<'link' | 'paste'>('link');
  const [repoUrl, setRepoUrl] = useState('');
  const [readmeText, setReadmeText] = useState('');
  const [model, setModel] = useState('openai/gpt-oss-120b');

  /* Step Flow States: 'input' -> 'preview' -> 'roasting' */
  const [fetchedMetadata, setFetchedMetadata] = useState<{
    owner: string | null;
    repo: string | null;
    metadata?: any;
    markdown: string;
  } | null>(null);

  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [roasting, setRoasting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Fetch README Preview
  const handleFetchPreview = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (activeTab === 'link' && !repoUrl.trim()) {
      setErrorMsg('PLEASE ENTER A VALID GITHUB REPOSITORY URL OR "OWNER/REPO".');
      return;
    }

    if (activeTab === 'paste') {
      if (!readmeText.trim()) {
        setErrorMsg('PLEASE PASTE YOUR RAW README MARKDOWN TEXT.');
        return;
      }
      setFetchedMetadata({
        owner: null,
        repo: null,
        markdown: readmeText.trim(),
      });
      return;
    }

    setFetchingPreview(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/judge/fetch-readme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to fetch README from GitHub.');
        setFetchingPreview(false);
        return;
      }

      setFetchedMetadata({
        owner: data.data.owner,
        repo: data.data.repo,
        metadata: data.data.metadata,
        markdown: data.data.markdown,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Network error connecting to backend server.');
    } finally {
      setFetchingPreview(false);
    }
  };

  // Step 2: Submit for AI Roast
  const handleGenerateRoast = async () => {
    if (!fetchedMetadata || !fetchedMetadata.markdown) {
      setErrorMsg('No README content available to roast.');
      return;
    }

    setRoasting(true);
    setErrorMsg(null);

    try {
      const payload =
        activeTab === 'link'
          ? { repoUrl: repoUrl.trim(), model }
          : { readmeText: fetchedMetadata.markdown, model };

      const res = await fetch(`${API_BASE_URL}/api/judge/readme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.rateLimit) {
        setRateLimit(data.rateLimit);
      }

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to generate roast.');
        setRoasting(false);
        return;
      }

      onRoastComplete({
        ...data.data,
        cached: data.cached,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Network error generating roast verdict.');
    } finally {
      setRoasting(false);
    }
  };

  const handleReset = () => {
    setFetchedMetadata(null);
    setErrorMsg(null);
  };

  return (
    <div className="w-full">
      {/* Minimal Neubrutalist Tab Headers (No Line Behind Boxes) */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab('link');
            handleReset();
          }}
          className={`brutal-btn text-xs py-2.5 px-4 font-mono font-black ${
            activeTab === 'link'
              ? 'brutal-btn-yellow'
              : 'brutal-btn-dark opacity-75'
          }`}
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          <span>GITHUB REPO</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('paste');
            handleReset();
          }}
          className={`brutal-btn text-xs py-2.5 px-4 font-mono font-black ${
            activeTab === 'paste'
              ? 'brutal-btn-yellow'
              : 'brutal-btn-dark opacity-75'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          <span>RAW README</span>
        </button>
      </div>

      {/* Input Stage */}
      <div className="flex flex-col gap-6">
        {activeTab === 'link' ? (
          <form onSubmit={handleFetchPreview} className="flex flex-col gap-3">
            <label htmlFor="repoUrl" className="font-mono text-xs font-black uppercase tracking-wider text-[var(--ink)]">
              GITHUB REPOSITORY OR OWNER/REPO:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="repoUrl"
                type="text"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  if (fetchedMetadata) setFetchedMetadata(null);
                }}
                placeholder="e.g. rishhbh/jaas OR https://github.com/owner/repo"
                className="flex-1 bg-[var(--bg-softer)] text-[var(--ink)] placeholder-[var(--ink-faint)] font-mono font-bold text-sm sm:text-base p-4 min-h-[54px] border-3 border-[var(--ink)] shadow-[4px_4px_0px_var(--shadow-color)] focus:outline-none focus:bg-[var(--bg-soft)] focus:border-[var(--brutal-yellow)]"
                disabled={fetchingPreview || roasting}
              />
              <button
                type="submit"
                disabled={fetchingPreview || roasting || !repoUrl.trim()}
                className="brutal-btn brutal-btn-blue text-xs py-3 px-6 text-white shrink-0 min-h-[54px]"
              >
                {fetchingPreview ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>FETCHING...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>FETCH & PREVIEW</span>
                  </span>
                )}
              </button>
            </div>
            <span className="font-mono text-[11px] text-[var(--ink-dim)]">
              Enter <code className="text-[var(--brutal-yellow)] font-bold">owner/repo</code> or full URL.
            </span>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <label htmlFor="readmeText" className="font-mono text-xs font-black uppercase tracking-wider text-[var(--ink)]">
              PASTE RAW README MARKDOWN CONTENT:
            </label>
            <textarea
              id="readmeText"
              rows={8}
              value={readmeText}
              onChange={(e) => {
                setReadmeText(e.target.value);
                if (fetchedMetadata) setFetchedMetadata(null);
              }}
              placeholder="# My Project&#10;&#10;A groundbreaking app built with..."
              className="w-full bg-[var(--bg-softer)] text-[var(--ink)] placeholder-[var(--ink-faint)] font-mono font-bold text-xs sm:text-sm p-4 border-3 border-[var(--ink)] shadow-[4px_4px_0px_var(--shadow-color)] focus:outline-none focus:bg-[var(--bg-soft)] focus:border-[var(--brutal-yellow)] leading-relaxed resize-y"
              disabled={roasting}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleFetchPreview()}
                disabled={!readmeText.trim()}
                className="brutal-btn brutal-btn-blue text-xs py-2.5 px-6 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                <span>PREVIEW MARKDOWN</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Fetched Preview Box & Generate Button */}
        {fetchedMetadata && (
          <div className="mt-4 p-5 bg-[var(--bg-softer)] border-3 border-[var(--ink)] shadow-[6px_6px_0px_var(--shadow-color)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b-2 border-[var(--ink)] font-mono text-xs font-black uppercase">
              <div className="flex items-center gap-2 text-[var(--brutal-yellow)]">
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>
                  {fetchedMetadata.owner
                    ? `FETCHED README: ${fetchedMetadata.owner}/${fetchedMetadata.repo}`
                    : 'PASTED MARKDOWN PREVIEW READY'}
                </span>
              </div>
              <button
                onClick={handleReset}
                className="brutal-badge brutal-badge-dark hover:bg-[var(--brutal-red)] hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 mr-1" /> RESET PREVIEW
              </button>
            </div>

            {/* Rendered Markdown Preview Area */}
            <div className="max-h-[320px] overflow-y-auto p-4 bg-[var(--bg-soft)] border-2 border-[var(--ink)] mb-5 text-xs font-mono">
              <div className="prose prose-invert max-w-none text-xs leading-normal">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {fetchedMetadata.markdown}
                </ReactMarkdown>
              </div>
            </div>

            {/* Model & Generate Roast Action Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-3 border-t-2 border-dashed border-[var(--ink-faint)]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[var(--brutal-yellow)] shrink-0" />
                  <span className="font-bold text-[var(--ink-dim)] shrink-0">AI MODEL:</span>
                </div>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={roasting}
                  className="bg-[var(--bg-soft)] text-[var(--ink)] font-mono text-xs p-2.5 border-2 border-[var(--ink)] shadow-[2px_2px_0px_var(--shadow-color)] font-bold focus:outline-none w-full sm:w-auto"
                >
                  <option value="openai/gpt-oss-120b">GROQ GPT-OSS-120B (BRUTAL ROAST)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerateRoast}
                disabled={roasting}
                className="brutal-btn brutal-btn-yellow text-xs sm:text-sm py-3.5 px-6 sm:px-8 text-black min-h-[50px] w-full lg:w-auto"
              >
                {roasting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>GENERATING VERDICT...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Flame className="w-5 h-5 stroke-[2.5]" />
                    <span>GENERATE BRUTAL ROAST</span>
                    <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mt-4 p-4 bg-[#FF5252] text-white border-3 border-black shadow-[4px_4px_0px_#000] flex items-start gap-3 font-mono text-xs font-bold">
            <AlertTriangle className="w-5 h-5 shrink-0 stroke-[3]" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
