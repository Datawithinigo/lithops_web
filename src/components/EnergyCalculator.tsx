import React, { useState } from 'react';

interface EnergyData {
  id: string;
  timestamp: string;
  region: string;
  function: string;
  energyConsumption: number;
  preloadTime: number;
  preloadStatus: string;
}

export default function EnergyCalculator() {
  const [data, setData] = useState<EnergyData[]>([]);
  const [filteredData, setFilteredData] = useState<EnergyData[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => {
        const [timestamp, region, func, energy, preload, status] = row.split(',');
        return {
          id: Math.random().toString(36).substr(2, 9),
          timestamp,
          region,
          function: func,
          energyConsumption: parseFloat(energy),
          preloadTime: parseFloat(preload),
          preloadStatus: status
        };
      });
      
      setData(rows);
      setFilteredData(rows);
    };
    reader.readAsText(file);
  };

  return (
    <div className="energy-calculator">
      <input 
        type="file" 
        accept=".csv"
        onChange={handleFileUpload}
        className="file-input"
      />
      
      <div className="results">
        <h3>Results</h3>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Region</th>
              <th>Function</th>
              <th>Energy (kWh)</th>
              <th>Preload Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(row => (
              <tr key={row.id}>
                <td>{row.timestamp}</td>
                <td>{row.region}</td>
                <td>{row.function}</td>
                <td>{row.energyConsumption}</td>
                <td>{row.preloadTime}</td>
                <td>{row.preloadStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}