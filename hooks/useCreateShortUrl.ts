'use client';

import { useState } from 'react';
import { createShortUrl, type ShortUrlResponse } from '@/actions/urls';

export function useCreateShortUrl() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function submitUrl(originalUrl: string, customAlias?: string): Promise<ShortUrlResponse | null> {
        setError('');
        setIsLoading(true);

        try {
            const result = await createShortUrl({ originalUrl, customAlias });
            if (!result.success) {
                setError(result.error);
                return null;
            }
            return result.data;
        } finally {
            setIsLoading(false);
        }
    }

    return { submitUrl, isLoading, error, setError };
}