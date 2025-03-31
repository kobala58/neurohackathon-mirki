// components/pomodoroTimer/index.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Restore,
  WorkOutline,
  Coffee,
} from "@mui/icons-material";

// Typy
type TimerMode = "work" | "break";

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  mode: TimerMode;
  rounds: number;
}

interface PomodoroTimerProps {
  onSessionComplete: () => void;
}

// Stałe
const WORK_TIME = 1 * 30; // 1 minuta
const BREAK_TIME = 1 * 60; // 1 minuta

// Helper functions
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const PomodoroTimer = ({ onSessionComplete }: PomodoroTimerProps) => {
  // Stan timera
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: WORK_TIME,
    isRunning: false,
    mode: "work",
    rounds: 0,
  });

  // Handler zakończenia timera
  const handleTimerComplete = useCallback(() => {
    // Próba odtworzenia dźwięku
    try {
      const notification = new Audio("/notification.mp3");
      notification.play().catch(() => console.log("Audio playback failed"));
    } catch (error) {
      console.log("Audio creation failed:", error);
    }

    // Jeśli kończymy sesję pracy, powiadamiamy rodzica
    if (timerState.mode === "work") {
      onSessionComplete();
    }

    // Aktualizacja stanu
    setTimerState((prev) => ({
      isRunning: false,
      mode: prev.mode === "work" ? "break" : "work",
      timeLeft: prev.mode === "work" ? BREAK_TIME : WORK_TIME,
      rounds: prev.mode === "work" ? prev.rounds + 1 : prev.rounds,
    }));
  }, [timerState.mode, onSessionComplete]);

  // Efekt obsługujący odliczanie
  useEffect(() => {
    let interval: number;

    if (timerState.isRunning && timerState.timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimerState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else if (timerState.timeLeft === 0) {
      handleTimerComplete();
    }

    return () => window.clearInterval(interval);
  }, [timerState.isRunning, timerState.timeLeft, handleTimerComplete]);

  // Obliczanie postępu dla CircularProgress
  const calculateProgress = (): number => {
    const totalTime = timerState.mode === "work" ? WORK_TIME : BREAK_TIME;
    return ((totalTime - timerState.timeLeft) / totalTime) * 100;
  };

  // Handlery przycisków
  const handleReset = () => {
    setTimerState((prev) => ({
      ...prev,
      timeLeft: prev.mode === "work" ? WORK_TIME : BREAK_TIME,
      isRunning: false,
    }));
  };

  const toggleTimer = () => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  };

  return (
    <Card
      elevation={8}
      sx={{
        maxWidth: "800px",
        margin: "auto",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: 4,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={4} alignItems="center">
          {/* Title with gradient */}
          <Typography
            variant="h3"
            component="h2"
            sx={{
              background:
                timerState.mode === "work"
                  ? "linear-gradient(45deg, #4A4AE6 30%, #2196F3 90%)"
                  : "linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {timerState.mode === "work" ? "Focus Time" : "Break Time"}
          </Typography>

          {/* Timer Circle with improved visuals */}
          <Box position="relative" display="inline-flex">
            <CircularProgress
              variant="determinate"
              value={calculateProgress()}
              size={500}
              thickness={6}
              sx={{
                color: timerState.mode === "work" ? "#4A4AE6" : "#FE6B8B",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: "5rem",
                  fontWeight: 700,
                  color: timerState.mode === "work" ? "#4A4AE6" : "#FE6B8B",
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {formatTime(timerState.timeLeft)}
              </Typography>
            </Box>
          </Box>

          {/* Control Buttons - BIGGER & BETTER */}
          <Stack
            direction="row"
            spacing={4}
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <IconButton
              onClick={toggleTimer}
              sx={{
                width: 80,
                height: 80,
                backgroundColor:
                  timerState.mode === "work" ? "#4A4AE6" : "#FE6B8B",
                color: "white",
                "&:hover": {
                  backgroundColor:
                    timerState.mode === "work" ? "#2196F3" : "#FF8E53",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {timerState.isRunning ? (
                <Pause sx={{ fontSize: 40 }} />
              ) : (
                <PlayArrow sx={{ fontSize: 40 }} />
              )}
            </IconButton>
            <IconButton
              onClick={handleReset}
              sx={{
                width: 80,
                height: 80,
                backgroundColor: "rgba(0,0,0,0.1)",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.2)",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <Restore sx={{ fontSize: 40 }} />
            </IconButton>
          </Stack>

          {/* Status info */}
          <Stack spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: timerState.mode === "work" ? "#4A4AE6" : "#FE6B8B",
              }}
            >
              Completed Rounds: {timerState.rounds}
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                backgroundColor: "rgba(0,0,0,0.05)",
                borderRadius: 2,
                padding: "8px 16px",
              }}
            >
              {timerState.mode === "work" ? (
                <WorkOutline sx={{ color: "#4A4AE6" }} />
              ) : (
                <Coffee sx={{ color: "#FE6B8B" }} />
              )}
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: timerState.mode === "work" ? "#4A4AE6" : "#FE6B8B",
                }}
              >
                {timerState.mode === "work" ? "Work Mode" : "Break Mode"}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
