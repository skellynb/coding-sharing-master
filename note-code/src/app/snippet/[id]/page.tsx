// app/snippet/[id]/page.tsx
'use client';

import CodeMirror from "@uiw/react-codemirror";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { eclipse } from "@uiw/codemirror-theme-eclipse";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { useEffect, useState } from "react";

function getExtensions(language: string) {
  switch (language) {
    case "html":
      return [html()];
    case "css":
      return [css()];
    case "javascript":
      return [javascript()];
    default:
      return [];
  }
}

function getTheme(theme: string) {
  switch (theme) {
    case "dracula":
      return dracula;
    case "eclipse":
      return eclipse;
    default:
      return dracula;
  }
}

type Snippet = {
  code: string;
  language: string;
  theme: string;
  createdAt: string;
};

export default function SnippetPage({ params }: { params: Promise<{ id: string }> }) {
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [error, setError] = useState(false);
  const [id, setId] = useState<string | null>(null);

  // Resolve params first
  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
    });
  }, [params]);

  // Fetch snippet once we have the id
  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/snippets/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setSnippet)
      .catch(() => setError(true));
  }, [id]);

  if (error) return <div className="p-10 text-red-500">Snippet not found.</div>;
  if (!snippet) return <div className="p-10">Loading...</div>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Shared Snippet</h1>
      <CodeMirror
        value={snippet.code}
        height="400px"
        theme={getTheme(snippet.theme)}
        extensions={getExtensions(snippet.language)}
        readOnly={true}
      />
      <p className="text-gray-500 mt-4">Created: {new Date(snippet.createdAt).toLocaleString()}</p>
    </main>
  );
}