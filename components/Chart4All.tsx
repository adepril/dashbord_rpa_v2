'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"
import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatDuration } from '../lib/utils'
import { fetchDataReportingByRobot } from '../utils/dataFetcher'
import { Program, cachedAllRobots } from '../utils/dataStore';

interface ChartProps {
  robotType: string
  data1: any, data2: any
  selectedAgency: string
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

export default function Chart({ robotType, data1, data2 , selectedAgency}: ChartProps) {
  
  // console.log("Chart4All.tsx - data1:", data1, " data2:", data2);
  // console.log("Chart4All.tsx - robotType:", selectedAgency);
  // console.log("Chart4All.tsx - robotType:", cachedAllRobots);

  interface ReportingData {
    'NB UNITES DEPUIS DEBUT DU MOIS': string;
    'NB UNITES MOIS N-1': string;
  }

  const [robots, setRobots] = useState<Program[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
 // const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (cachedAllRobots.length > 0 && !isPaused) {
      setRobots(cachedAllRobots);
      const interval = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % robots.length);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [robots, isPaused]);

  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
  };

  if (!data1 || !data1['NB UNITES DEPUIS DEBUT DU MOIS']) {
    return (
      <div className="flex justify-center items-center h-[400px] text-gray-500">
        Aucune donnée de reporting disponible pour ce programme
      </div>
    );
  }

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Chart 1
  const chartData1 = Array.from({ length: 31 }, (_, i) => {
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
  }); // Chart 1

  if (chartData1.every(item => item.valeur === 0)) {
    return (
      <div className="flex justify-center items-center h-[400px] text-gray-500">
        L'histogramme ne peut être généré car aucune donnée disponible pour ce programme
      </div>
    );
  }

  return (
    <>
    <div className="w-full flex justify- gap-4 items-center ">

        <div className="w-2/3 pt-4 pb-12 bg-white rounded-lg shadow ml-2">

          <div className="h-[300px] relative">
          <div className="ml-[10%] text-left text-xl font-bold mb-4">Gain de temps</div>

            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData1}
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
                <ReferenceLine
                  y={0}
                  stroke="#888888"
                  strokeWidth={1} />
                <YAxis
                  stroke="#888888"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => formatDuration(value)}
                  fontSize={10} />
                <Tooltip
                  labelFormatter={(label: string) => label}
                  formatter={(value: any, name: string, props: any) => {
                    const valeur  = props.payload;
                    if ((valeur === undefined || valeur === 0) ) {
                      return [''];
                    }
                    const gain = `Gain : ${formatDuration(valeur.valeur)}`;
                    return [gain];
                  } } />
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
                  activeBar={{ fill: robotType?.toLowerCase() === "temps" ? '#3498db' : '#3333db' }}
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

        <div className="w-1/3 p-4 pb-12 bg-white rounded-lg shadow ml-2">
            <div className="h-[380px] relative">
              <div className="flex flex-col justify-center items-center mt-5 bg-x-100">
                <span className="text-red-700 text-3xl font-bold">Le saviez-vous ?</span>
              </div>
              <div className="h-[10px] bg-x-200"></div>
              <div className="mt-4 text-red-500">{error}</div>
                {robots.length > 0 ? (
                  <>
                    <div className="mt-4 px-4 pt-10" >
                      Robot : <span className="font-bold">"{robots[currentIndex]?.robot}"</span>
                    </div>
                    <div className="mt-4 px-4 r">
                      {robots[currentIndex]?.description_long}
                    </div>
                    <div className="h-[10px] bg-x-200"></div>
                    <div className="mt-4 px-4">
                      {robots[currentIndex]?.currentMonth !== undefined ? (
                      <table className="w">
                        <tbody>
                          <tr>
                            <td>Nombre d'exécution du mois :</td>
                            <td>{robots[currentIndex]?.currentMonth !== undefined ? (robots[currentIndex].currentMonth!) : 'N/A'}</td>
                          </tr>
                          <tr>
                            <td>Nb d'exécution {(() => {
                              const mois = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('fr-FR', { month: 'long' });
                              return ['avril', 'août', 'octobre'].includes(mois) ? "d'" + mois : 'de ' + mois
                            })()} :</td>
                            <td>{robots[currentIndex]?.previousMonth !== undefined ? (robots[currentIndex].previousMonth!) : 'N/A'}</td>
                          </tr>
                        </tbody>
                      </table>
                      ) : (
                        <div className="mt-4 text-gray-500"></div>
                      )}
                    </div>

                    <div className="absolute bottom-1 left-0 right-0 flex gap-2 items-center justify-center">
                      <button
                        onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : robots.length - 1)}
                        className="px-2 pb-[2px] bg-red-800 hover:bg-red-700 text-white rounded "
                      >
                        ←
                      </button>
                      <button
                        onClick={handlePauseResume}
                        className="px-3 py-0 pb-[2px] bg-red-800 hover:bg-red-700 text-white rounded"
                      >
                        {isPaused ? '▶' : '||'}
                      </button>
                      <button
                        onClick={() => setCurrentIndex(prev => (prev + 1) % robots.length)}
                        className="px-2 pb-[2px] bg-red-800 hover:bg-red-700 text-white rounded"
                      >
                        →
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 text-gray-500">Aucune information disponible</div>
                )}
            </div>

        </div>

      </div>
    </>
  );
}
