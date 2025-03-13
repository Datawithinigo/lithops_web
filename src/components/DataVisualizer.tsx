import React, { useMemo, useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions as ChartJSOptions
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import type { EnergyData } from '../types';
import type { ChartData as ChartJSData } from 'chart.js';

// Define the ChartData type locally
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: (number | null)[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DataVisualizerProps {
  data?: EnergyData[];
  chartType: 'bar' | 'line';
}

type ChartOptions = ChartJSOptions<'bar' | 'line'>;

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ data: initialData = [], chartType }) => {
  const [data, setData] = useState<EnergyData[]>(initialData);
  
  // Listen for data-loaded events
  useEffect(() => {
    const handleDataLoaded = (event: CustomEvent<EnergyData[]>) => {
      console.log('DataVisualizer received data:', event.detail);
      setData(event.detail);
    };
    
    document.addEventListener('data-loaded', handleDataLoaded as EventListener);
    
    return () => {
      document.removeEventListener('data-loaded', handleDataLoaded as EventListener);
    };
  }, []);
  const chartData = useMemo(() => {
    // Group data by function
    const groupedByFunction = data.reduce((acc, item) => {
      if (!acc[item.function]) {
        acc[item.function] = [];
      }
      acc[item.function].push(item);
      return acc;
    }, {} as Record<string, EnergyData[]>);

    // Group data by region
    const groupedByRegion = data.reduce((acc, item) => {
      if (!acc[item.region]) {
        acc[item.region] = [];
      }
      acc[item.region].push(item);
      return acc;
    }, {} as Record<string, EnergyData[]>);

    // Format dates for better display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Get unique dates
    const uniqueDates = Array.from(
      new Set(sortedData.map(item => formatDate(item.timestamp)))
    );

    // Prepare datasets for function comparison
    const functionDatasets = Object.entries(groupedByFunction).map(([func, items], index) => {
      const colors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
      ];
      
      // Calculate average energy consumption per date
      const dataByDate = uniqueDates.map(date => {
        const matchingItems = items.filter(item => formatDate(item.timestamp) === date);
        if (matchingItems.length === 0) return null;
        return matchingItems.reduce((sum, item) => sum + item.energyConsumption, 0) / matchingItems.length;
      });
      
      return {
        label: func,
        data: dataByDate,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length].replace('0.7', '1'),
        borderWidth: 1,
      };
    });

    // Prepare datasets for region comparison
    const regionDatasets = Object.entries(groupedByRegion).map(([region, items], index) => {
      const colors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
      ];
      
      // Calculate average energy consumption per date
      const dataByDate = uniqueDates.map(date => {
        const matchingItems = items.filter(item => formatDate(item.timestamp) === date);
        if (matchingItems.length === 0) return null;
        return matchingItems.reduce((sum, item) => sum + item.energyConsumption, 0) / matchingItems.length;
      });
      
      return {
        label: region,
        data: dataByDate,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length].replace('0.7', '1'),
        borderWidth: 1,
      };
    });

    return {
      functionChart: {
        labels: uniqueDates,
        datasets: functionDatasets,
      } as ChartData,
      regionChart: {
        labels: uniqueDates,
        datasets: regionDatasets,
      } as ChartData
    };
  }, [data]);

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y?.toFixed(2) || 0} kWh`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Energy Consumption (kWh)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  const renderChart = (chartData: ChartData, title: string) => {
    if (chartType === 'bar') {
      return <Bar data={chartData} options={{...options, plugins: {...options.plugins, title: {display: true, text: title}}}} />;
    } else {
      return <Line data={chartData} options={{...options, plugins: {...options.plugins, title: {display: true, text: title}}}} />;
    }
  };

  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No data available for visualization.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="h-80">
        {renderChart(chartData.functionChart, 'Energy Consumption by Function')}
      </div>
      
      <div className="h-80">
        {renderChart(chartData.regionChart, 'Energy Consumption by Region')}
      </div>
    </div>
  );
};
