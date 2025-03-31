import { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DevicesOutlined, Battery5Bar } from "@mui/icons-material";
import { Device, enhancedApi } from "../../store/endpoints";
import { useToast } from "../toast";

interface Props {
  onSuccess?: () => void;
  setBattery: React.Dispatch<React.SetStateAction<number>>;
}

export const DeviceRegistrationForm = ({ onSuccess, setBattery }: Props) => {
  const [formData, setFormData] = useState<Device>({
    serialNumber: "",
    model: "",
  });

  const { showToast } = useToast();

  const [registerDevice, { isLoading, isSuccess, isError, error, data }] =
    enhancedApi.useRegisterDeviceRegisterPostMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await registerDevice({ device: formData });
      if (response.data) {
        if (response.data.connected) {
          showToast(`Urządzenie zostało pomyślnie podłączone.`, "success");
          setBattery(response.data.battery);
          onSuccess?.();
        } else {
          throw response.error;
        }
      } else if (response.error) {
        throw response.error;
      }
    } catch (err) {
      showToast(`Nie udało się`, "error");
      console.error("Failed to register device:", err);
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 400,
        width: "100%",
        backgroundColor: "white",
      }}
    >
      <CardContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DevicesOutlined color="primary" />
            <Typography variant="h6">Rejestracja Urządzenia</Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Model Urządzenia</InputLabel>
            <Select
              value={formData.model}
              label="Model Urządzenia"
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              required
            >
              <MenuItem value="BrainAccess_Mini">BrainAccess Mini</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Numer Seryjny"
            value={formData.serialNumber}
            onChange={(e) =>
              setFormData({ ...formData, serialNumber: e.target.value })
            }
            required
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 1 }}
          >
            {isLoading ? <CircularProgress size={24} /> : "Zarejestruj"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
