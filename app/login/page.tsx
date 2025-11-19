"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminUsers, readOnlyUsers } from "../config/users";

export default function LoginPage() {
    const router = useRouter();
    const [nextUrl, setNextUrl] = useState("/");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const sp = new URLSearchParams(window.location.search);
        const next = sp.get("next") || "/";
        setNextUrl(next);

        const cookie = document.cookie.split("; ").find((c) => c.startsWith("auth="));
        if (cookie?.split("=")[1] === "true") {
            router.replace(next);
        }
    }, [router]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const uname = username.trim();
        const allowed = adminUsers.concat(readOnlyUsers);
        if (allowed.includes(uname) && password === "admin") {
            const maxAge = 60 * 60; // 1 hour
            document.cookie = `auth=true; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
            document.cookie = `user=${encodeURIComponent(uname)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
            router.replace(nextUrl);
        } else {
            setError("Invalid username or password");
        }
    }

    return (
        <main style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
            <form onSubmit={handleSubmit} style={{ width: 320, padding: 24, border: "1px solid #ddd", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <h1 style={{ margin: 0, marginBottom: 12, fontSize: 20 }}>Sign in</h1>
                <label style={{ display: "block", marginBottom: 8 }}>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>Username</div>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }} autoComplete="username" />
                </label>
                <label style={{ display: "block", marginBottom: 8 }}>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>Password</div>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }} autoComplete="current-password" />
                </label>
                {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
                <button type="submit" style={{ width: "100%", padding: 10, borderRadius: 4, background: "#111", color: "#fff", border: "none" }}>Sign in</button>
                <div style={{ marginTop: 12, fontSize: 12, color: "#666" }}>Login with any user from the configured lists (password: <strong>admin</strong>)</div>
            </form>
        </main>
    );
}
