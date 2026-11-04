"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {

    const router = useRouter();

    const [formData, setFormData] = useState({ email:"", password:"" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        return () => {
            setFormData({ email:"", password:"" });
            setShowPassword(false);
            setError("");
            setSuccess("");
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value, });
    };

    const login = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const email = formData.email.trim();
        const password = formData.password;

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }
        
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );            
            const data = await response.json().catch(() => ({}));
            if( !response.ok ) {
                setError(data.message || data.error || "Login failed. Please check your credentials.");
                return;
            }
            setSuccess(data.message || "Login successful!");
            setFormData({email:"", password:""});
            setShowPassword(false);
            setError("");
            router.push("/dashboard");
        } catch (error) {
            console.log("login error", error);
            setError("Unable to Login");
        }
    };

    const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
                <div className="mb-8 text-center">
                    <Link href="/" className="text-2xl font-bold tracking-tight text-indigo-600">
                        URL Shortener
                    </Link>

                    <h1 className="mt-6 text-3xl font-bold text-gray-900">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to manage your shortened links.
                    </p>
                </div>

                {error && (
                    <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                <form onSubmit={login} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required className={inputClass} />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>

                            <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <div className="relative">
                            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required className={`${inputClass} pr-20`}/>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Sign in
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                        Create account
                    </Link>
                </p>

                <div className="mt-6 border-t border-gray-100 pt-5 text-center">
                    <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </main>
    );
}