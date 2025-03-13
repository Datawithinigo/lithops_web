import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import type { EnergyData } from '../types';
import { FileUp, Upload } from 'lucide-react';

interface FileUploaderProps {
  onDataLoaded?: (data: EnergyData[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = (props) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file) return;
    
    setFileName(file.name);
    console.log("File selected:", file.name);
    
    // For CSV files
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Process the data
          const data = results.data.map((row: any, index: number) => ({
            id: `row-${index}`,
            timestamp: row.Date || row.timestamp || '',
            region: row.Region || row.region || '',
            function: row.Function || row.function || '',
            energyConsumption: parseFloat(row.EnergyConsumption_kWh || row.energyConsumption || '0'),
            preloadTime: parseFloat(row.ServerlessPreloadTime_ms || row.preloadTime || '0'),
            preloadStatus: row.PreloadStatus || row.preloadStatus || 'Unknown'
          }));
          
          console.log("Parsed data:", data);
          
          // Dispatch event directly
          document.dispatchEvent(new CustomEvent('data-loaded', { 
            detail: data 
          }));
        }
      });
    }
  };

  // Setup dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0]);
      }
    },
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          {isDragActive ? (
            <>
              <Upload className="h-10 w-10 text-blue-500 mb-2" />
              <p className="text-blue-600">Drop the file here...</p>
            </>
          ) : (
            <>
              <FileUp className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-600">
                Drag and drop a file here, or click to select
              </p>
              {fileName && (
                <p className="text-sm text-blue-600 font-medium mt-2">
                  Selected: {fileName}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Supported format: .csv
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
