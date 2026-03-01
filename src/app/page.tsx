import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import {
  DollarSign,
  Users,
  ArrowRight,
  TrendingUp,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  ExternalLink
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { format, subDays, startOfDay as fstartOfDay, endOfDay as fendOfDay, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Sparkline, MainChart } from "@/components/dashboard-charts";

export const revalidate = 0;

export default async function Home() {
  const now = new Date();

  // Date Ranges
  const todayStart = fstartOfDay(now);
  const yesterdayStart = fstartOfDay(subDays(now, 1));
  const yesterdayEnd = fendOfDay(subDays(now, 1));
  const sevenDaysAgo = subDays(now, 7);
  const fourteenDaysAgo = subDays(now, 14);
  const currentMonthStart = startOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));

  // URL date strings for filters
  const todayStr = format(now, 'yyyy-MM-dd');
  const sevenDaysAgoStr = format(sevenDaysAgo, 'yyyy-MM-dd');
  const monthStartStr = format(currentMonthStart, 'yyyy-MM-dd');

  // Fetch data from the last 60 days
  const { data: allRecentData } = await supabase
    .from('glass_installations')
    .select('*')
    .gte('fecha', subMonths(now, 2).toISOString())
    .order('fecha', { ascending: true });

  const recent = allRecentData || [];

  const getRangeTotal = (data: any[], start: Date, end: Date) =>
    data.filter(i => { const d = new Date(i.fecha); return d >= start && d <= end; })
      .reduce((sum, i) => sum + Number(i.monto), 0);

  const getRangeCount = (data: any[], start: Date, end: Date) =>
    data.filter(i => { const d = new Date(i.fecha); return d >= start && d <= end; }).length;

  const dailyTotal = getRangeTotal(recent, todayStart, now);
  const yesterdayTotal = getRangeTotal(recent, yesterdayStart, yesterdayEnd);
  const weeklyTotal = getRangeTotal(recent, sevenDaysAgo, now);
  const prevWeeklyTotal = getRangeTotal(recent, fourteenDaysAgo, sevenDaysAgo);
  const monthlyTotal = getRangeTotal(recent, currentMonthStart, now);
  const prevMonthlyTotal = getRangeTotal(recent, prevMonthStart, prevMonthEnd);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const dailyGrowth = calculateGrowth(dailyTotal, yesterdayTotal);
  const weeklyGrowth = calculateGrowth(weeklyTotal, prevWeeklyTotal);
  const monthlyGrowth = calculateGrowth(monthlyTotal, prevMonthlyTotal);

  const getSparklineData = (daysCount: number) => {
    const data = [];
    for (let i = daysCount; i >= 0; i--) {
      const d = subDays(now, i);
      data.push({ value: getRangeTotal(recent, fstartOfDay(d), fendOfDay(d)) });
    }
    return data;
  };

  const mainChartData = [];
  for (let i = 13; i >= 0; i--) {
    const d = subDays(now, i);
    mainChartData.push({ name: format(d, 'dd MMM'), total: getRangeTotal(recent, fstartOfDay(d), fendOfDay(d)) });
  }

  const formatCurrency = (value: number) => '$' + Math.round(value).toLocaleString('es-CL');

  const GrowthBadge = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <div className={`flex items-center text-[9px] font-black px-1.5 py-0.5 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {isPositive ? <ArrowUpRight className="h-2 w-2 mr-0.5" /> : <ArrowDownRight className="h-2 w-2 mr-0.5" />}
        {Math.abs(value).toFixed(1)}%
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:h-full gap-2 animate-in fade-in lg:overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black tracking-tight text-gray-900 uppercase leading-none">Panel de Control</h1>
          <div className="h-4 w-px bg-gray-200" />
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Dashboard</p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 bg-white px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
          </span>
          SISTEMA ACTIVADO
        </div>
      </div>

      {/* KPI Cards */}
      <div className="flex-shrink-0 grid gap-2 md:grid-cols-3">
        {/* Today */}
        <Card className="border-0 shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <CardContent className="p-3 space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-1 bg-emerald-50 rounded text-emerald-600">
                <DollarSign className="h-3.5 w-3.5" />
              </div>
              <GrowthBadge value={dailyGrowth} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Ventas Hoy</div>
              <div className="text-xl font-black text-gray-900 tracking-tighter leading-none">{formatCurrency(dailyTotal)}</div>
            </div>
            <Sparkline data={getSparklineData(7)} color="#10b981" />
            <Link href={`/ventas?from=${todayStr}&to=${todayStr}`}>
              <Button variant="ghost" className="w-full h-6 text-[9px] font-black text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 uppercase gap-1 p-0">
                <ExternalLink className="h-2.5 w-2.5" /> Ver Hoy
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Weekly */}
        <Card className="border-0 shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <CardContent className="p-3 space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-1 bg-blue-50 rounded text-blue-600">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <GrowthBadge value={weeklyGrowth} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Últimos 7 Días</div>
              <div className="text-xl font-black text-gray-900 tracking-tighter leading-none">{formatCurrency(weeklyTotal)}</div>
            </div>
            <Sparkline data={getSparklineData(14)} color="#2563eb" />
            <Link href={`/ventas?from=${sevenDaysAgoStr}&to=${todayStr}`}>
              <Button variant="ghost" className="w-full h-6 text-[9px] font-black text-blue-600 hover:bg-blue-50 hover:text-blue-700 uppercase gap-1 p-0">
                <ExternalLink className="h-2.5 w-2.5" /> Ver Semana
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Monthly */}
        <Card className="border-0 shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <CardContent className="p-3 space-y-2">
            <div className="flex justify-between items-start">
              <div className="p-1 bg-purple-50 rounded text-purple-600">
                <CalendarIcon className="h-3.5 w-3.5" />
              </div>
              <GrowthBadge value={monthlyGrowth} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Ventas del Mes</div>
              <div className="text-xl font-black text-gray-900 tracking-tighter leading-none">{formatCurrency(monthlyTotal)}</div>
            </div>
            <Sparkline data={getSparklineData(30)} color="#9333ea" />
            <Link href={`/ventas?from=${monthStartStr}&to=${todayStr}`}>
              <Button variant="ghost" className="w-full h-6 text-[9px] font-black text-purple-600 hover:bg-purple-50 hover:text-purple-700 uppercase gap-1 p-0">
                <ExternalLink className="h-2.5 w-2.5" /> Ver Mes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Bottom grid */}
      <div className="flex-1 min-h-0 grid gap-2 lg:grid-cols-3">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm ring-1 ring-gray-100 flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="flex-shrink-0 p-2 px-4 border-b border-gray-50 bg-gray-50/20 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black text-gray-800 uppercase tracking-tight">Ingresos — Últimos 14 días</CardTitle>
            <Badge variant="outline" className="bg-white font-black text-[7px] uppercase h-4 px-1.5 leading-none">AUTO</Badge>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-2 flex flex-col">
            <div className="flex-1 min-h-0">
              <MainChart data={mainChartData} />
            </div>
            <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-gray-50 px-1">
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase leading-none block">Efectivo Hoy</span>
                <div className="text-xs font-black text-gray-800">
                  {formatCurrency(recent.filter(i => new Date(i.fecha) >= todayStart && i.metodo_pago === 'Efectivo').reduce((s, i) => s + Number(i.monto), 0))}
                </div>
              </div>
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase leading-none block">Tarjeta Hoy</span>
                <div className="text-xs font-black text-gray-800">
                  {formatCurrency(recent.filter(i => new Date(i.fecha) >= todayStart && i.metodo_pago === 'Tarjeta').reduce((s, i) => s + Number(i.monto), 0))}
                </div>
              </div>
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase leading-none block">Unidades / Mes</span>
                <div className="text-xs font-black text-gray-800">{getRangeCount(recent, currentMonthStart, now)} u.</div>
              </div>
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase leading-none block">Trabajos / Día</span>
                <div className="text-xs font-black text-gray-800">{getRangeCount(recent, todayStart, now)} t.</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="flex flex-col gap-2 min-h-0">
          <Card className="flex-[3] border-0 shadow-sm ring-1 ring-gray-100 bg-blue-600 text-white overflow-hidden relative">
            <div className="absolute right-0 top-0 p-3 opacity-10">
              <ArrowRight className="h-8 w-8" />
            </div>
            <CardContent className="h-full p-3 px-4 flex flex-col justify-center space-y-2 relative z-10">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight leading-none mb-0.5">Nueva Venta</h3>
                <p className="text-blue-200 text-[9px] font-medium uppercase leading-none">Registro Rápido</p>
              </div>
              <Link href="/ventas/nueva" className="block w-full">
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-black h-7 text-[10px] uppercase">
                  EMPEZAR
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="flex-1 border-0 shadow-sm ring-1 ring-gray-100 flex flex-col min-h-0 overflow-hidden">
            <CardContent className="p-2 px-3 flex-1 flex flex-col justify-center space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="h-2.5 w-2.5 text-blue-500" />
                  <span className="text-[9px] font-black text-gray-600 uppercase">Clientes</span>
                </div>
                <span className="text-[9px] font-black text-emerald-600">ACTIVO</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Package className="h-2.5 w-2.5 text-gray-300" />
                  <span className="text-[9px] font-black text-gray-400 uppercase">Stock</span>
                </div>
                <span className="text-[9px] font-black text-gray-400">DEV</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
