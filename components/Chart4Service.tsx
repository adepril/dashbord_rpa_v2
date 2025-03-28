'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"
import React from 'react';
import { formatDuration } from '../lib/utils'

interface Chart4ServiceProps {
  service: string
  data: any
  [key: string]: any // Ajout de la signature d'index
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

export default function Chart4Service({ service, data1 = {
  'NB UNITES DEPUIS DEBUT DU MOIS': 0,
  'NB UNITES MOIS N-1': 0,
  'NB UNITES MOIS N-2': 0,
  'NB UNITES MOIS N-3': 0
} }: Chart4ServiceProps) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const chartData = Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString().padStart(2, '0');
    const dateKey = `${day}/${month.toString().padStart(2, '0')}/${year}`;
    let value = 0;
    if (data1 && data1[dateKey]) {
      value = Number(data1[dateKey]);
    }
    return {
      date: dateKey,
      valeur: value
    };
  });

  if (chartData.every(item => item.valeur === 0)) {
    return (
      <div className="flex justify-center items-center h-[400px] text-gray-500">
        Aucune donnée disponible pour ce service
      </div>
    );
  }

  return (
    <div className="w-full pt-4 pb-12 bg-white rounded-lg shadow ml-2">
      <div className="h-[300px] relative">
        <div className="ml-[10%] text-left text-xl font-bold mb-4">Gain de temps - Service {service}</div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            width={600}
            height={600}
            barSize={40}
            barGap={15}
            margin={{ top: 20, right: 10, left: 5, bottom: 1 }}
          >
            <XAxis
              dataKey="date"
              stroke="#888888"
              tickLine={false}
              axisLine={false}
              tick={<CustomizedAxisTick x={0} y={0} payload={{ value: "" }} />}
              height={60}
            />
            <ReferenceLine y={0} stroke="#888888" strokeWidth={1} />
            <YAxis
              stroke="#888888"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => formatDuration(value)}
              fontSize={10}
            />
            <Tooltip
              labelFormatter={(label: string) => label}
              formatter={(value: any) => {
                return [`Gain : ${formatDuration(value)}`];
              }}
            />
            <Bar
              dataKey="valeur"
              fill="#3498db"
              radius={[4, 4, 0, 0]}
              name="Quantité"
              label={{
                position: 'top',
                fill: '#000',
                fontSize: 12,
                formatter: (value: number) => value === 0 ? '' : formatDuration(value)
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-around mt-10">
        <div className="w-1/4 mr-5 ml-5 ">
          <div className='bg-[#3498db] hover:bg-[#3333db] text-white shadow-md rounded-lg py-2'>
            <div className="ml-4 text-xs ">Total du mois</div>
            <div className="ml-4 text-xl " title={data1['NB UNITES DEPUIS DEBUT DU MOIS'] ? data1['NB UNITES DEPUIS DEBUT DU MOIS'] +' minutes' : 'N/A'}>
              {data1 && data1['NB UNITES DEPUIS DEBUT DU MOIS'] !== undefined ? formatDuration(data1['NB UNITES DEPUIS DEBUT DU MOIS']) : '0'}
            </div>
          </div>
        </div>
        <div className=" w-1/4 mr-5 ml-5">
          <div className='bg-[#3498db] hover:bg-[#3333db] text-white shadow-md rounded-lg py-2'>
            <div className="ml-4 text-xs ">M-1</div>
            <div className="ml-4 text-xl" title={data1['NB UNITES MOIS N-1'] ? data1['NB UNITES MOIS N-1'] +' minutes' : 'N/A'}>{data1 && data1['NB UNITES MOIS N-1'] !== undefined ? formatDuration(data1['NB UNITES MOIS N-1']) : '0'}</div>
          </div>
        </div>
        <div className=" w-1/4 mr-5 ml-5">
          <div className='bg-[#3498db] hover:bg-[#3333db] text-white shadow-md rounded-lg py-2'>
            <div className="ml-4 text-xs">M-2</div>
            <div className="ml-4 text-xl" title={data1['NB UNITES MOIS N-2'] ? data1['NB UNITES MOIS N-2'] +' minutes' : 'N/A'}>{data1 && data1['NB UNITES MOIS N-2'] !== undefined ? formatDuration(data1['NB UNITES MOIS N-2']) : '0'}</div>
          </div>
        </div>
        <div className="w-1/4 mr-5 ml-5">
          <div className='bg-[#3498db] hover:bg-[#3333db] text-white shadow-md rounded-lg py-2'>
            <div className="ml-4 text-xs ">M-3</div>
            <div className="ml-4 text-xl" title={data1['NB UNITES MOIS N-3'] ? data1['NB UNITES MOIS N-3'] +' minutes' : 'N/A'}>{data1 && data1['NB UNITES MOIS N-3'] !== undefined ? formatDuration(data1['NB UNITES MOIS N-3']) : '0'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
