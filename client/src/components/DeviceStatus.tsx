import { Typography, Card, CardContent, Divider, Button } from '@mui/material';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OpacityIcon from '@mui/icons-material/Opacity';

type DeviceData = {
  temperature: number;
  pressure: number;
  humidity: number;
};

type Props = {
  data: DeviceData | null;
  deviceId: number;
  onSelect: (deviceId: number) => void;
  hideDetailsButton?: boolean;
  alert?: boolean;
};

const DeviceStatus = ({ data, deviceId, onSelect, hideDetailsButton, alert }: Props) => {
  const hasData = data && data.temperature !== undefined;

  return (
    <Card sx={{
      backgroundColor: alert ? '#a50000' : '#222',
      color: '#fff',
      minWidth: 200,
      border: alert ? '2px solid #ff3333' : undefined,
      boxShadow: alert ? '0 0 10px 3px #ff333377' : undefined,
      transition: 'background 0.3s, border 0.3s'
    }}>
      <CardContent>
        <Typography variant="h6">Device No. {deviceId}</Typography>
        <Divider sx={{ backgroundColor: '#aaa', my: 1 }} />
        {hasData ? (
          <>
            <Typography variant="body1"><DeviceThermostatIcon /> {data.temperature} °C</Typography>
            <Typography variant="body1"><CloudUploadIcon /> {data.pressure} hPa</Typography>
            <Typography variant="body1"><OpacityIcon /> {data.humidity}%</Typography>
          </>
        ) : (
          <Typography>No data</Typography>
        )}
        {!hideDetailsButton && (
          <Button onClick={() => onSelect(deviceId)} sx={{ mt: 2 }} variant="outlined" color="primary">
            Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceStatus;
