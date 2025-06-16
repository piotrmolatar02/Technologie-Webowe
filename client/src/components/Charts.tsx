import { Box } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

type DeviceData = {
  temperature: number;
  pressure: number;
  humidity: number;
  readingDate?: string;
};

type SelectedDevice = {
  id: number;
  data: DeviceData | null;
} | undefined;

type Props = {
  selectedDevice: SelectedDevice;
  history: DeviceData[];
};

const Charts = ({ selectedDevice, history }: Props) => {
  if (!selectedDevice || !selectedDevice.data || !history.length) return null;

  // Tworzymy tablice wartości dla wykresu
  const temperatureData = history.map((entry) => entry.temperature);
  const pressureData = history.map((entry) => entry.pressure);
  const humidityData = history.map((entry) => entry.humidity);
  const timeLabels = history.map((entry) =>
    entry.readingDate
      ? new Date(entry.readingDate).toLocaleString()
      : 'Brak daty'
  );

  const series = [
    { data: pressureData, label: 'Pressure [hPa]', color: '#00f' },
    { data: humidityData, label: 'Humidity [%]', color: '#0f0' },
    { data: temperatureData, label: 'Temperature [°C]', color: '#f0f' },
  ];

  return (
    <Box sx={{
      background: "#181818",
      border: "2px solid #30baff",
      borderRadius: "12px",
      p: 2,
      minWidth: 600,
      minHeight: 320,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <LineChart
        width={1100}
        height={400}
        series={series}
        xAxis={[{ scaleType: 'point', data: timeLabels, label: 'Czas pomiaru' }]}
        sx={{
          '.MuiChartsAxis-tickLabel': { fill: '#fff !important' },
          '.MuiChartsLegend-root': { color: '#fff !important' },
          '.MuiChartsAxis-label': { fill: '#fff !important' },
          background: '#181818',
        }}
      />
    </Box>
  );
};

export default Charts;
