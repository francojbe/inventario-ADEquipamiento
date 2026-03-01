"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    Save,
    Car,
    MapPin,
    Banknote,
    Briefcase,
    CreditCard,
    User,
    Contact,
    Building2,
    CheckCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const GLASS_TYPES = ['Parabrisas', 'Luneta', 'Vidrio Puerta', 'Lateral', 'Aleta'];
const POSITIONS = ['Piloto', 'Copiloto', 'Trasero Izq', 'Trasero Der', 'Central'];
const PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'Transferencia'];

export default function NewInstallation() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        tipo_vidrio: '',
        posicion: '',
        monto: '',
        metodo_pago: 'Efectivo',
        fecha: new Date().toISOString().slice(0, 10), // default: today YYYY-MM-DD
        cliente_nombre: '',
        cliente_rut: '',
        cliente_direccion: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tipo_vidrio || !formData.posicion || !formData.monto) {
            alert("Por favor completa todos los campos");
            return;
        }

        setLoading(true);

        let customerId = null;
        try {
            if (formData.cliente_rut || formData.cliente_nombre) {
                const { data: existingCustomer } = await supabase
                    .from('glass_customers')
                    .select('id')
                    .eq('rut', formData.cliente_rut)
                    .maybeSingle();

                if (existingCustomer) {
                    customerId = existingCustomer.id;
                } else {
                    const { data: newCustomer } = await supabase
                        .from('glass_customers')
                        .insert([{
                            full_name: formData.cliente_nombre || 'Cliente Genérico',
                            rut: formData.cliente_rut,
                            direccion: formData.cliente_direccion
                        }])
                        .select('id')
                        .single();
                    if (newCustomer) customerId = newCustomer.id;
                }
            }
        } catch (_) { }

        const { error } = await supabase.from('glass_installations').insert([{
            tipo_vidrio: formData.tipo_vidrio,
            posicion: formData.posicion,
            monto: Number(formData.monto),
            metodo_pago: formData.metodo_pago,
            fecha: new Date(formData.fecha + 'T12:00:00').toISOString(), // noon avoids timezone issues
            cliente_nombre: formData.cliente_nombre,
            cliente_rut: formData.cliente_rut,
            cliente_direccion: formData.cliente_direccion,
            customer_id: customerId
        }]);

        if (!error) {
            setSuccess(true);
            setTimeout(() => router.push('/'), 1500);
        } else {
            alert("Error al guardar: " + error.message);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">¡REGISTRADO!</h2>
                <p className="text-gray-400">Volviendo al tablero...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:h-full overflow-x-hidden lg:overflow-hidden gap-2 animate-in fade-in">

            {/* Navigation */}
            <Link href="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Volver</span>
            </Link>

            {/* Title */}
            <div className="flex-shrink-0">
                <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">NUEVA VENTA</h1>
                <p className="text-gray-400 font-medium text-sm">Registro de instalación o servicio</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 lg:min-h-0 flex flex-col gap-2 max-w-4xl">
                {/* Two column grid */}
                <div className="flex-1 lg:min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3">

                    {/* Left Column: Job Details */}
                    <div className="flex flex-col gap-2 lg:min-h-0">
                        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 flex flex-col gap-2.5">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalles de la Venta</h3>

                            <div className="space-y-1">
                                <Label icon="Briefcase" title="Tipo de Vidrio" />
                                <Select value={formData.tipo_vidrio} onValueChange={(v) => setFormData({ ...formData, tipo_vidrio: v })}>
                                    <SelectTrigger className="w-full h-10 bg-white border border-gray-200 rounded-lg text-gray-900 font-bold px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm">
                                        <SelectValue placeholder="Selecciona el tipo" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-200 rounded-lg shadow-xl">
                                        {GLASS_TYPES.map((t) => (
                                            <SelectItem key={t} value={t} className="py-2 font-medium text-sm">{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label icon="MapPin" title="Posición" />
                                <Select value={formData.posicion} onValueChange={(v) => setFormData({ ...formData, posicion: v })}>
                                    <SelectTrigger className="w-full h-10 bg-white border border-gray-200 rounded-lg text-gray-900 font-bold px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm">
                                        <SelectValue placeholder="Selecciona ubicación" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-200 rounded-lg shadow-xl">
                                        {POSITIONS.map((p) => (
                                            <SelectItem key={p} value={p} className="py-2 font-medium text-sm">{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="bg-blue-50/30 p-3 rounded-2xl border border-blue-100 flex flex-col gap-2.5">
                            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Información de Pago</h3>

                            <div className="space-y-1">
                                <Label icon="Banknote" title="Monto a Cobrar" />
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-base">$</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.monto}
                                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                                        className="w-full h-10 bg-white border border-gray-200 rounded-lg pl-7 p-3 text-gray-900 text-lg font-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label icon="CreditCard" title="Método de Pago" />
                                    <Select value={formData.metodo_pago} onValueChange={(v) => setFormData({ ...formData, metodo_pago: v })}>
                                        <SelectTrigger className="w-full h-10 bg-white border border-gray-200 rounded-lg text-gray-900 font-bold px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm">
                                            <SelectValue placeholder="Método de pago" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-200 rounded-lg shadow-xl">
                                            {PAYMENT_METHODS.map((m) => (
                                                <SelectItem key={m} value={m} className="py-2 font-medium text-sm">{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label icon="MapPin" title="Fecha de Venta" />
                                    <input
                                        type="date"
                                        value={formData.fecha}
                                        max={new Date().toISOString().slice(0, 10)}
                                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                        className="w-full h-10 bg-white border border-gray-200 rounded-lg px-3 text-gray-900 font-bold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer Details */}
                    <div className="min-h-0">
                        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 flex flex-col gap-2.5 h-full">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Datos del Cliente <span className="text-gray-300 font-medium normal-case">(Opcional)</span></h3>
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Auto-alimentación de base de clientes.</p>
                            </div>

                            <div className="space-y-1">
                                <Label icon="User" title="Nombre o Empresa" />
                                <input
                                    type="text"
                                    placeholder="Ej: Juan Perez"
                                    value={formData.cliente_nombre}
                                    onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
                                    className="w-full h-10 bg-white border border-gray-200 rounded-lg p-3 text-gray-900 font-bold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label icon="Contact" title="RUT" />
                                <input
                                    type="text"
                                    placeholder="12.345.678-9"
                                    value={formData.cliente_rut}
                                    onChange={(e) => setFormData({ ...formData, cliente_rut: e.target.value })}
                                    className="w-full h-10 bg-white border border-gray-200 rounded-lg p-3 text-gray-900 font-bold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label icon="MapPin" title="Dirección" />
                                <textarea
                                    placeholder="Av. Las Condes 1234..."
                                    rows={3}
                                    value={formData.cliente_direccion}
                                    onChange={(e) => setFormData({ ...formData, cliente_direccion: e.target.value })}
                                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-gray-900 font-bold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end flex-shrink-0">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto md:min-w-[220px] bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-xl flex items-center justify-center gap-2.5 font-black text-sm shadow-lg shadow-blue-100 transition-all active:scale-[0.98] px-8"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                GUARDAR VENTA
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Label({ icon, title }: { icon: string, title: string }) {
    const IconMap: Record<string, any> = {
        Briefcase, MapPin, Banknote, CreditCard, User, Building2, Contact
    };
    const Icon = IconMap[icon] || Briefcase;
    return (
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
            <Icon className="w-3 h-3" />
            {title}
        </div>
    );
}
