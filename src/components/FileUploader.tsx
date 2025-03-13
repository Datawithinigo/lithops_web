import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import readXlsxFile from 'read-excel-file';
import { EnergyData } from '../types';
import { FileUp, AlertCircle, Upload, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onDataLoaded: (data: EnergyData[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const processData = (rawData: any[]): EnergyData[] => {
    return rawData
      .filter(row => row && Object.keys(row).length > 0) // Filter out empty rows
      .map((row, index) => {
        const isArray = Array.isArray(row);
        const id = isArray ? `row-${index}` : (row.id || `row-${index}`);
        
        return {
          id,
          timestamp: isArray ? row[0] : row.Date || row.timestamp,
          region: isArray ? row[1] : row.Region || row.region,
          function: isArray ? row[2] : row.Function || row.function,
          energyConsumption: parseFloat(isArray ? row[3] : row.EnergyConsumption_kWh || row.energyConsumption) || 0,
          preloadTime: parseFloat(isArray ? row[4] : row.ServerlessPreloadTime_ms || row.preloadTime) || 0,
          preloadStatus: isArray ? row[5] : row.PreloadStatus || row.preloadStatus || 'Unknown'
        };
      })
      .filter(row => row.timestamp && row.region && row.function); // Filter out invalid rows
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setLoading(true);
    
    try {
      const file = acceptedFiles[0];
      if (!file) {
        setError('No file selected');
        setLoading(false);
        return;
      }

      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              console.error("CSV parsing errors:", results.errors);
              setError('Error parsing CSV file: ' + results.errors[0].message);
              setLoading(false);
              return;
            }
            
            try {
              const processedData = processData(results.data);
              if (processedData.length === 0) {
                setError('No valid data found in the file');
              } else {
                onDataLoaded(processedData);
              }
            } catch (err) {
              console.error("Data processing error:", err);
              setError('Error processing data: ' + (err instanceof Error ? err.message : String(err)));
            }
            setLoading(false);
          },
          error: (error) => {
            console.error("Papa parse error:", error);
            setError('Error parsing CSV file: ' + error.message);
            setLoading(false);
          }
        });
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        try {
          const rows = await readXlsxFile(file);
          const headers = rows[0];
          const data = rows.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header, i) => {
              obj[header as string] = row[i];
            });
            return obj;
          });
          const processedData = processData(data);
          if (processedData.length === 0) {
            setError('No valid data found in the file');
          } else {
            onDataLoaded(processedData);
          }
        } catch (err) {
          console.error("Excel parsing error:", err);
          setError('Error parsing Excel file: ' + (err instanceof Error ? err.message : String(err)));
        }
        setLoading(false);
      } else {
        setError('Unsupported file format. Please upload a CSV or Excel file.');
        setLoading(false);
      }
    } catch (err) {
      console.error("File processing error:", err);
      setError('An error occurred while processing the file: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  }, [onDataLoaded]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false)
  });

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 
          isDragReject ? 'border-red-500 bg-red-50' : 
          'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-gray-600">Processing file...</p>
          </div>
        ) : (
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
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: .csv, .xlsx, .xls
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start gap-2">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};