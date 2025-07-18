'use client';

import { useState, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { defaultSnippets } from '../../lib/defaultSnippets';
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
    <main className="relative w-full bg-[#7E48E6] p-4 flex flex-col items-center">
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
      <div className="relative z-10 flex items-center gap-2 mb-4">
        <Image
          src="/NoteCodeLogo.svg"
          alt="Notecode Logo"
          width={100}
          height={100}
        />
      </div>

      {/* Heading */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-center mb-4">
          Create & Share <br />
          <span className="text-indigo-600">Your Code easily</span>
        </h1>
      </div>

      {/* Editor Card */}
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl p-4 relative">
        {/* Minimap */}
        <div className="absolute top-4 right-4 w-28 h-40 overflow-hidden z-10 border border-gray-300 rounded">
          <CodeMirror
            ref={minimapRef}
            value={code}
            height="100%"
            theme={theme === 'dark' ? dracula : eclipse}
            extensions={[languageExtensions[language]]}
            readOnly={true}
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
        <div className="flex gap-4 mb-4">
          <select
            className="border p-2 rounded"
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

          <select
            className="border p-2 rounded"
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

        {/* Main Editor */}
        <CodeMirror
          ref={mainEditorRef}
          value={code}
          height="400px"
          theme={theme === 'dark' ? dracula : eclipse}
          extensions={[languageExtensions[language]]}
          onChange={(value) => {
            setCode(value);
            setSharedId(null);
            setShareDisabled(false);
          }}
        />

        {/* Share Button */}
        <button
          onClick={handleShare}
          disabled={shareDisabled}
          className={`mt-4 flex items-center gap-2 px-4 py-2 rounded text-white ${
            shareDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Image src="/share.svg" alt="Share icon" width={20} height={20} />
          Share
        </button>

        {/* Shared URL + Copy */}
        {sharedId && (
          <div className="mt-4 bg-gray-100 p-2 rounded flex items-center justify-between">
            <code className="text-sm break-all">
              {`${window.location.origin}/snippet/${sharedId}`}
            </code>
            <button
              onClick={handleCopy}
              className="ml-4 text-blue-600 hover:underline text-sm"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
