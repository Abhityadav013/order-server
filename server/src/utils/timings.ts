
import { TimeRange } from "../models/types/time-range";


export interface DaySchedule {
  [day: string]: TimeRange[];
}

// Opening hours configuration (24-hour HH:mm format)
export const schedule: DaySchedule = {
  Monday: [],
  Tuesday: [
    { start: "11:30", end: "14:30" },
    { start: "17:30", end: "21:30" }
  ],
  Wednesday: [
    { start: "11:30", end: "14:30" },
    { start: "17:30", end: "21:30" }
  ],
  Thursday: [
    { start: "11:30", end: "14:30" },
    { start: "17:30", end: "21:30" }
  ],
  Friday: [
    { start: "11:30", end: "14:30" },
    { start: "17:30", end: "21:30" }
  ],
  Saturday: [
     { start: "11:30", end: "17:30" },
    { start: "17:30", end: "22:30" }
  ],
  Sunday: [
    { start: "11:30", end: "14:30" },
    { start: "17:30", end: "21:30" }
  ]
};
