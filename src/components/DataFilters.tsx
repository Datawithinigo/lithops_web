import React, { useState, useEffect } from 'react';
import type { EnergyData } from '../types';
import { Filter, Calendar, MapPin, Code, Zap } from 'lucide-react';

interface DataFiltersProps {
  filters?: {
    dateRange: {
      start: string;
      end: string;
    };
    function: string;
    region: string;
    energyThreshold: number;
  };
  onFilterChange: (filters: any) => void;
  data: EnergyData[];
}

const defaultFilters = {
  dateRange: { start: '', end: '' },
  function: 'all',
  region: 'all',
  energyThreshold: 0
};

export const DataFilters: React.FC<DataFiltersProps> = ({ filters = defaultFilters, onFilterChange, data: initialData }) => {
  const [data, setData] = useState<EnergyData[]>(initialData);
  const [localFilters, setLocalFilters] = useState(filters);
  const [functions, setFunctions] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  
  // Listen for data-loaded events
  useEffect(() => {
    const handleDataLoaded = (event: CustomEvent<EnergyData[]>) => {
      console.log('DataFilters received data:', event.detail);
      setData(event.detail);
    };
    
    document.addEventListener('data-loaded', handleDataLoaded as EventListener);
    
    return () => {
      document.removeEventListener('data-loaded', handleDataLoaded as EventListener);
    };
  }, []);
  
  useEffect(() => {
    const uniqueFunctions = Array.from(new Set(data.map(item => item.function)));
    const uniqueRegions = Array.from(new Set(data.map(item => item.region)));
    
    setFunctions(uniqueFunctions);
    setRegions(uniqueRegions);
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'start' || name === 'end') {
      setLocalFilters({
        ...localFilters,
        dateRange: {
          ...localFilters.dateRange,
          [name]: value
        }
      });
    } else if (name === 'energyThreshold') {
      setLocalFilters({
        ...localFilters,
        [name]: parseFloat(value)
      });
    } else {
      setLocalFilters({
        ...localFilters,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 mb-2">
        <Filter size={18} />
        <h3 className="font-medium">Filter Data</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            <Calendar size={16} />
            Date Range
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500">Start</label>
              <input
                type="date"
                name="start"
                value={localFilters.dateRange.start}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500">End</label>
              <input
                type="date"
                name="end"
                value={localFilters.dateRange.end}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            <Code size={16} />
            Function
          </label>
          <select
            name="function"
            value={localFilters.function}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Functions</option>
            {functions.map(func => (
              <option key={func} value={func}>{func}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            <MapPin size={16} />
            Region
          </label>
          <select
            name="region"
            value={localFilters.region}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            <Zap size={16} />
            Min Energy Consumption (kWh)
          </label>
          <input
            type="number"
            name="energyThreshold"
            value={localFilters.energyThreshold}
            onChange={handleInputChange}
            min="0"
            step="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Reset
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
};
