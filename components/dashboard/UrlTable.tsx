"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Search, Copy, Check, ExternalLink, Pencil, Trash2, CalendarDays } from "lucide-react";
import { getUrls, type ShortUrlItem } from "@/actions/urls";
import { useClickStream } from "@/context/ClickStreamContext";
import EditUrlModal from "./EditUrlModal";
import AnimateNumber from "@/components/animation/number";

export type ShortUrl = ShortUrlItem;
type UrlTableProps = {
    refreshKey?: number;
};

export default function UrlTable({ refreshKey = 0 }: UrlTableProps) {
    const [urls, setUrls] = useState<ShortUrl[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [editingUrl, setEditingUrl] = useState<ShortUrl | null>(null);
    const { latestClick } = useClickStream();

    const applyUrlsResult = (result: Awaited<ReturnType<typeof getUrls>>) => {
        if (!result.success) {
            setError(result.error);
            setIsLoading(false);
            return;
        }
        setUrls(result.data);
        setError("");
        setIsLoading(false);
    };

    // Fetch user URLs from backend /urls endpoint
    const fetchUrls = async () => {
        setIsLoading(true);
        setError("");
        const result = await getUrls();
        applyUrlsResult(result);
    };

    useEffect(() => {
        let active = true;
        getUrls().then((result) => {
            if (active) {
                applyUrlsResult(result);
            }
        });

        return () => {
            active = false;
        };
    }, [refreshKey]);

    useEffect(() => {
        if( !latestClick ) return;
        setUrls(
            (prev) => prev.map((item) => {                
                if( item.shortCode === latestClick.shortCode ) {
                    item.clicks = latestClick.clicks
                }
                return item;
            })
        );
    }, [latestClick]);

    const filteredUrls = useMemo(() => {
        const query = search.toLowerCase().trim();
        return urls.filter( (url) =>
            url.shortCode.toLowerCase().includes(query) ||
            url.originalUrl.toLowerCase().includes(query)
        );
    }, [urls, search]);

    // Copy shortened URL
    const copyUrl = async (url: ShortUrl) => {
        try {
            await navigator.clipboard.writeText(url.shortUrl);
            setCopiedId(url.id);
            window.setTimeout(() => {
                setCopiedId(null);
            }, 2000);
        } catch {
            alert("Unable to copy URL.");
        }
    };

    // Open edit modal
    const startEditing = (url: ShortUrl) => {
        setEditingUrl(url);
    };

    // Save edited URL
    const saveEdit = (updatedUrl: ShortUrl) => {
        setUrls((previousUrls) =>
            previousUrls.map((url) =>
                url.id === updatedUrl.id ? updatedUrl : url
            )
        );
        setEditingUrl(null);
    };

    // Delete URL
    const deleteUrl = (id: number) => {
        const confirmed = window.confirm("Are you sure you want to delete this shortened URL?");
        if (!confirmed) return;

        setUrls((previousUrls) => previousUrls.filter((url) => url.id !== id));
    };

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                {/* Table Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Your links
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            View and manage your shortened URLs.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <input type="text" placeholder="Search links..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"/>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Short URL</th>
                                <th className="px-6 py-4 font-medium">Destination</th>
                                <th className="px-6 py-4 font-medium">Clicks</th>
                                <th className="px-6 py-4 font-medium">Created</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                                        Loading your links...
                                    </td>
                                </tr>
                            )}

                            {!isLoading && error && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <p className="text-sm font-medium text-red-600">{error}</p>
                                        <button type="button" onClick={fetchUrls} className="mt-3 rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                                            Try again
                                        </button>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !error && filteredUrls.map((url) => (

                            <tr key={url.id} className="transition hover:bg-slate-50/70">

                                {/* Short URL */}
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-indigo-600">
                                        <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">
                                        {url.shortUrl}
                                        </a>
                                    </span>
                                    <button type="button" onClick={() => copyUrl(url)} title="Copy shortened URL" aria-label="Copy shortened URL" className="rounded-md p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600">
                                        {copiedId === url.id ? (
                                        <Check size={15} />
                                        ) : (
                                        <Copy size={15} />
                                        )}
                                    </button>
                                    </div>
                                </td>

                                {/* Original URL */}
                                <td className="max-w-64 px-6 py-4">
                                    <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600">
                                    <span className="max-w-52 truncate">
                                        {url.originalUrl}
                                    </span>
                                    <ExternalLink size={13} className="shrink-0"/>
                                    </a>
                                </td>

                                {/* Clicks */}
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                    {/* {url.clicks.toLocaleString()} */}
                                    <AnimateNumber value={url.clicks}/>
                                </td>

                                {/* Created date */}
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-2">
                                    <CalendarDays size={14} />
                                    {url.createdAt}
                                    </span>
                                </td>

                                {/* Status */}
                                <td className="whitespace-nowrap px-6 py-4">

                                    <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                        url.status === "Active"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                    >
                                    {url.status}
                                    </span>

                                </td>

                            {/* Actions */}
                            <td className="whitespace-nowrap px-6 py-4">

                                <div className="flex items-center justify-end gap-1">

                                <button
                                    type="button"
                                    onClick={() => startEditing(url)}
                                    title="Edit URL"
                                    aria-label="Edit URL"
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                                >
                                    <Pencil size={16} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => deleteUrl(url.id)}
                                    title="Delete URL"
                                    aria-label="Delete URL"
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                >
                                    <Trash2 size={16} />
                                </button>

                                </div>

                            </td>

                            </tr>

                        ))}

                        {/* Empty State */}
                        {!isLoading && !error && filteredUrls.length === 0 && (

                            <tr>
                            <td
                                colSpan={6}
                                className="px-6 py-12 text-center"
                            >

                                <div className="flex flex-col items-center">

                                <Search
                                    size={25}
                                    className="mb-3 text-slate-300"
                                />

                                <p className="text-sm font-medium text-slate-600">
                                    {urls.length === 0 ? "No links yet" : "No links found"}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    {urls.length === 0
                                    ? "Create your first shortened link to see it here."
                                    : "Try searching with a different keyword."}
                                </p>

                                </div>

                            </td>
                            </tr>

                        )}

                        </tbody>

                    </table>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
                    Showing {filteredUrls.length} of {urls.length} links
                </div>

            </section>

      {/* Edit Modal */}
      {editingUrl && (
        <EditUrlModal
          url={editingUrl}
          onClose={() => setEditingUrl(null)}
          onSave={saveEdit}
        />
      )}
    </>
  );
}