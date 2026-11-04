"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import type { SubmitEvent } from "react";

type ShortUrlResponse = {
  id: number;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: string;
};

export default function Home() {
  const [url, setUrl] = useState(""); // For input field
  const [url1, setUrl1] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event:SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setShortUrl("");
    const originalUrl = url.trim();
    if(!originalUrl) {
      setError("Please enter a URL.");
      return;
    }
    setUrl1(originalUrl);
    setUrl("");
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/urls',{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({originalUrl})
      });

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`,
        );
      }
      const data: ShortUrlResponse = await response.json();
      setShortUrl(data.shortUrl);      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }

  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* navigation bar */}
      <nav className="flex items-center justify-between border-b bg-white px-6 py-4 md:px-16">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          SnipURL
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-indigo-600">
            Login
          </Link>
          <Link href="/register" className="rounded-lg bg-indigo-600 px-4 py-4 text-sm font-medium text-white hover:bg-indigo-700">
            Create Account
          </Link>
        </div>
      </nav>
      
      {/* Main Content */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center md:py-32">
        <span className="mb-6 rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">
          Short Links. Bigger possibilities
        </span>        
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Make your links shorter.          
          <span className="block text-indigo-600">
            Make every link count.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Turn long URLs into short, shareable links.
          Track clicks and understand how your audience engages.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg sm:flex-row">
          <input type="url" value={url ?? ""} onChange={(event)=>setUrl(event.target.value)} disabled={isLoading} placeholder="Paste you long URL here..." aria-label="Long URL" className="min-w-0 flex-1 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" required />
          <button type="submit" className="rounded-lg bg-indigo-600 cursor-pointer px-6 py-3 font-semibold text-white transition hover:bg-indigo-700" disabled={isLoading}>
            {isLoading ? "Shortening" : "Shorten URL"}
          </button>
        </form>
        {/* { message && (
          <p className="mt-4 break-all text-sm text-slate-600">
            {message}
          </p>
        )} */}
        { error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
        { shortUrl && (
          <div className="relative mt-6 w-full max-w-2xl rounded-xl border border-green-200 bg-green-50 p-5">
            <button type="button" onClick={() => setShortUrl("")} className="absolute right-3 top-3 cursor-pointer rounded-md p-1 text-green-700 hover:bg-green-100 hover:text-green-900" aria-label="Close success message">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
            <p className="text-green-800">
              Your short URL for <Link className="font-semibold" target="_blank" href={url1}>{url1}</Link> is ready
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 break-all font-medium text-indigo-700 underline">{shortUrl}</a>
              <button type="button" onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shortUrl);
                    setCopied(true);
                    setTimeout(() => {
                      setCopied(false);
                    }, 2000)
                  } catch (err) {
                    console.error("Failed to copy link:", error);
                  }
                }} className="rounded-lg border border-green-300 bg-white cursor-pointer px-4 py-2 text-sm font-medium hover:bg-green-100">
                Copy Link
              </button>
              { copied && (
                <span className="absolute bottom-full left-1/2 mb-2-translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white shadow-md">Link Copied!</span>
              )}
            </div>
          </div>
        )}
        <p className="mt-4 text-sm text-slate-500">
          Free to get started. No complicated setup
        </p>

        {/* Feature Cards */}
        <div className="mt-20 grid w-full gap-6 text-left md:grid-cols-3">
          <div className="rounded-xl border bg-white p-6">
            <div className="text-2xl"></div>
            <h2 className="mt-4 font-semibold">Short Links</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create Clean, memorable links that are easy to share.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6">
            <div className="text-2xl"></div>
            <h2 className="mt-4 font-semibold">Click Analytics</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              See how many times people click your shortened URLs.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6">
            <div className="text-2xl"></div>
            <h2 className="mt-4 font-semibold">Manage your links</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Keep your links organized in one convenient dashboard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
