export interface EnergyData {
  id: string;
  timestamp: string;
  region: string;
  function: string;
  energyConsumption: number;
  preloadTime: number;
  preloadStatus: string;
}
