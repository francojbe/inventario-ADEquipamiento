"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/lib/supabase';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Filter, Download, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import * as XLSX from 'xlsx';  // kept for legacy; main export uses API


const GLASS_TYPES = ['Todos', 'Parabrisas', 'Luneta', 'Vidrio Puerta', 'Lateral', 'Aleta'];

export default function InstallationsHistory() {
    const searchParams = useSearchParams();
    const [installations, setInstallations] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters - initialize from URL query params if present
    const [categoryFilter, setCategoryFilter] = useState('Todos');
    const [dateFrom, setDateFrom] = useState(() => searchParams.get('from') || '');
    const [dateTo, setDateTo] = useState(() => searchParams.get('to') || '');

    useEffect(() => {
        fetchInstallations();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [categoryFilter, dateFrom, dateTo, installations]);

    const fetchInstallations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('glass_installations')
            .select('*')
            .order('fecha', { ascending: false });

        if (data) {
            setInstallations(data);
            setFilteredData(data);
        }
        setLoading(false);
    };

    const applyFilters = () => {
        let result = [...installations];

        if (categoryFilter !== 'Todos') {
            result = result.filter(item => item.tipo_vidrio === categoryFilter);
        }

        if (dateFrom || dateTo) {
            result = result.filter(item => {
                const itemDate = parseISO(item.fecha);
                const start = dateFrom ? startOfDay(parseISO(dateFrom)) : new Date(0);
                const end = dateTo ? endOfDay(parseISO(dateTo)) : new Date(8640000000000000);
                return isWithinInterval(itemDate, { start, end });
            });
        }

        setFilteredData(result);
    };

    const resetFilters = () => {
        setCategoryFilter('Todos');
        setDateFrom('');
        setDateTo('');
    };

    const exportToExcel = async () => {
        try {
            const response = await fetch('/api/export-excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: filteredData,
                    dateFrom,
                    dateTo,
                }),
            });

            if (!response.ok) throw new Error('Error generando el reporte');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const cd = response.headers.get('Content-Disposition') || '';
            const match = cd.match(/filename="(.+?)"/);
            a.download = match ? match[1] : `AD_Reporte_${new Date().toISOString().slice(0, 10)}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Error al exportar. Por favor intenta de nuevo.');
        }
    };


    const formatCurrency = (value: number) => {
        return '$' + Math.round(value).toLocaleString('es-CL');
    };

    const getPaymentBadge = (method: string) => {
        switch (method) {
            case 'Efectivo':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold uppercase text-[10px]">Efectivo</Badge>;
            case 'Tarjeta':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold uppercase text-[10px]">Tarjeta</Badge>;
            case 'Transferencia':
                return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-bold uppercase text-[10px]">Transferencia</Badge>;
            default:
                return <Badge variant="outline" className="font-bold uppercase text-[10px]">{method}</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Historial de Ventas</h1>
                    <p className="text-gray-500 font-medium">Gestiona y exporta tus registros de instalaciones.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={exportToExcel}
                        variant="outline"
                        size="sm"
                        className="h-10 font-bold border-2 border-gray-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
                        disabled={filteredData.length === 0}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Excel
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="border-0 shadow-sm ring-1 ring-gray-200 bg-gray-50/30">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Categoría</label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="h-10 bg-white border-gray-200">
                                    <SelectValue placeholder="Tipo de Vidrio" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {GLASS_TYPES.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Desde</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Hasta</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex gap-2 h-10">
                            {(categoryFilter !== 'Todos' || dateFrom || dateTo) && (
                                <Button
                                    onClick={resetFilters}
                                    variant="ghost"
                                    className="flex-1 font-bold text-gray-400 hover:text-red-500"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Limpiar
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <CardHeader className="border-b border-gray-100 p-6 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold">Listado de Ventas</CardTitle>
                            <CardDescription className="text-sm">
                                {filteredData.length} registros encontrados
                                {(categoryFilter !== 'Todos' || dateFrom || dateTo) && " (con filtros aplicados)"}
                            </CardDescription>
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <CalendarIcon className="h-3 w-3" />
                            Vista General
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent border-gray-100">
                                    <TableHead className="w-[180px] font-black text-gray-400 uppercase text-[10px] tracking-widest pl-6">Fecha y Hora</TableHead>
                                    <TableHead className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Tipo de Vidrio</TableHead>
                                    <TableHead className="font-black text-gray-400 uppercase text-[10px] tracking-widest text-left">Cliente</TableHead>
                                    <TableHead className="font-black text-gray-400 uppercase text-[10px] tracking-widest text-right">Monto</TableHead>
                                    <TableHead className="font-black text-gray-400 uppercase text-[10px] tracking-widest pr-6 text-center">Pago</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-gray-400">
                                            Cargando registros...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredData.map((inst) => (
                                    <TableRow key={inst.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="pl-6 font-medium text-gray-500">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-900 font-bold">
                                                    {format(new Date(inst.fecha), 'dd MMM, yyyy', { locale: es })}
                                                </span>
                                                <span className="text-[10px] text-gray-400 uppercase font-black">
                                                    {format(new Date(inst.fecha), 'HH:mm', { locale: es })} hrs
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-black text-gray-900 text-sm">{inst.tipo_vidrio}</TableCell>
                                        <TableCell className="text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{inst.cliente_nombre || 'Particular'}</span>
                                                <span className="text-[10px] text-gray-400 uppercase font-medium">{inst.cliente_rut || 'Sin RUT'} • {inst.posicion}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-black text-gray-900 text-base">{formatCurrency(inst.monto)}</TableCell>
                                        <TableCell className="pr-6 text-center">{getPaymentBadge(inst.metodo_pago)}</TableCell>
                                    </TableRow>
                                ))}
                                {!loading && filteredData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-gray-400 font-medium">
                                            No se encontraron registros para los filtros seleccionados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
