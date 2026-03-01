"use client";

import {
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell,
    CartesianGrid,
} from 'recharts';

interface SparklineProps {
    data: { value: number }[];
    color: string;
}

export function Sparkline({ data, color }: SparklineProps) {
    return (
        <div className="h-10 w-full min-w-[100px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#gradient-${color.replace('#', '')})`}
                        dot={false}
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

interface MainChartProps {
    data: { name: string; total: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: '#1e293b',
                borderRadius: '8px',
                padding: '6px 10px',
                color: '#f8fafc',
                fontSize: '10px',
                fontWeight: 900,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}>
                <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div>${Math.round(payload[0].value).toLocaleString('es-CL')}</div>
            </div>
        );
    }
    return null;
};

export function MainChart({ data }: MainChartProps) {
    const maxVal = Math.max(...data.map(d => d.total));

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="25%">
                    <CartesianGrid
                        vertical={false}
                        stroke="#f1f5f9"
                        strokeDasharray="3 0"
                    />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 700 }}
                        dy={4}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 700 }}
                        tickFormatter={(v) => v === 0 ? '0' : `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(241, 245, 249, 0.7)', radius: 4 }}
                    />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]} animationDuration={1200}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.total === maxVal ? '#2563eb' : '#bfdbfe'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
