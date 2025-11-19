"use client";

import React, { useMemo, useState } from 'react';
import { Container, Box, Select, MenuItem, Checkbox, ListItemText, TextField, Button } from '@mui/material';
import sampleRows from '../data/sampleRows';

type Row = {
    id: number;
    name: string;
    date: string;
    place: string;
    serviceType: string;
    income: number | null;
    cost: number | null;
    hours: number | null;
    status: string;
    notes: string;
    confirms: string[];
};

function BarChart({ data, height = 220 }: { data: { label: string; value: number }[]; height?: number }) {
    const max = Math.max(...data.map((d) => d.value), 1);
    const gap = 8;
    const count = data.length || 1;
    const barWidth = Math.max(24, Math.floor((100 / count) - gap));

    return (
        <svg width="100%" height={height} style={{ background: '#fff' }}>
            {data.map((d, i) => {
                const x = (i * (100 / count)) + 5;
                const h = (d.value / max) * (height - 30);
                const y = height - h - 20;
                return (
                    <g key={d.label}>
                        <rect x={`${x}%`} y={y} width={`${barWidth}%`} height={h} fill="#1976d2" />
                        <text x={`${x + 1}%`} y={height - 6} fontSize={10} fill="#111">{d.label}</text>
                    </g>
                );
            })}
        </svg>
    );
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

function PieChart({ data, size = 260 }: { data: { label: string; value: number }[]; size?: number }) {
    const total = data.reduce((s, d) => s + Math.max(0, d.value), 0) || 1;
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0288d1', '#ffb300'];

    // Precompute segments with start/end angles so we don't mutate during render
    const segments = data.map((d, i) => {
        const value = Math.max(0, d.value);
        const angle = (value / total) * 360;
        const start = data.slice(0, i).reduce((sum, dd) => sum + (Math.max(0, dd.value) / total) * 360, 0);
        const end = start + angle;
        return {
            label: d.label,
            value,
            start,
            end,
            color: colors[i % colors.length],
        };
    });

    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g transform={`translate(${size / 2}, ${size / 2})`}>
                    {segments.map((s) => {
                        const path = describeArc(0, 0, size / 2 - 10, s.start, s.end);
                        return <path key={s.label} d={path} fill="none" stroke={s.color} strokeWidth={size / 2} strokeLinecap="butt" />;
                    })}
                </g>
            </svg>

            <Box>
                {segments.map((s) => {
                    const pct = ((s.value / total) * 100).toFixed(1);
                    return (
                        <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Box sx={{ width: 12, height: 12, background: s.color, borderRadius: 1 }} />
                            <Box sx={{ fontSize: 13 }}>{s.label}</Box>
                            <Box sx={{ ml: 1, color: '#666', fontSize: 13 }}>{pct}%</Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

export default function AnalyticsPage() {
    const rows: Row[] = sampleRows as unknown as Row[];
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const serviceOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.serviceType))), [rows]);

    const filtered = useMemo(() => {
        return rows.filter((r) => {
            if (selectedServices.length && !selectedServices.includes(r.serviceType)) return false;
            if (fromDate && r.date < fromDate) return false;
            if (toDate && r.date > toDate) return false;
            return true;
        });
    }, [rows, selectedServices, fromDate, toDate]);

    const revenueByDate = useMemo(() => {
        const map = new Map<string, number>();
        filtered.forEach((r) => {
            const v = Number(r.income ?? 0);
            map.set(r.date, (map.get(r.date) ?? 0) + v);
        });
        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([label, value]) => ({ label, value }));
    }, [filtered]);

    const profitByService = useMemo(() => {
        const map = new Map<string, number>();
        filtered.forEach((r) => {
            const profit = Number((r.income ?? 0) - (r.cost ?? 0));
            map.set(r.serviceType, (map.get(r.serviceType) ?? 0) + profit);
        });
        return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    }, [filtered]);

    const moneyByName = useMemo(() => {
        const map = new Map<string, number>();
        filtered.forEach((r) => {
            const v = Number(r.income ?? 0);
            map.set(r.name, (map.get(r.name) ?? 0) + v);
        });
        return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    }, [filtered]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" gap={2} alignItems="center" mb={3}>
                <Box sx={{ fontSize: 20, fontWeight: 600 }}>Analytics</Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Select
                        multiple
                        value={selectedServices}
                        onChange={(e) => setSelectedServices(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]))}
                        size="small"
                        sx={{ minWidth: 200 }}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                    >
                        {serviceOptions.map((s) => (
                            <MenuItem key={s} value={s}>
                                <Checkbox checked={selectedServices.includes(s)} />
                                <ListItemText primary={s} />
                            </MenuItem>
                        ))}
                    </Select>

                    <TextField type="date" size="small" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    <TextField type="date" size="small" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    <Button variant="outlined" size="small" onClick={() => { setSelectedServices([]); setFromDate(''); setToDate(''); }}>Reset</Button>
                </Box>
            </Box>

            <Box mb={4}>
                <Box mb={1} sx={{ fontWeight: 600 }}>Revenue by date</Box>
                <Box sx={{ border: '1px solid #eee', p: 2 }}>
                    <BarChart data={revenueByDate} />
                </Box>
            </Box>

            <Box>
                <Box mb={1} sx={{ fontWeight: 600 }}>Profit by service type</Box>
                <Box sx={{ border: '1px solid #eee', p: 2 }}>
                    <BarChart data={profitByService} />
                </Box>
            </Box>

            <Box mt={4}>
                <Box mb={1} sx={{ fontWeight: 600 }}>Income distribution by name</Box>
                <Box sx={{ border: '1px solid #eee', p: 2 }}>
                    <PieChart data={moneyByName} />
                </Box>
            </Box>
        </Container>
    );
}
