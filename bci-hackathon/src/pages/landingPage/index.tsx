// pages/landingPage/index.tsx
import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import {
  Add,
  ChevronLeft,
  ChevronRight,
  Assessment,
  Battery20Outlined,
} from "@mui/icons-material";
import { PomodoroTimer } from "../../components/pomodoroTimer";
import { DeviceRegistrationForm } from "../../components/deviceRegistrationForm";
import { SessionCharts } from "../../components/sesionCharts";

export const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [battery, setBattery] = useState(0);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [hasCompletedSession, setHasCompletedSession] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
        background: "#f8f9fa", // Delikatne tło dla kontrastu
      }}
    >
      {/* Left Section - PIMPOWANY */}
      <Box
        sx={{
          width: isLeftPanelOpen ? "33%" : "0",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", // Lepsze przejście
          background: "linear-gradient(135deg, #4A4AE6 0%, #C316E6 100%)",
          padding: isLeftPanelOpen ? 8 : 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          overflow: "hidden",
          whiteSpace: "nowrap",
          boxShadow: "8px 0 20px rgba(0,0,0,0.1)", // Cień dla głębi
          position: "relative",
          "&::after": {
            // Efekt połysku
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "200%",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
            transform: "translateY(-50%)",
            transition: "transform 0.5s ease",
          },
          "&:hover::after": {
            transform: "translateY(0)",
          },
        }}
      >
        {/* Logo i Tytuł */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: "4rem",
              fontWeight: 800,
              color: "white",
              mb: 2,
              letterSpacing: "-0.02em",
              textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              fontFamily: '"Inter", sans-serif',
            }}
          >
            Pomodoro Brain
          </Typography>

          <Typography
            sx={{
              fontSize: "1.25rem",
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.6,
              maxWidth: "80%",
              fontWeight: 500,
            }}
          >
            Enhance your productivity with BCI technology
          </Typography>
        </Box>

        {/* Przyciski w containerze */}
        <Stack spacing={3} sx={{ width: "100%", maxWidth: "320px" }}>
          <Button
            variant="contained"
            startIcon={battery > 0 ? <Battery20Outlined /> : <Add />}
            onClick={() => setIsModalOpen(true)}
            // onClick={() => console.log("TEST")}
            sx={{
              py: 2,
              backgroundColor: getColor(battery),
              color: "#4A4AE6",
              fontWeight: 600,
              fontSize: "1rem",
              borderRadius: 2,
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "all 0.2s ease",
              zIndex: 10,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                backgroundColor: battery > 0 ? getColor(battery) : "white",
              },
            }}
          >
            {battery > 0 ? `Connected - ${battery}%` : "Add Device"}
          </Button>

          {hasCompletedSession && (
            <Button
              variant="contained"
              startIcon={<Assessment />}
              onClick={() => setIsSessionModalOpen(true)}
              sx={{
                py: 2,
                backgroundColor: "rgba(255,255,255,0.9)",
                color: "#4A4AE6",
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transition: "all 0.2s ease",
                zIndex: 10,
                "&:hover": {
                  backgroundColor: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                },
              }}
            >
              View Session Results
            </Button>
          )}
        </Stack>
      </Box>

      {/* Toggle Button - PIMPOWANY */}
      <IconButton
        onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
        sx={{
          position: "absolute",
          left: isLeftPanelOpen ? "calc(30% - 20px)" : "20px",
          top: "50%",
          transform: "translateY(-50%)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: "white",
          width: "48px",
          height: "48px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          "&:hover": {
            backgroundColor: "white",
            transform: "translateY(-50%) scale(1.1)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
          },
          zIndex: 1000,
        }}
      >
        {isLeftPanelOpen ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>

      {/* Right Section - PIMPOWANY */}
      <Box
        sx={{
          flex: 1,
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 4,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <PomodoroTimer onSessionComplete={() => setHasCompletedSession(true)} />
      </Box>

      {/* Modale zostają takie same */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          backdropFilter: "blur(5px)", // Dodany blur dla tła modala
        }}
      >
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            transform: "scale(1.1)", // Trochę większy modal
            transition: "transform 0.3s ease",
          }}
        >
          <DeviceRegistrationForm
            onSuccess={() => setIsModalOpen(false)}
            setBattery={setBattery}
          />
        </Box>
      </Modal>

      {hasCompletedSession && (
        <SessionCharts
          open={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
        />
      )}
    </Box>
  );
};

const getColor = (pwr: number) => {
  if (pwr === 0) return "white";
  if (pwr > 75) return "green";
  if (pwr > 50) return "#90EE90";
  if (pwr > 25) return "orange";
  if (pwr > 0) return "red";
};
