"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
    CheckCircle,
    Phone,
    Loader2
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
const POSITIONS = ['Delantero Derecho', 'Delantero Izquierdo', 'Trasero Izquierdo', 'Trasero Derecho', 'Central'];
const PAYMENT_METHODS = ['Efectivo', 'Débito', 'Crédito', 'Transferencia'];

export default function EditarVenta() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        tipo_vidrio: '',
        posicion: '',
        monto: '',
        metodo_pago: 'Efectivo',
        fecha: '',
        cliente_nombre: '',
        cliente_patente: '',
        cliente_telefono: '',
        customer_id: null as string | null
    });

    useEffect(() => {
        if (id) fetchVenta();
    }, [id]);

    const fetchVenta = async () => {
        const { data, error } = await supabase
            .from('glass_installations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            alert("Error al cargar la venta: " + error.message);
            router.push('/ventas');
            return;
        }

        if (data) {
            setFormData({
                tipo_vidrio: data.tipo_vidrio,
                posicion: data.posicion,
                monto: data.monto.toString(),
                metodo_pago: data.metodo_pago,
                fecha: new Date(data.fecha).toISOString().slice(0, 10),
                cliente_nombre: data.cliente_nombre || '',
                cliente_patente: data.cliente_patente || '',
                cliente_telefono: data.cliente_telefono || '',
                customer_id: data.customer_id
            });
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tipo_vidrio || !formData.posicion || !formData.monto) {
            alert("Por favor completa todos los campos");
            return;
        }

        setSaving(true);

        // Update installation
        const { error } = await supabase
            .from('glass_installations')
            .update({
                tipo_vidrio: formData.tipo_vidrio,
                posicion: formData.posicion,
                monto: Number(formData.monto),
                metodo_pago: formData.metodo_pago,
                fecha: new Date(formData.fecha + 'T12:00:00').toISOString(),
                cliente_nombre: formData.cliente_nombre,
                cliente_patente: formData.cliente_patente,
                cliente_telefono: formData.cliente_telefono,
            })
            .eq('id', id);

        // Also update customer if exists
        if (formData.customer_id) {
            await supabase
                .from('glass_customers')
                .update({
                    full_name: formData.cliente_nombre,
                    patente: formData.cliente_patente,
                    telefono: formData.cliente_telefono
                })
                .eq('id', formData.customer_id);
        }

        if (!error) {
            setSuccess(true);
            setTimeout(() => router.push('/ventas'), 1500);
        } else {
            alert("Error al guardar: " + error.message);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">¡ACTUALIZADO!</h2>
                <p className="text-gray-400">Volviendo al historial...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:h-full overflow-x-hidden gap-2 animate-in fade-in pb-4">
            {/* Navigation */}
            <Link href="/ventas" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Volver</span>
            </Link>

            {/* Title */}
            <div className="flex-shrink-0">
                <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">EDITAR VENTA</h1>
                <p className="text-gray-400 font-medium text-sm">Modifica los detalles del registro</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 lg:min-h-0 flex flex-col gap-2 max-w-4xl">
                <div className="flex-1 lg:min-h-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Left Column */}
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
                                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                        className="w-full h-10 bg-white border border-gray-200 rounded-lg px-3 text-gray-900 font-bold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="min-h-0">
                        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 flex flex-col gap-2.5 h-full">
                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Datos del Cliente</h3>
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
                                <Label icon="Car" title="Patente" />
                                <input
                                    type="text"
                                    placeholder="ABCD12"
                                    value={formData.cliente_patente}
                                    onChange={(e) => setFormData({ ...formData, cliente_patente: e.target.value })}
                                    className="w-full h-10 bg-white border border-gray-200 rounded-lg p-3 text-gray-900 font-bold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label icon="Phone" title="Teléfono" />
                                <input
                                    type="text"
                                    placeholder="+56 9..."
                                    value={formData.cliente_telefono}
                                    onChange={(e) => setFormData({ ...formData, cliente_telefono: e.target.value })}
                                    className="w-full h-10 bg-white border border-gray-200 rounded-lg p-3 text-gray-900 font-bold focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={() => router.push('/ventas')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-11 px-6 rounded-xl font-bold transition-all"
                    >
                        CANCELAR
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-xl flex items-center justify-center gap-2.5 font-black text-sm shadow-lg shadow-blue-100 transition-all active:scale-[0.98] px-8"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                GUARDAR CAMBIOS
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
        Briefcase, MapPin, Banknote, CreditCard, User, Building2, Contact, Phone, Car
    };
    const Icon = IconMap[icon] || Briefcase;
    return (
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
            <Icon className="w-3 h-3" />
            {title}
        </div>
    );
}
