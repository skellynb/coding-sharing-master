'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CodeMirror from '@uiw/react-codemirror';
import { defaultSnippets } from '../../lib/defaultSnippets';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { Extension } from '@uiw/react-codemirror';
import Image from 'next/image';



export default function HomePage() {
  const [code, setCode] = useState(defaultSnippets['html']);
  const [language, setLanguage] = useState('html');
  const [theme, setTheme] = useState('light');
  const [shared, setShared] = useState(false);
  const router = useRouter();

  const handleShare = async () => {
    try {
      const res = await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, theme }),
      });

      const data = await res.json();
      router.push(`/snippet/${data.id}`);
      setShared(true);
    } catch (err) {
      console.error('Error sharing snippet:', err);
    }
  };

  const languageExtensions: Record<string, Extension> = {
  html: html(),
  javascript: javascript(),
  css: css(),
};

return (
    
    <main className="relative  w-full
    bg-[#7E48E6]
    p-4 flex flex-col items-center">

<div className="absolute top-0 left-0 w-full h-[500px] z-0">
  <Image
    src="/Hero-Background-notecode@2x.png" 
    alt="Hero Background"
    fill
    className="object-cover"
    priority
  />
</div>

    {/* Logo and brand name */}
<div className="relative z-10 flex items-center gap-2 mb-4">
  <Image
    src="/NoteCodeLogo.svg"
    alt="Notecode Logo"
    width={100}
    height={100}
  />
  
</div>

      


     <div className="relative z-10">
      <h1 className="text-3xl font-bold text-center mb-4">
        Create & Share <br />
        <span className="text-indigo-600">Your Code easily</span>
      </h1>
      </div>

      {/* Language + Theme dropdowns */}
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl p-4 relative">
    

        <div className="flex gap-4 mb-4">
          <select
            className="border p-2 rounded"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="javascript">JavaScript</option>
          </select>

          <select
            className="border p-2 rounded"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <CodeMirror
  value={code}
  height="400px"
  theme={theme === 'dark' ? dracula : eclipse} 
  extensions={[languageExtensions[language]]}
  onChange={(value) => {
    setCode(value);
    setShared(false);
  }}
/>


        <button
          onClick={handleShare}
          disabled={shared}
          className="mt-4 ml-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <Image
    src="/share.svg"
    alt="Share icon"
    width={20}
    height={20}
  />
          Share
        </button>
      </div>
    </main>
    
  );
}
