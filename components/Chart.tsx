'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import React from 'react';

interface ChartProps {
  robotType: string
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

export default function Chart({ robotType,data }: ChartProps) {
  //nsole.log("Chart.tsx - data:", data);
  if (!data) {
    return (
      <div className="flex justify-center items-center h-[400px] text-gray-500">
        L'histogramme ne peut être généré car aucune donnée disponible pour ce programme
      </div>
    );
  }

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  
  const chartData = Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString().padStart(2, '0');
    const dateKey = `${day}/${month.toString().padStart(2, '0')}/${year}`;
    let value = 0;
    //console.log("Chart.tsx",data[dateKey]);
    if (data && data[dateKey]) {
      value = Number(data[dateKey]);
      console.log("value",value);
    } else {
      console.log('data[dateKey] is undefined');
    }

    return {
      date: dateKey,
      valeur: value
    };
  });

  if (chartData.every(item => item.valeur === 0)) {
    return (
      <div className="flex justify-center items-center h-[400px] text-gray-500">
        L'histogramme ne peut être généré car aucune donnée disponible pour ce programme
      </div>
    );
  }

  return (
    <>
    <div className="w-full flex justify-center items-center  bg-x-100">
      <div className="w-full p-4 bg-white rounded-lg shadow mr-4 h-[450px]">
        <div className="h-[300px] relative ">
          <div className="ml-[10%] text-left text-xl font-bold mb-4">
            {robotType?.toLowerCase() === 'temps' ? 'Gain de temps' : 'Sécurisation des processus'}
          </div>
          <div className="absolute top-2 right-2 text-black px-2 py-1 ">
            {robotType?.toLowerCase() === "temps" ? (
              "Échelle de temps en minutes"
            ) : (
              "Nombre d'execution"
            )}
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              width={600}
              height={600}
              barSize={40}
              barGap={15}
              title=""
              margin={{ top: 20, right: 10, left: 5, bottom: 1 }}
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
                tickFormatter={(t) => `${t}`} />
              <YAxis
                stroke="#888888"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${value}`}
                fontSize={10} />
              <Tooltip
                labelFormatter={(label: string) => label}
                formatter={(value: any, name: string, props: any) => {
                  const { valeur } = props.payload;
                  if ((valeur === undefined || valeur === 0)) {
                    return [''];
                  }
                  if (robotType?.toLowerCase() === "temps") {
                    return [`Gain : ${valeur} min`];
                  }
                  return  valeur > 1 ? [`Gain : ${valeur} éxecutions`] : [`Gain : ${valeur} éxecution`];
                } } />
              <Bar
                dataKey="valeur"
                //swith color for temps or execution
                fill={robotType?.toLowerCase() === "temps" ? "#3498db" : "#EA580C"}
                radius={[4, 4, 0, 0]}
                name="Quantité"
                label={{
                  position: 'top',
                  fill: '#000',
                  fontSize: 12,
                  formatter: (value: number) => value === 0 ? '' : `${value}`
                }}
                //activeBar={{ fill: '#3333db' }}
                activeBar={{ fill: robotType?.toLowerCase() === "temps" ? '#3333db' : '#c24a0a' }}
                />
            </BarChart>
          </ResponsiveContainer>

        </div>
        <div className="flex justify-around mt-10">
            <div className="w-1/4 mr-5 ml-5 ">
            <div className={robotType?.toLowerCase() === 'temps' ? ('bg-[#3498db] hover:bg-[#3333db] text-white shadow-md rounded-lg py-2' ) : ( 'bg-[#EA580C] hover:bg-[#c24a0a] text-white shadow-md rounded-lg py-2')}>
                <div className="ml-4 text-xs ">Total du mois</div>
                <div className="ml-4 text-xl ">
                {data['NB UNITES DEPUIS DEBUT DU MOIS'] ? ( data['NB UNITES DEPUIS DEBUT DU MOIS'] ) : ('N/A') }
                </div>
              </div>
            </div>
            <div className=" w-1/4 mr-5 ml-5">
              <div className={robotType?.toLowerCase() === 'temps' ? ('bg-[#3498db] hover:bg-[#3333db] text-white shadow-md rounded-lg py-2' ) : ( 'bg-[#EA580C] hover:bg-[#c24a0a] text-white shadow-md rounded-lg py-2')}>
                <div className="ml-4 text-xs ">M-1</div>
                <div className="ml-4 text-xl ">{data['NB UNITES MOIS N-1'] ? ( data['NB UNITES MOIS N-1'] ) : ('N/A') }</div>
              </div>
            </div>
            <div className=" w-1/4 mr-5 ml-5">
            <div className={robotType?.toLowerCase() === 'temps' ? ('bg-[#3498db] hover:bg-[#3333db] text-white shadow-md rounded-lg py-2' ) : ( 'bg-[#EA580C] hover:bg-[#c24a0a] text-white shadow-md rounded-lg py-2')}>
                <div className="ml-4 text-xs ">M-2</div>
                <div className="ml-4 text-xl">{data['NB UNITES MOIS N-2'] ? ( data['NB UNITES MOIS N-2'] ) : ('N/A') }</div>
              </div>
            </div>
            <div className="w-1/4 mr-5 ml-5">
              <div className={robotType?.toLowerCase() === 'temps' ? ('bg-[#3498db] hover:bg-[#3333db] text-white shadow-md rounded-lg py-2' ) : ( 'bg-[#EA580C] hover:bg-[#c24a0a] text-white shadow-md rounded-lg py-2')}>
                <div className="ml-4 text-xs ">M-3</div>
                <div className="ml-4 text-xl ">{data['NB UNITES MOIS N-3'] ? ( data['NB UNITES MOIS N-3'] ) : ('N/A') }</div>
              </div>
            </div>
        </div>
      </div>
    </div>
    </>
  );
}
