import Papa from 'papaparse';

export async function parseCsvFile(fileUrl: string) {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvString = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvString, {
        delimiter: ';',
        header: true,
        dynamicTyping: true,
        complete: (results: any) => {
          const data = results.data;
          const programList = data.map((row: { [x: string]: any; }) => `${row['AGENCE']}_${row['NOM PROGRAMME']}`);
          const uniqueProgramList = [...new Set(programList)];
          console.log('Unique program list:', uniqueProgramList);
          resolve({ data, programList: uniqueProgramList });
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching or parsing CSV:', error);
    throw error;
  }
}

export async function parseHistoriqueCsv(fileUrl: string) {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvString = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
        complete: (results: { data: unknown; }) => {
          console.log('Historique CSV parsing results:', results);
          resolve(results.data);
        },
        error: (error: any) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error fetching or parsing Historique CSV:', error);
    throw error;
  }
}

