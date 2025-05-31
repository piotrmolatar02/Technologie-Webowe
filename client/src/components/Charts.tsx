import { LineChart } from '@mui/x-charts/LineChart';

type DeviceData = {
  temperature: number;
  pressure: number;
  humidity: number;
};

type SelectedDevice = {
  id: number;
  data: DeviceData | null;
} | undefined;

type Props = {
  selectedDevice: SelectedDevice;
};

const Charts = ({ selectedDevice }: Props) => {
  if (!selectedDevice || !selectedDevice.data) return null;

  const { temperature, pressure, humidity } = selectedDevice.data;

  const series = [
    { data: [pressure], label: 'Pressure x10 [hPa]', color: '#00f' },
    { data: [humidity], label: 'Humidity [%]', color: '#0f0' },
    { data: [temperature], label: 'Temperature [°C]', color: '#f0f' },
  ];

  return (
    <LineChart
      width={600}
      height={300}
      series={series}
      xAxis={[{ scaleType: 'point', data: ['Now'], label: 'Time' }]}
      sx={{
        '.MuiChartsAxis-tickLabel': { fill: '#fff' },
        '.MuiChartsLegend-root': { color: '#fff' },
        '.MuiChartsAxis-label': { fill: '#fff' },
      }}
    />
  );
};

export default Charts;
