import { Box } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

type DeviceData = {
  deviceId: number;
  temperature: number;
  pressure: number;
  humidity: number;
  readingDate: string;
};

type Props = {
  data: DeviceData[];
};

const colors = [
  "#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#A833FF", "#33FFF5", "#FFC733", "#FF3333",
  "#33FFA8", "#A8FF33", "#5733FF", "#F533FF", "#33C3FF"
];

const GlobalChart = ({ data }: Props) => {
  if (!data.length) return (
    <div style={{ color: '#fff', textAlign: 'center', margin: '40px 0' }}>
      Brak odczytów z ostatniej godziny.
    </div>
  );

  // Grupowanie po deviceId
  const grouped = data.reduce((acc, cur) => {
    if (!acc[cur.deviceId]) acc[cur.deviceId] = [];
    acc[cur.deviceId].push(cur);
    return acc;
  }, {} as Record<number, DeviceData[]>);

  // Tworzenie serii dla każdego deviceId i typu pomiaru
  const series: any[] = [];
  const metrics = [
    { key: "temperature", label: "Temp [°C]" },
    { key: "pressure", label: "Pressure [hPa]" },
    { key: "humidity", label: "Humidity [%]" }
  ];

  Object.keys(grouped).forEach((deviceId, groupIdx) => {
    metrics.forEach((metric, metricIdx) => {
      series.push({
        data: grouped[Number(deviceId)].map(d => d[metric.key as keyof DeviceData] as number),
        label: `Dev.${deviceId} ${metric.label}`,
        color: colors[(groupIdx * metrics.length + metricIdx) % colors.length]
      });
    });
  });

  // Oś czasu – najwięcej punktów
  const maxLengthDeviceId = Object.keys(grouped).reduce((acc, cur) =>
    grouped[acc]?.length > grouped[Number(cur)]?.length ? acc : Number(cur),
    Number(Object.keys(grouped)[0])
  );
  const timeLabels = grouped[maxLengthDeviceId]?.map(
    (entry: DeviceData) => new Date(entry.readingDate).toLocaleTimeString()
  ) || [];

  return (
    <Box sx={{
      background: "#1a1a1a",
      border: "2px solid #888",
      borderRadius: "12px",
      p: 2,
      mb: 4,
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
        xAxis={[{ scaleType: 'point', data: timeLabels, label: 'Czas (ostatnia godzina)' }]}
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

export default GlobalChart;
