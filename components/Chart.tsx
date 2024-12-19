'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import React from 'react';

interface ChartProps {
  data: any
}

interface CustomizedAxisTickProps {
  x: number;
  y: number;
  payload: {
    value: string;
  };
}

const CustomizedAxisTick: React.FC<CustomizedAxisTickProps> = (props) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={16} 
        textAnchor="end" 
        fill="#666" 
        transform="rotate(-35)" 
        fontSize={10}
      >
        {payload.value}
      </text>
    </g>
  );
}

export default function Chart({ data }: ChartProps) {
  if (!data) {
    return (
      <div className="flex justify-center items-center h-[400px] text-gray-500">
        L'histogramme ne peut être généré car aucune donnée disponible pour ce programme
      </div>
    );
  }

  // Créer les données pour le graphique pour tous les jours du mois
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  
  const chartData = Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString().padStart(2, '0');
    const dateKey = `${day}/${month.toString().padStart(2, '0')}/${year}`;
    let value = 0;
    
    if (data[dateKey] && data[dateKey] !== '') {
      value = parseInt(data[dateKey]);
      if (isNaN(value)) value = 0;
    }
    
    return {
      date: dateKey,
      valeur: value
    };
  });

  // Ne pas filtrer les jours sans données
  if (chartData.every(item => item.valeur === 0)) {
    return (
      <div className="flex justify-center items-center h-[400px] text-gray-500">
        L'histogramme ne peut être généré car aucune donnée disponible pour ce programme
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              dataKey="date"
              stroke="#888888"
              tickLine={false}
              axisLine={false}
              tick={<CustomizedAxisTick x={0} y={0} payload={{
                value: ""
              }} />}
              height={60}
            />
            <YAxis
              stroke="#888888"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              labelFormatter={(label) => label}
              formatter={(value) => [value]}
            />
            <Bar 
              dataKey="valeur" 
              fill="#3498db" 
              radius={[4, 4, 0, 0]} 
              name="Quantité"
              label={{ position: 'top', fill: '#000', fontSize: 12 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center bg-blue-500 mt-1 text-white shadow-md rounded-lg py-1 mx-auto max-w-xs" style={{marginTop: 10}}>
        {data['NB UNITES DEPUIS DEBUT DU MOIS']} unités depuis le début du mois
      </div>
    </div>
  );
}
