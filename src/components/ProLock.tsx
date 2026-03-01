"use client";

import { Lock, Crown, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ProPage({ title, feature }: { title: string, feature: string }) {
    return (
        <div className="space-y-8 min-h-[80vh] flex flex-col justify-center">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-widest">Volver</span>
            </Link>

            <div className="glass-card py-12 px-8 text-center space-y-6 border-amber-500/20 bg-amber-950/5 relative overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />

                <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-2">
                    <Lock className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{title}</h1>
                    <p className="text-amber-500 font-bold text-xs uppercase tracking-[0.3em]">Exclusivo Plan PRO</p>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                    Pásate a <span className="text-white font-bold">PRO</span> para controlar tu {feature} y llevar tu negocio al siguiente nivel.
                </p>

                <div className="pt-4">
                    <button className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 group transition-all">
                        <Crown className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        OBTENER ACCESO PRO
                    </button>
                </div>

                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    Reportes PDF • WhatsApp • Inventario Real
                </p>
            </div>
        </div>
    );
}
