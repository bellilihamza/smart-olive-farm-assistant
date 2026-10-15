"use client";

import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const data = [
  { day: "Mon", risk: 0.3 },
  { day: "Tue", risk: 0.4 },
  { day: "Wed", risk: 0.6 },
  { day: "Thu", risk: 0.8 },
  { day: "Fri", risk: 0.75 },
  { day: "Sat", risk: 0.5 },
  { day: "Sun", risk: 0.4 },
];

export function RiskForecast() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
          />
          <YAxis 
            domain={[0, 1]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <ReferenceLine y={0.7} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'High Risk Threshold', fill: '#ef4444', fontSize: 10 }} />
          <Bar 
            dataKey="risk" 
            radius={[4, 4, 0, 0]}
          >
            {
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.risk >= 0.7 ? '#ef4444' : entry.risk >= 0.4 ? '#f59e0b' : '#3b82f6'} />
              ))
            }
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
