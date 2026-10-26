import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from 'recharts';

const POLICY_COLORS = [
  { stroke: '#0284c7', fill: '#0284c7' }, // Sky Blue
  { stroke: '#0ea5e9', fill: '#0ea5e9' }, // Cyan Blue
  { stroke: '#3b82f6', fill: '#3b82f6' }, // Royal Blue
  { stroke: '#6366f1', fill: '#6366f1' }  // Indigo
];

export default function RadarChartComponent({ radarData = [], policies = [] }) {
  if (!radarData || radarData.length === 0 || !policies || policies.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        Select at least 2 policies to view multi-dimensional radar comparison.
      </div>
    );
  }

  return (
    <div className="w-full h-80 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="dimension" 
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: '#94a3b8', fontSize: 10 }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              borderColor: '#e2e8f0', 
              borderRadius: '12px', 
              color: '#0f172a',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
              fontSize: '12px' 
            }} 
          />
          <Legend 
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
          {policies.map((p, idx) => {
            const color = POLICY_COLORS[idx % POLICY_COLORS.length];
            return (
              <Radar
                key={p.id}
                name={p.policy_name}
                dataKey={p.policy_name}
                stroke={color.stroke}
                fill={color.fill}
                fillOpacity={0.25}
                strokeWidth={2}
              />
            );
          })}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
