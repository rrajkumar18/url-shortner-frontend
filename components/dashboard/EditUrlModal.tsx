"use client";

import { useState, useEffect } from "react";
import { X, Link2, ExternalLink } from "lucide-react";
import type { ShortUrl } from "./UrlTable";

type EditUrlModalProps = {
    url: ShortUrl;
    onClose: () => void;
    onSave: (updatedUrl: ShortUrl) => void;
};

export default function EditUrlModal({url, onClose, onSave}: EditUrlModalProps) {
    const [shortCode, setShortCode] = useState(url.shortCode);
    const [originalUrl, setOriginalUrl] = useState(url.originalUrl);
    const [error, setError] = useState("");
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const handleSave = () => {
        setError("");
        const code = shortCode.trim();
        const destination = originalUrl.trim();

        if (!code || !destination) {
            setError("Please fill in all fields.");
            return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
            setError("Short code can only contain letters, numbers, hyphens and underscores.");
            return;
        }

        let parsedUrl: URL;

        try {
            parsedUrl = new URL(destination);
        } catch {
            setError("Please enter a valid destination URL.");
            return;
        }

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            setError("Only HTTP and HTTPS URLs are supported.");
            return;
        }

        const updatedUrl: ShortUrl = {
            ...url,
            shortCode: code,
            shortUrl: `${origin}/${code}`,
            originalUrl: destination,
        };

        onSave(updatedUrl);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
                onClose();
            }
        }}>
            <div role="dialog" aria-modal="true" aria-labelledby="edit-url-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                {/* Modal Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Link2 size={21} />
                        </div>
                        <h2 id="edit-url-title" className="text-lg font-bold text-slate-900">
                            Edit link
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Update your shortened URL details.
                        </p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close modal" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                        <X size={19} />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-5">
                    {/* Short Code */}
                    <div>
                        <label htmlFor="shortCode" className="mb-2 block text-sm font-medium text-slate-700">
                            Short URL
                        </label>
                        <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                            <span className="whitespace-nowrap border-r border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                                {origin}/
                            </span>
                            <input id="shortCode" type="text" value={shortCode} onChange={(event) => setShortCode(event.target.value)} placeholder="custom-name" className="min-w-0 flex-1 px-3 py-3 text-sm text-slate-900 outline-none"/>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-400">
                            Choose a memorable name for your shortened link.
                        </p>
                    </div>

                    {/* Original URL */}
                    <div>
                        <label htmlFor="originalUrl" className="mb-2 block text-sm font-medium text-slate-700">
                            Destination URL
                        </label>
                        <div className="relative">
                            <input id="originalUrl" type="url" value={originalUrl} onChange={(event) => setOriginalUrl(event.target.value)} placeholder="https://example.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"/>
                            <ExternalLink size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="mt-8 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                        Save changes
                    </button>
                </div>
            </div>
        </div>
    );
}