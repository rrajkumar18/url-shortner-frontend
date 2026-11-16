"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Link2, LayoutDashboard, BarChart3, Coins, UserRound, ChevronDown, LogOut, Settings, Menu, X } from "lucide-react";

export default function Header() {
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    const navClass = (href: string) =>
        `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition
        ${
            pathname === href
                ? "bg-indigo-50 text-indigo-600"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }`;

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Logout:", data.message);
            }

            router.replace("/login");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                        <Link2 size={20} />
                    </div>

                    <span className="text-xl font-bold tracking-tight">
                        Snip<span className="text-indigo-600">URL</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-2 sm:flex">
                    <Link
                        href="/dashboard"
                        className={navClass("/dashboard")}
                    >
                        <LayoutDashboard size={17} />
                        Dashboard
                    </Link>

                    <Link
                        href="/dashboard/analytics"
                        className={navClass("/dashboard/analytics")}
                    >
                        <BarChart3 size={17} />
                        Analytics
                    </Link>

                    <Link
                        href="/dashboard/crypto"
                        className={navClass("/dashboard/crypto")}
                    >
                        <Coins size={17} />
                        Crypto Fun
                    </Link>
                </nav>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2 rounded-full border border-slate-200 p-1.5 pr-3 transition hover:bg-slate-50"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                            <UserRound size={19} />
                        </div>

                        <span className="hidden text-sm font-medium sm:block">
                            My Account
                        </span>

                        <ChevronDown size={15} className="text-slate-400" />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                            <button
                                onClick={() => setProfileOpen(false)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                            >
                                <Settings size={16} />
                                Settings
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                                onClick={() => {
                                    setProfileOpen(false);
                                    handleLogout();
                                }}
                                disabled={isLoggingOut}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 disabled:opacity-50"
                            >
                                <LogOut size={16} />
                                {isLoggingOut ? "Signing out..." : "Sign out"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="ml-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:hidden"
                    aria-label="Toggle navigation"
                >
                    {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <nav className="flex flex-col gap-1 border-t border-slate-100 p-3 sm:hidden">
                    <Link
                        href="/dashboard"
                        onClick={closeMobileMenu}
                        className={navClass("/dashboard")}
                    >
                        <LayoutDashboard size={17} />
                        Dashboard
                    </Link>

                    <Link
                        href="/dashboard/analytics"
                        onClick={closeMobileMenu}
                        className={navClass("/dashboard/analytics")}
                    >
                        <BarChart3 size={17} />
                        Analytics
                    </Link>

                    <Link
                        href="/dashboard/crypto"
                        onClick={closeMobileMenu}
                        className={navClass("/dashboard/crypto")}
                    >
                        <Coins size={17} />
                        Crypto Fun
                    </Link>
                </nav>
            )}
        </header>
    );
}