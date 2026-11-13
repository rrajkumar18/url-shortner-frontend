"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useCreateShortUrl } from "@/hooks/useCreateShortUrl";
import type { ShortUrlResponse } from "@/actions/urls";

type CreateLinkModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
};

export default function CreateLinkModal({
    isOpen,
    onClose,
    onCreated,
}: CreateLinkModalProps) {
    const [originalUrl, setOriginalUrl] = useState("");
    const [customAlias, setCustomAlias] = useState("");
    const [createdUrl, setCreatedUrl] = useState<ShortUrlResponse | null>(null);
    const [copied, setCopied] = useState(false);
    const { submitUrl, isLoading, error, setError } = useCreateShortUrl();

    if (!isOpen) return null;

    const resetForm = () => {
        setError("");
        setOriginalUrl("");
        setCustomAlias("");
        setCreatedUrl(null);
        setCopied(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = await submitUrl(originalUrl, customAlias);
        if (data) {
            setCreatedUrl(data);
            setOriginalUrl("");
            setCustomAlias("");
            setCopied(false);
            onCreated?.();
        }
    };

    const handleCopy = async () => {
        if (!createdUrl) return;
        try {
            await navigator.clipboard.writeText(createdUrl.shortUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">
                        {createdUrl ? "Short URL Ready" : "Create New Link"}
                    </h2>
                    <button type="button" onClick={handleClose} disabled={isLoading} className="text-2xl text-slate-400 hover:text-slate-700">
                        &times;
                    </button>
                </div>

                {createdUrl ? (
                    <div className="space-y-5">
                        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                            <p className="font-semibold">Short URL created successfully!</p>
                            <p className="mt-1 truncate text-xs text-emerald-700">
                                Original: {createdUrl.originalUrl}
                            </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <a
                                href={createdUrl.shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="min-w-0 flex-1 truncate text-sm font-medium text-indigo-600 underline"
                            >
                                {createdUrl.shortUrl}
                            </a>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                {copied ? (
                                    <>
                                        <Check size={14} className="text-emerald-600" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                Shorten New URL
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Destination URL
                            </label>

                            <input type="url" required disabled={isLoading} placeholder="https://example.com" value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"/>
                        </div>

                        {error && (
                            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Custom Alias (Optional)
                            </label>

                            <input
                                type="text"
                                placeholder="my-custom-link"
                                value={customAlias}
                                onChange={(e) => setCustomAlias(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div> */}

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={handleClose} disabled={isLoading} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                                Cancel
                            </button>

                            <button type="submit" disabled={isLoading} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                                {isLoading ? "Creating..." : "Create Link"}
                            </button>
                        </div>
                    </form>
                )}
            </div>            
        </div>
    );
}
