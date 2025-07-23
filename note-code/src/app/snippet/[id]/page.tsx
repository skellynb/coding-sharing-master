'use client';

import { useState, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { defaultSnippets } from '../../../../lib/defaultSnippets';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import type { Extension } from '@uiw/react-codemirror';
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import Image from 'next/image';

export default function HomePage() {
  const [code, setCode] = useState(defaultSnippets['html']);
  const [language, setLanguage] = useState('html');
  const [theme, setTheme] = useState('light');
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareDisabled, setShareDisabled] = useState(false);

  const mainEditorRef = useRef<ReactCodeMirrorRef>(null);
  const minimapRef = useRef<ReactCodeMirrorRef>(null);

  useEffect(() => {
    const mainView = mainEditorRef.current?.view;
    const miniView = minimapRef.current?.view;
    const main = mainView?.scrollDOM;
    const mini = miniView?.scrollDOM;
    if (!main || !mini) return;

    let isSyncingFromMain = false;
    let isSyncingFromMini = false;

    const syncFromMain = () => {
      if (isSyncingFromMini) return;
      isSyncingFromMain = true;
      const ratio = main.scrollTop / (main.scrollHeight - main.clientHeight);
      mini.scrollTop = ratio * (mini.scrollHeight - mini.clientHeight);
      isSyncingFromMain = false;
    };

    const syncFromMini = () => {
      if (isSyncingFromMain) return;
      isSyncingFromMini = true;
      const ratio = mini.scrollTop / (mini.scrollHeight - mini.clientHeight);
      main.scrollTop = ratio * (main.scrollHeight - main.clientHeight);
      isSyncingFromMini = false;
    };

    const handleMiniClick = (e: MouseEvent) => {
      const miniRect = mini.getBoundingClientRect();
      const clickY = e.clientY - miniRect.top;
      const ratio = clickY / mini.clientHeight;
      const targetScrollTop = ratio * (main.scrollHeight - main.clientHeight);
      main.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    };

    main.addEventListener('scroll', syncFromMain);
    mini.addEventListener('scroll', syncFromMini);
    mini.addEventListener('click', handleMiniClick);

    return () => {
      main.removeEventListener('scroll', syncFromMain);
      mini.removeEventListener('scroll', syncFromMini);
      mini.removeEventListener('click', handleMiniClick);
    };
  }, []);

  const handleShare = async () => {
    try {
      const res = await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, theme }),
      });
      const data = await res.json();
      setSharedId(data.id);
      setShareDisabled(true);
    } catch (err) {
      console.error('Error sharing snippet:', err);
    }
  };

  const handleCopy = async () => {
    if (!sharedId) return;
    const url = `${window.location.origin}/snippet/${sharedId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languageExtensions: Record<string, Extension> = {
    html: html(),
    javascript: javascript(),
    css: css(),
  };

  return (
    <main className="relative min-h-screen w-full bg-[#7E48E6] px-4 sm:px-6 md:px-10 py-6 flex flex-col items-center">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] z-0">
        <Image
          src="/Hero-Background-notecode@2x.png"
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2 mb-6">
        <Image
          src="/NoteCodeLogo.svg"
          alt="Notecode Logo"
          width={60}
          height={60}
          className="sm:w-20 sm:h-20"
        />
      </div>

      {/* Heading */}
      <div className="relative z-10 px-2 text-center mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4 leading-tight">
          Create & Share <br />
          <span className="text-black">Your Code easily</span>
        </h1>
      </div>

      {/* Editor Card */}
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-xl p-4 sm:p-6 relative mb-8">
        {/* Minimap - hidden on small screens */}
        <div className="hidden lg:block absolute top-6 right-6 w-32 h-48 overflow-hidden z-10 border border-gray-300 rounded shadow-md">
          <CodeMirror
            ref={minimapRef}
            value={code}
            height="100%"
            theme={theme === 'dark' ? dracula : eclipse}
            extensions={[languageExtensions[language]]}
            readOnly
            basicSetup={{
              lineNumbers: false,
              highlightActiveLine: false,
              highlightSelectionMatches: false,
            }}
            style={{
              fontSize: '6px',
              lineHeight: '8px',
              width: '100%',
              overflow: 'auto',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 bg-white">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-black mb-1">Language</label>
            <select
              className="border-2 border-indigo-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 p-3 rounded-lg w-full sm:w-40 text-black font-medium bg-white"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setShareDisabled(false);
                setSharedId(null);
              }}
            >
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Theme</label>
            <select
              className="border-2 border-indigo-500 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 p-3 rounded-lg w-full sm:w-40 text-gray-800 font-medium bg-white"
              value={theme}
              onChange={(e) => {
                setTheme(e.target.value);
                setShareDisabled(false);
                setSharedId(null);
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        {/* Code Editor */}
        <div className="mb-6 border-2 border-gray-200 rounded-lg overflow-hidden">
          <CodeMirror
            ref={mainEditorRef}
            value={code}
            height="350px"
            className="text-sm sm:text-base"
            theme={theme === 'dark' ? dracula : eclipse}
            extensions={[languageExtensions[language]]}
            onChange={(value) => {
              setCode(value);
              setSharedId(null);
              setShareDisabled(false);
            }}
          />
        </div>

        {/* Share Button */}
        <div className="flex justify-center sm:justify-end">
          <button
            onClick={handleShare}
            disabled={shareDisabled}
            className={`flex items-center justify-center gap-3 px-6 py-3 w-full sm:w-auto rounded-lg text-white font-semibold transition-all duration-200 ${
              shareDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-lg hover:shadow-xl'
            }`}
          >
            <Image 
              src="/share.svg" 
              alt="Share icon" 
              width={20} 
              height={20}
              className="filter brightness-0 invert"
            />
            <span>Share Code</span>
          </button>
        </div>

        {/* Shared URL + Copy */}
        {sharedId && (
          <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 mb-1">Share this link:</p>
                <code className="text-sm text-green-700 break-all bg-white px-2 py-1 rounded border">
                  {`${window.location.origin}/snippet/${sharedId}`}
                </code>
              </div>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap"
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}