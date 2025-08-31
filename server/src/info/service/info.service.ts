// src/services/restroInfo.service.ts
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { TimeRange } from "../../models/types/time-range";
import { schedule } from "../../utils/timings";

dayjs.extend(customParseFormat);

export class RestroInfoService {
  private isTimeInRange(currentTime: string, range: TimeRange): boolean {
    const now = dayjs(currentTime, "HH:mm");
    const start = dayjs(range.start, "HH:mm");
    const end = dayjs(range.end, "HH:mm");
    return now.isAfter(start) && now.isBefore(end);
  }

  getRestaurantInfo() {
    const now = dayjs();
    const currentDay = now.format("dddd");
    const currentTime = now.format("HH:mm");

    const todayHours = schedule[currentDay] || [];
    let isOpenNow = false;

    for (const range of todayHours) {
      if (this.isTimeInRange(currentTime, range)) {
        isOpenNow = true;
        break;
      }
    }

    let nextOpeningTime: string | null = null;

    if (!isOpenNow) {
      for (const range of todayHours) {
        if (currentTime < range.start) {
          const [hourStr, minuteStr] = range.start.split(":");
          const hour = Number(hourStr);
          const minute = Number(minuteStr);
          if (!isNaN(hour) && !isNaN(minute)) {
            nextOpeningTime = now
              .hour(hour)
              .minute(minute)
              .second(0)
              .millisecond(0)
              .toISOString();
          }
          break;
        }
      }

      if (!nextOpeningTime) {
        for (let i = 1; i <= 7; i++) {
          const nextDay = now.add(i, "day"); // Dayjs object
          const nextDayName = nextDay.format("dddd"); // string of day name

          const hours = schedule[nextDayName];
          if (hours && hours.length > 0) {
            const [hourStr, minuteStr] = hours[0].start.split(":");
            const hour = Number(hourStr);
            const minute = Number(minuteStr);
            if (!isNaN(hour) && !isNaN(minute)) {
              nextOpeningTime = nextDay
                .hour(hour)
                .minute(minute)
                .second(0)
                .millisecond(0)
                .toISOString();
              break;
            }
          }
        }
      }
    }

    return {
      restaurantId: process.env.RESTAURANT_ID,
      currentDay,
      openingHours: todayHours,
      isOpenNow,
      nextOpeningTime,
    };
  }
}
