'use server';

import { revalidatePath } from 'next/cache';
import { backendFetch } from '@/lib/api';

export type ShortUrlResponse = {
    id: number;
    originalUrl: string;
    shortCode: string;
    shortUrl: string;
    createdAt: string;
};

export type ShortUrlItem = {
    id: number;
    originalUrl: string;
    createdAt: string;
    shortCode: string;
    userId: number;
    shortUrl: string;    
    clicks: number;
    status: 'Active' | 'Inactive';
};

function formatShortUrl(item: ShortUrlItem): ShortUrlItem {
    const parsedDate = new Date(item.createdAt);
    const formattedDate = Number.isNaN(parsedDate.getTime())
        ? item.createdAt
        : parsedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });       
    return {
        ...item,
        ...{createdAt:formattedDate}
    };
}

export async function getUrls(): Promise<{ success: true; data: ShortUrlItem[] } | { success: false; error: string }> {
    try {
        const response = await backendFetch('/urls', {
            method: 'GET',
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            return {
                success: false,
                error: payload.message || `Request failed with status ${response.status}`,
            };
        }

        // const rawList: ShortUrlItem[] = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.urls) ? payload.urls : [];
        const rawList:ShortUrlItem[] = payload;
        
        return {
            success: true,
            // data: rawList.map(formatShortUrl),
            data:payload.map(formatShortUrl)
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to load URLs.',
        };
    }
}

export type DashboardStats = {
    totalLinks: number;
    totalClicks: number;
    activeLinks: number;
};

type RawDashboardStats = {
    totalLinks?: number;
    totalUrls?: number;
    total?: number;
    totalClicks?: number;
    clicks?: number;
    clickCount?: number;
    activeLinks?: number;
    activeUrls?: number;
    active?: number;
};

export async function getDashboardStats(): Promise<
    { success: true; data: DashboardStats } | { success: false; error: string }
> {
    try {
        const response = await backendFetch('/urls/stats/dashboard', {
            method: 'GET',
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            return {
                success: false,
                error: payload.message || `Request failed with status ${response.status}`,
            };
        }

        const raw: RawDashboardStats = payload?.data ?? payload ?? {};

        return {
            success: true,
            data: {
                totalLinks: raw.totalLinks ?? raw.totalUrls ?? raw.total ?? 0,
                totalClicks: raw.totalClicks ?? raw.clicks ?? raw.clickCount ?? 0,
                activeLinks: raw.activeLinks ?? raw.activeUrls ?? raw.active ?? 0,
            },
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to load dashboard stats.',
        };
    }
}

export async function createShortUrl(input: {originalUrl: string;customAlias?: string;}): Promise<{ success: true; data: ShortUrlResponse } | { success: false; error: string }> {
    const originalUrl = input.originalUrl.trim();
    if (!originalUrl) {
        return { success: false, error: 'Please enter a URL.' };
    }

    try {
        const response = await backendFetch('/urls', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                originalUrl
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            return {
                success: false,
                error: data.message || `Request failed with status ${response.status}`,
            };
        }

        revalidatePath('/dashboard'); // refreshes dashboard data after creation
        return { 
            success: true, 
            data 
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        };
    }
}