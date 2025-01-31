'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"
import React, { useState, useEffect } from 'react';
import { formatDuration } from '../lib/utils'
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Program } from '../utils/dataStore';
import { fetchDataReportingByRobot } from '../utils/dataFetcher'

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
  console.log("Chart.tsx - data:", data);
  if (!data) {
    return (
      <div className="flex justify-center items-center h-[400px] text-gray-500">
        L'histogramme ne peut être généré car aucune donnée disponible pour ce programme
      </div>
    );
  }




    useEffect(() => {
      const fetchRobots = async () => {
        console.log('### (Chart) fetchRobots - robotType: ', robotType);
        try {
          const querySnapshot = await getDocs(collection(db, 'robots'));
          const robotsData = await Promise.all(querySnapshot.docs.map(async doc => {
            const robotData = doc.data();
            const robot = {
              id_robot: doc.id,
              nom_robot: robotData.nom_robot,
              type_gain: robotData.type_gain,
              description: robotData.description,
              id_agence: robotData.id_agence,
              service: robotData.service,
              bareme: robotData.bareme
            } as Program;
  
            try {
              const reportingResponse = await fetchDataReportingByRobot(
                robotData.nom_robot,
                robotData.bareme,
                robotData.type_gain
              );
              if (reportingResponse.length > 0) {
                const reportingData = reportingResponse[0];
                robot.currentMonth = reportingData['NB UNITES DEPUIS DEBUT DU MOIS'];
                robot.previousMonth = reportingData['NB UNITES MOIS N-1'];
              }
            } catch (error) {
              console.log(`Erreur lors de la récupération des données pour le robot ${robotData.nom_robot}:`, error);
            }
  
            return robot;
          })).then(robots => robots.filter(robot => robot.type_gain === 'temps'));
  
          if (robotsData.length === 0) {
            setError('Aucun robot trouvé avec type_gain = "autre"');
          } else {
            setRobots(robotsData);
            console.log(' (Chart) fetchRobots - robotsData', robotsData);
            setError(null);
          }
        } catch (err) {
          setError('Erreur lors du chargement des données');
          console.log(err);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchRobots();
    }, []);
  
    const [robots, setRobots] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
      const [isPaused, setIsPaused] = useState(false);
        const [currentIndex, setCurrentIndex] = useState(0);
  
    // useEffect(() => {
    //   if (robots.length > 0 && !isPaused) {
    //     const interval = setInterval(() => {
    //       setCurrentIndex(prevIndex => (prevIndex + 1) % robots.length);
    //     }, 30000);
  
    //     return () => clearInterval(interval);
    //   }
    // }, [robots, isPaused]);
  

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
      //console.log("value",value);
    } else {
     // console.log('data[dateKey] is undefined');
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
    <div className="w-full flex justify- gap-4 items-center ">

      <div className="w-2/3 pt-4 pb-12 bg-white rounded-lg shadow ml-2">
          <div className="h-[300px] relative ">
            <div className="ml-[10%] text-left text-xl font-bold mb-4">
              {robotType?.toLowerCase() === 'temps' ? 'Gain de temps' : 'Sécurisation des processus'}
            </div>
            <div className="absolute top-2 right-2 text-black px-2 py-1 ">
              {robotType?.toLowerCase() === "autre" && (
                "Nombre d'execution"
              )};
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                width={600}
                height={500}
                barSize={40}
                barGap={15}
                title=""
                margin={{ top: 30, right: 10, left: 5, bottom: 1 }}
              >
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  tickLine={false}
                  axisLine={false}
                  tick={<CustomizedAxisTick x={0} y={0} payload={{
                    value: "--"
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
                  tickFormatter={(value: number) => (robotType?.toLowerCase() === "temps" ? formatDuration(value) : `${value}`)}
                  fontSize={10} />
                <Tooltip
                  labelFormatter={(label: string) => label}
                  formatter={(value: any, name: string, props: any) => {
                    const { valeur } = props.payload;
                    if ((valeur === undefined || valeur === 0)) {
                      return [''];
                    }
                    if (robotType?.toLowerCase() === "temps") {
                      const gain ='Gain : ' + (robotType?.toLowerCase() === "temps" ? formatDuration(value) : `${value}`)
                      return [gain];
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
                    formatter: (value: number) => value === 0 ? '' : (robotType?.toLowerCase() === "temps" ? formatDuration(value) : `${value}`)
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
                  <div className="ml-4 text-xl" title={data['NB UNITES DEPUIS DEBUT DU MOIS'] ? data['NB UNITES DEPUIS DEBUT DU MOIS']+' minutes' : 'N/A'}>
                  {data['NB UNITES DEPUIS DEBUT DU MOIS'] ? ( 
                    (robotType?.toLowerCase() === 'temps' ? formatDuration(data['NB UNITES DEPUIS DEBUT DU MOIS']) : `${data['NB UNITES DEPUIS DEBUT DU MOIS']}`)
                    ) : ('N/A') }
                  </div>
                </div>
              </div>
              <div className=" w-1/4 mr-5 ml-5">
                <div className={robotType?.toLowerCase() === 'temps' ? ('bg-[#3498db] hover:bg-[#3333db] text-white shadow-md rounded-lg py-2' ) : ( 'bg-[#EA580C] hover:bg-[#c24a0a] text-white shadow-md rounded-lg py-2')}>
                  <div className="ml-4 text-xs ">M-1</div>
                  <div className="ml-4 text-xl" title={data['NB UNITES MOIS N-1'] ? data['NB UNITES MOIS N-1'] +' minutes' : 'N/A'}>
                  {data['NB UNITES MOIS N-1'] ? ( 
                    (robotType?.toLowerCase() === 'temps' ? formatDuration(data['NB UNITES MOIS N-1']) : `${data['NB UNITES MOIS N-1']}`)
                    ) : ('N/A') }
                  </div>
                </div>
              </div>
              <div className=" w-1/4 mr-5 ml-5">
              <div className={robotType?.toLowerCase() === 'temps' ? ('bg-[#3498db] hover:bg-[#3333db] text-white shadow-md rounded-lg py-2' ) : ( 'bg-[#EA580C] hover:bg-[#c24a0a] text-white shadow-md rounded-lg py-2')}>
                  <div className="ml-4 text-xs ">M-2</div>
                  <div className="ml-4 text-xl" title={data['NB UNITES MOIS N-2'] ? data['NB UNITES MOIS N-2'] +' minutes' : 'N/A'}>
                  {data['NB UNITES MOIS N-2'] ? (
                    (robotType?.toLowerCase() === 'temps' ? formatDuration(data['NB UNITES MOIS N-2']) : `${data['NB UNITES MOIS N-2']}`)) : ('N/A') }
                  </div>
                </div>
              </div>
              <div className="w-1/4 mr-5 ml-5">
                <div className={robotType?.toLowerCase() === 'temps' ? ('bg-[#3498db] hover:bg-[#3333db] text-white shadow-md rounded-lg py-2' ) : ( 'bg-[#EA580C] hover:bg-[#c24a0a] text-white shadow-md rounded-lg py-2')}>
                  <div className="ml-4 text-xs ">M-3</div>
                  <div className="ml-4 text-xl" title={data['NB UNITES MOIS N-3'] ? data['NB UNITES MOIS N-3'] +' minutes' : 'N/A'}>
                  {data['NB UNITES MOIS N-3'] ? ( 
                    (robotType?.toLowerCase() === 'temps' ? formatDuration(data['NB UNITES MOIS N-3']) : `${data['NB UNITES MOIS N-3']}`)
                    ) : ('N/A') }
                  </div>
                </div>
              </div>
          </div>
      </div>

      <div className="w-1/3 p-4 pb-12 bg-white rounded-lg shadow ml-2">
          <div className="h-[380px] relative">
            <div className="flex flex-col justify-center items-center mt-5 bg-x-100">
              <span className="text-red-700 text-3xl font-bold">Description</span>
            </div>

            {isLoading ? (
                  <div className="mt-4 text-gray-500">Chargement en cours...</div>
                ) : error ? (
                  <div className="mt-4 text-red-500">{error}</div>
                ) : robots.length > 0 ? (
                  <>
                    <div className="mt-4 px-4 pt-10" >
                      Robot <span className="font-bold">"{data['NOM PROGRAMME']}"</span> :
                    </div>
                    <div className="mt-4 px-4 r">
                      N/A
                    </div>
                    <div className="h-[10px] bg-x-200"></div>
                    <div className="mt-4 px-4">
                      <table className="w">
                        <tbody>

                        </tbody>
                      </table>
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
