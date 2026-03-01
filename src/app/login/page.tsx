"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const supabase = getSupabaseBrowser();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
            setLoading(false);
        } else {
            // Hard redirect so middleware receives the new session cookie
            window.location.href = '/';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            {/* Background grid pattern */}
            <div className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="relative w-full max-w-sm">
                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-white rounded-xl p-3 shadow-lg mb-4">
                            <img
                                src="/logo.webp"
                                alt="AD Equipamiento Automotriz"
                                className="h-16 w-auto object-contain"
                            />
                        </div>
                        <h1 className="text-white font-black text-xl tracking-tight uppercase">
                            AD Equipamiento
                        </h1>
                        <p className="text-blue-300 text-xs font-medium uppercase tracking-widest mt-0.5">
                            Sistema de Gestión
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest block">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@empresa.cl"
                                required
                                className="w-full h-11 bg-white/10 border border-white/20 rounded-xl px-4 text-white placeholder-white/30 font-medium text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest block">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-11 bg-white/10 border border-white/20 rounded-xl px-4 pr-11 text-white placeholder-white/30 font-medium text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
                                <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                                <p className="text-red-300 text-xs font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/50 mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="h-4 w-4" />
                                    Ingresar al Sistema
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-white/20 text-[10px] font-medium mt-6 uppercase tracking-widest">
                        AD Equipamiento Automotriz © 2025
                    </p>
                </div>
            </div>
        </div>
    );
}
