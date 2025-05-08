
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatNumber } from '@/utils/format';

interface SpeedometerGaugeProps {
  value: number;
  min: number;
  max: number;
  label?: string;
  threshold?: [number, number]; // [warning, critical]
  size?: number;
}

export default function SpeedometerGauge({
  value,
  min,
  max,
  label = '',
  threshold = [50, 75], // default thresholds at 50% and 75% of max
  size = 200
}: SpeedometerGaugeProps) {
  // Normalize value between min and max
  const normalizedValue = Math.min(Math.max(value, min), max);
  
  // Calculate angles for the gauge (in a semicircle)
  const startAngle = 180;
  const endAngle = 0;
  const valueAngle = startAngle - ((normalizedValue - min) / (max - min)) * (startAngle - endAngle);
  
  // Colors based on thresholds
  let color = '#10B981'; // Green - good
  if (normalizedValue >= threshold[1]) {
    color = '#EF4444'; // Red - bad
  } else if (normalizedValue >= threshold[0]) {
    color = '#F59E0B'; // Amber - warning
  }
  
  // Create data for the gauge segments
  const data = [
    { name: 'value', value: normalizedValue - min },
    { name: 'empty', value: max - normalizedValue }
  ];
  
  // Background segments data for the gauge
  const backgroundData = [
    { name: 'good', value: threshold[0] - min },
    { name: 'warning', value: threshold[1] - threshold[0] },
    { name: 'critical', value: max - threshold[1] }
  ];
  
  // Colors for background segments
  const backgroundColors = ['#10B981', '#F59E0B', '#FEE2E2'];
  
  return (
    <div style={{ width: size, height: size/2 + 30, position: 'relative' }}>
      <ResponsiveContainer>
        <PieChart>
          {/* Background segments */}
          <Pie
            data={backgroundData}
            cx="50%"
            cy="100%"
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={size * 0.25}
            outerRadius={size * 0.4}
            paddingAngle={0}
            dataKey="value"
            blendStroke
          >
            {backgroundData.map((entry, index) => (
              <Cell key={`cell-background-${index}`} fill={backgroundColors[index]} opacity={0.2} stroke="none" />
            ))}
          </Pie>
          
          {/* Needle */}
          <Pie
            data={[{ value: 1 }]}
            cx="50%"
            cy="100%"
            startAngle={valueAngle - 1}
            endAngle={valueAngle + 1}
            innerRadius={0}
            outerRadius={size * 0.42}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
          </Pie>
          
          {/* Center point */}
          <Pie
            data={[{ value: 1 }]}
            cx="50%"
            cy="100%"
            startAngle={0}
            endAngle={360}
            innerRadius={0}
            outerRadius={size * 0.08}
            dataKey="value"
          >
            <Cell fill="#94a3b8" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Value display */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[10%] text-center"
      >
        <div className="text-2xl font-bold">{formatNumber(normalizedValue)}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      
      {/* Min and max labels */}
      <div className="absolute bottom-0 left-0 text-xs text-muted-foreground">
        {formatNumber(min)}
      </div>
      <div className="absolute bottom-0 right-0 text-xs text-muted-foreground">
        {formatNumber(max)}
      </div>
    </div>
  );
}
