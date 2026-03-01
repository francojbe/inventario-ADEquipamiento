"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/lib/supabase';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Download, X, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const GLASS_TYPES = ['Todos', 'Parabrisas', 'Luneta', 'Vidrio Puerta', 'Lateral', 'Aleta'];
const PAGE_SIZE = 15;

export default function HistorialVentas() {
    const searchParams = useSearchParams();
    const [installations, setInstallations] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [dateFrom, setDateFrom] = useState(() => searchParams.get('from') || '');
    const [dateTo, setDateTo] = useState(() => searchParams.get('to') || '');

    useEffect(() => { fetchInstallations(); }, []);
    useEffect(() => { applyFilters(); }, [categoryFilter, dateFrom, dateTo, installations]);

    // Reset to page 1 whenever filters change
    useEffect(() => { setCurrentPage(1); }, [categoryFilter, dateFrom, dateTo]);

    const fetchInstallations = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('glass_installations')
            .select('*')
            .order('fecha', { ascending: false });
        if (data) { setInstallations(data); setFilteredData(data); }
        setLoading(false);
    };

    const applyFilters = () => {
        let result = [...installations];
        if (categoryFilter !== 'Todos') result = result.filter(i => i.tipo_vidrio === categoryFilter);
        if (dateFrom || dateTo) {
            result = result.filter(item => {
                const d = parseISO(item.fecha);
                const start = dateFrom ? startOfDay(parseISO(dateFrom)) : new Date(0);
                const end = dateTo ? endOfDay(parseISO(dateTo)) : new Date(8640000000000000);
                return isWithinInterval(d, { start, end });
            });
        }
        setFilteredData(result);
    };

    const resetFilters = () => { setCategoryFilter('Todos'); setDateFrom(''); setDateTo(''); };

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta venta?")) {
            const { error } = await supabase.from('glass_installations').delete().eq('id', id);
            if (error) toast.error("Error al eliminar: " + error.message);
            else {
                toast.success("Venta eliminada correctamente");
                fetchInstallations();
            }
        }
    };

    const exportToExcel = async () => {
        try {
            const response = await fetch('/api/export-excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: filteredData, dateFrom, dateTo }),
            });
            if (!response.ok) throw new Error();
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const cd = response.headers.get('Content-Disposition') || '';
            const match = cd.match(/filename="(.+?)"/);
            a.download = match ? match[1] : `AD_Reporte_${new Date().toISOString().slice(0, 10)}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Reporte exportado correctamente");
        } catch {
            toast.error('Error al exportar. Por favor intenta de nuevo.');
        }
    };

    const formatCurrency = (v: number) => '$' + Math.round(v).toLocaleString('es-CL');

    const getPaymentBadge = (method: string) => {
        const styles: Record<string, string> = {
            'Efectivo': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'Débito': 'bg-blue-50 text-blue-700 border-blue-200',
            'Crédito': 'bg-indigo-50 text-indigo-700 border-indigo-200',
            'Transferencia': 'bg-purple-50 text-purple-700 border-purple-200',
        };
        return (
            <Badge variant="outline" className={`font-bold uppercase text-[10px] ${styles[method] || ''}`}>
                {method}
            </Badge>
        );
    };

    // ── Pagination ─────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
    const paginated = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const totalAmount = filteredData.reduce((s, i) => s + (Number(i.monto) || 0), 0);

    return (
        <div className="space-y-4 animate-in fade-in pb-6">

            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">Historial de Ventas</h1>
                    <p className="text-gray-400 font-medium text-sm">Gestiona y exporta tus registros de ventas.</p>
                </div>
                <Button
                    onClick={exportToExcel}
                    variant="outline"
                    size="sm"
                    className="h-9 font-bold border-2 border-gray-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
                    disabled={filteredData.length === 0}
                >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Excel ({filteredData.length})
                </Button>
            </div>

            {/* ── Filters ───────────────────────────────────────────────── */}
            <Card className="border-0 shadow-sm ring-1 ring-gray-200 bg-gray-50/30">
                <CardContent className="p-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Categoría</label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="h-9 bg-white border-gray-200 text-sm">
                                    <SelectValue placeholder="Tipo de Vidrio" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {GLASS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Desde</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                className="w-full h-9 px-3 bg-white border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Hasta</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                                className="w-full h-9 px-3 bg-white border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>

                        <div className="flex gap-2 h-9 items-end">
                            {(categoryFilter !== 'Todos' || dateFrom || dateTo) && (
                                <Button onClick={resetFilters} variant="ghost" size="sm"
                                    className="flex-1 h-9 font-bold text-gray-400 hover:text-red-500 text-sm">
                                    <X className="h-3.5 w-3.5 mr-1" /> Limpiar
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Table ─────────────────────────────────────────────────── */}
            <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <CardHeader className="border-b border-gray-100 py-3 px-5 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold">Listado de Ventas</CardTitle>
                            <CardDescription className="text-xs">
                                {filteredData.length} registros
                                {(categoryFilter !== 'Todos' || dateFrom || dateTo) && ' · con filtros'}
                                {' · Total: '}
                                <span className="font-bold text-gray-700">{formatCurrency(totalAmount)}</span>
                            </CardDescription>
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <CalendarIcon className="h-3 w-3" />
                            Más reciente primero
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent border-gray-100">
                                    <TableHead className="w-[160px] font-black text-gray-400 uppercase text-[10px] tracking-widest pl-5">Fecha</TableHead>
                                    <TableHead className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Tipo</TableHead>
                                    <TableHead className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Cliente</TableHead>
                                    <TableHead className="font-black text-gray-400 uppercase text-[10px] tracking-widest text-right">Monto</TableHead>
                                    <TableHead className="font-black text-gray-400 uppercase text-[10px] tracking-widest text-center">Pago</TableHead>
                                    <TableHead className="font-black text-gray-400 uppercase text-[10px] tracking-widest pr-5 text-right w-[100px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-gray-400 text-sm">
                                            Cargando registros...
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-gray-400 text-sm">
                                            No se encontraron registros.
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.map((inst) => (
                                    <TableRow key={inst.id} className="border-gray-50 hover:bg-blue-50/30 transition-colors">
                                        <TableCell className="pl-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-900 font-bold">
                                                    {format(new Date(inst.fecha), 'dd MMM yyyy', { locale: es })}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-black uppercase">
                                                    {format(new Date(inst.fecha), 'HH:mm')} hrs
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-black text-gray-900 text-sm">{inst.tipo_vidrio}</TableCell>
                                        <TableCell className="text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{inst.cliente_nombre || 'Particular'}</span>
                                                <span className="text-[10px] text-gray-400 uppercase font-medium">
                                                    {inst.posicion}
                                                    {inst.cliente_patente ? ` · Patente: ${inst.cliente_patente}` : ''}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-black text-gray-900 text-base pr-3">
                                            {formatCurrency(inst.monto)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getPaymentBadge(inst.metodo_pago)}
                                        </TableCell>
                                        <TableCell className="pr-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/ventas/editar/${inst.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    onClick={() => handleDelete(inst.id)}
                                                    variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* ── Pagination Controls ──────────────────────────── */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/30">
                            <span className="text-[11px] text-gray-400 font-medium">
                                Página <span className="font-black text-gray-700">{currentPage}</span> de <span className="font-black text-gray-700">{totalPages}</span>
                                <span className="ml-2 text-gray-300">·</span>
                                <span className="ml-2">Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredData.length)} de {filteredData.length}</span>
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline" size="sm"
                                    className="h-7 w-7 p-0 border-gray-200"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(1)}
                                >
                                    <span className="text-[10px] font-black">«</span>
                                </Button>
                                <Button
                                    variant="outline" size="sm"
                                    className="h-7 w-7 p-0 border-gray-200"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>

                                {/* Page number buttons — show max 5 around current */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                        if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, i) =>
                                        p === '...' ? (
                                            <span key={`dot-${i}`} className="text-gray-300 text-xs px-1">…</span>
                                        ) : (
                                            <Button
                                                key={p}
                                                variant={currentPage === p ? 'default' : 'outline'}
                                                size="sm"
                                                className={`h-7 w-7 p-0 text-xs font-bold ${currentPage === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200'}`}
                                                onClick={() => setCurrentPage(p as number)}
                                            >
                                                {p}
                                            </Button>
                                        )
                                    )}

                                <Button
                                    variant="outline" size="sm"
                                    className="h-7 w-7 p-0 border-gray-200"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="outline" size="sm"
                                    className="h-7 w-7 p-0 border-gray-200"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(totalPages)}
                                >
                                    <span className="text-[10px] font-black">»</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
