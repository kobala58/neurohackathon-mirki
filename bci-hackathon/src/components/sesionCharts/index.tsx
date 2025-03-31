// components/sessionCharts/index.tsx
import React from "react";
import {
  Box,
  Modal,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceArea,
  Legend,
} from "recharts";
import { useGetLastSessionQuery } from "../../store/endpoints";

interface SessionChartsProps {
  open: boolean;
  onClose: () => void;
}

export const SessionCharts: React.FC<SessionChartsProps> = ({
  open,
  onClose,
}) => {
  const { data, isLoading, error } = useGetLastSessionQuery(340, {
    skip: !open,
  });

  const calculateFocusPercentage = () => {
    if (!data?.scores?.length) return 0;
    const focusedCount = data.scores.filter((score) => score.is_focused).length;
    return Math.round((focusedCount / data.scores.length) * 100);
  };

  if (isLoading) {
    return (
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
          }}
        >
          <CircularProgress />
        </Box>
      </Modal>
    );
  }

  if (error || !data) {
    return (
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography color="error">Error during data loading.</Typography>
        </Box>
      </Modal>
    );
  }

  const rawChartData = data.raw.map((item) => ({
    ...item,
    timestamp: new Date(item.timestamp).toLocaleTimeString(),
  }));

  const scoresChartData = data.scores.map((item) => ({
    ...item,
    timestamp: new Date(item.timestamp).toLocaleTimeString(),
  }));

  return (
    <Modal open={open} onClose={onClose}>
      <Card
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 1200,
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
        }}
      >
        <CardContent>
          {/* Session Title and Focus Percentage */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 400, color: "rgba(0,0,0,0.6)" }}
            >
              Session 1
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color:
                  calculateFocusPercentage() < 50
                    ? `rgb(${255 - calculateFocusPercentage() * 2.55}, ${calculateFocusPercentage() * 2.55}, 0)` // from red to yellow
                    : `rgb(0, ${255 - (100 - calculateFocusPercentage()) * 2.55}, 0)`, // from yellow to green
              }}
            >
              {calculateFocusPercentage()}% Focus
            </Typography>
          </Box>

          {/* Raw Data Chart */}
          <Box sx={{ height: 300, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Direct readings (μV)
            </Typography>
            <ResponsiveContainer>
              <LineChart data={rawChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="f3" stroke="#8884d8" name="F3" />
                <Line type="monotone" dataKey="f4" stroke="#82ca9d" name="F4" />
                <Line type="monotone" dataKey="c3" stroke="#ffc658" name="C3" />
                <Line type="monotone" dataKey="c4" stroke="#ff7300" name="C4" />
                <Line type="monotone" dataKey="p3" stroke="#0088fe" name="P3" />
                <Line type="monotone" dataKey="p4" stroke="#00C49F" name="P4" />
                <Line type="monotone" dataKey="o1" stroke="#FFBB28" name="O1" />
                <Line type="monotone" dataKey="o2" stroke="#FF8042" name="O2" />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {/* Scores Chart */}
          <Box sx={{ height: 300, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Focus analysis
            </Typography>
            <ResponsiveContainer>
              <ComposedChart data={scoresChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis domain={[0, 1.4]} />
                <Tooltip />

                {(() => {
                  const areas: JSX.Element[] = [];
                  let currentState = scoresChartData[0]?.is_focused;
                  let startTime = scoresChartData[0]?.timestamp;

                  scoresChartData.forEach((point, idx) => {
                    if (
                      point.is_focused !== currentState ||
                      idx === scoresChartData.length - 1
                    ) {
                      areas.push(
                        <ReferenceArea
                          key={`area-${startTime}`}
                          x1={startTime}
                          x2={
                            idx === scoresChartData.length - 1
                              ? point.timestamp
                              : point.timestamp
                          }
                          y1={0}
                          y2={1.4}
                          fill={currentState ? "#4CAF50" : "#f44336"}
                          fillOpacity={0.4}
                        />
                      );
                      currentState = point.is_focused;
                      startTime = point.timestamp;
                    }
                  });

                  // Dodaj ostatni obszar jeśli potrzebny
                  if (
                    startTime !==
                    scoresChartData[scoresChartData.length - 1]?.timestamp
                  ) {
                    areas.push(
                      <ReferenceArea
                        key={`area-last`}
                        x1={startTime}
                        x2={
                          scoresChartData[scoresChartData.length - 1]?.timestamp
                        }
                        y1={0}
                        y2={1.4}
                        fill={currentState ? "#4CAF50" : "#f44336"}
                        fillOpacity={0.1}
                      />
                    );
                  }

                  return areas;
                })()}

                {/* Podstawowe linie */}
                <Line
                  type="monotone"
                  dataKey="coef_min"
                  stroke="#f44336"
                  name="Minimum"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="coef_max"
                  stroke="#4CAF50"
                  name="Maximum"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="coef_avg"
                  stroke="#2196F3"
                  name="Average"
                  strokeWidth={2}
                  dot={false}
                />

                <Legend
                  payload={[
                    {
                      value: "Focused",
                      type: "rect",
                      color: "#4CAF50",
                      id: "focused",
                    },
                    {
                      value: "Distracted",
                      type: "rect",
                      color: "#f44336",
                      id: "unfocused",
                    },
                    { value: "Min", type: "line", color: "#f44336" },
                    { value: "Max", type: "line", color: "#4CAF50" },
                    { value: "Avg", type: "line", color: "#2196F3" },
                  ]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Modal>
  );
};
