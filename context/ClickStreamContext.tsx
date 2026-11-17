"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ClickEventPayload = {
    shortCode: string;
    clicks: number;
};

type ClickStreamContextType = {
    latestClick: ClickEventPayload | null;
};

const ClickStreamContext = createContext<ClickStreamContextType>({
    latestClick: null,
});

export function ClickStreamProvider({ children }: { children: React.ReactNode }) {
    const [latestClick, setLatestClick] = useState<ClickEventPayload | null>(null);

    useEffect(() => {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        const eventSource = new EventSource(`${baseUrl}/urls/stats/clicks`, {
            withCredentials: true,
        });

        eventSource.onmessage = (event) => {
            try {
                const data: ClickEventPayload = JSON.parse(event.data);
                setLatestClick(data);
            } catch (err) {
                console.error("Failed to parse SSE event data:", err);
            }
        };

        eventSource.onerror = (error) => {
            console.error("EventSource connection error:", error);
        };

        // Cleanup: closes the SSE connection when leaving the dashboard
        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <ClickStreamContext.Provider value={{ latestClick }}>
            {children}
        </ClickStreamContext.Provider>
    );
}

export function useClickStream() {
    return useContext(ClickStreamContext);
}