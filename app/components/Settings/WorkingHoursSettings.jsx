"use client";

import { useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Stack,
} from "@mui/material";

export default function WorkingHoursSettings() {
  // Initial state for working days and hours
  const [workingDays, setWorkingDays] = useState({
    sunday: false,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
  });

  // Initial state for working hours
  const [workingHours, setWorkingHours] = useState({
    sunday: { start: "", end: "", available: false },
    monday: { start: "09:30", end: "17:30", available: true },
    tuesday: { start: "09:30", end: "17:30", available: true },
    wednesday: { start: "09:30", end: "17:30", available: true },
    thursday: { start: "09:30", end: "17:30", available: true },
    friday: { start: "09:30", end: "17:30", available: true },
    saturday: { start: "", end: "", available: false },
  });

  // Handle day selection
  const handleDayChange = (day) => {
    const newValue = !workingDays[day];
    setWorkingDays({
      ...workingDays,
      [day]: newValue,
    });

    // Update availability
    setWorkingHours({
      ...workingHours,
      [day]: {
        ...workingHours[day],
        available: newValue,
      },
    });
  };

  // Handle time change
  const handleTimeChange = (day, field, value) => {
    setWorkingHours({
      ...workingHours,
      [day]: {
        ...workingHours[day],
        [field]: value,
      },
    });
  };

  // Days configuration
  const days = [
    { id: "sunday", label: "Sunday" },
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
  ];

  return (
    <Box sx={{ width: "100%"}}>
      <Stack spacing={3}>
        {days.map((day) => (
          <Box key={day.id} sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ width: 160 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={workingDays[day.id]}
                    onChange={() => handleDayChange(day.id)}
                    color="primary"
                  />
                }
                label={day.label}
              />
            </Box>

            {workingDays[day.id] ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  type="time"
                  size="small"
                  sx={{ width: 120 }}
                  value={workingHours[day.id].start}
                  onChange={(e) => handleTimeChange(day.id, "start", e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <Typography variant="body2">TO</Typography>
                <TextField
                  type="time"
                  size="small"
                  sx={{ width: 120 }}
                  value={workingHours[day.id].end}
                  onChange={(e) => handleTimeChange(day.id, "end", e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Unavailable
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}