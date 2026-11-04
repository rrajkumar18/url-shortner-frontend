"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function RegisterPage() {
    const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    useEffect(() => {
        return () => {
            setFormData({email:"", firstName:"", lastName:"", password:""});
            setShowPassword(false);
            setError("");
            setSuccess("");
        };
    },[]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
        setFormData({ ...formData, [e.target.name]: e.target.value, });
    };

    const Register = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const firstName = formData.firstName;
        const lastName = formData.lastName;
        const email = formData.email;
        const password = formData.password;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        firstName,
                        lastName,
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
            setSuccess(data.message || "Registration successful!");
        } catch (error) {
            console.log("Registration error", error);
            setError("Unable to Registration");
        }
        
    };
    
    const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

    return ( 
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
                <div className="mb-8 text-center">
                    <Link href="/" className="text-2xl font-bold tracking-tight text-indigo-600">
                        URL Shortener
                    </Link>

                    <h1 className="mt-6 text-3xl font-bold text-gray-900">
                        Create an account
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Sign up to start creating short links.
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

                <form onSubmit={Register} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700">
                                First name
                            </label>
                            <input id="firstName" name="firstName" type="text" autoComplete="given-name" value={formData.firstName} onChange={handleChange} placeholder="John" required className={inputClass}/>
                        </div>
                        <div>
                            <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700">
                                Last name
                            </label>
                            <input id="lastName" name="lastName" type="text" autoComplete="family-name" value={formData.lastName} onChange={handleChange} placeholder="Doe" required className={inputClass}/>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input id="email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required className={inputClass}/>
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="relative">
                            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={formData.password} onChange={handleChange} placeholder="At least 8 characters" minLength={8} required className={`${inputClass} pr-20`}/>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Use at least 8 characters.
                        </p>
                    </div>

                    <button type="submit" className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Create account
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
                        Sign in
                    </Link>
                </p>

                <p className="mt-6 text-center text-xs text-gray-400">
                    By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </main>
    );
}