"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DailyDataPoint {
  date: string;
  orders: number;
  revenue: number;
}

export function RevenueChart({ data }: { data: DailyDataPoint[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#14141420" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#14141480' }} 
            interval="preserveStartEnd"
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#14141480' }} 
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            formatter={(value: any) => [`Rs ${Number(value || 0).toLocaleString()}`, 'Revenue']}
            contentStyle={{ 
              backgroundColor: '#FAF7F0', 
              border: '1px solid #141414',
              borderRadius: 0,
              fontSize: 12,
            }}
          />
          <Bar dataKey="revenue" fill="#141414" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersChart({ data }: { data: DailyDataPoint[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#14141420" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#14141480' }} 
            interval="preserveStartEnd"
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#14141480' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip 
            formatter={(value: any) => [Number(value || 0), 'Orders']}
            contentStyle={{ 
              backgroundColor: '#FAF7F0', 
              border: '1px solid #141414',
              borderRadius: 0,
              fontSize: 12,
            }}
          />
          <Bar dataKey="orders" fill="#D61C22" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
