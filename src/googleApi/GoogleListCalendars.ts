import type { GoogleCalendar, GoogleCalendarList } from "./types";

import { GoogleApiError } from "./GoogleApiError";
import {
  settingsAreCompleteAndLoggedIn,
  callRequest,
  createNotice,
} from "./common";

let cachedCalendars: GoogleCalendar[] = [];

/**
 * This functions get all google calendars from the user that were not Black listed by him
 * The function will check if there are already saved calendars if not it will request them from the google API
 * @returns A List of Google Calendars
 */
export async function googleListCalendars(): Promise<GoogleCalendar[]> {
  if (!settingsAreCompleteAndLoggedIn()) {
    throw new GoogleApiError("Not logged in", null, 401, {
      error: "Not logged in",
    });
  }

  // const plugin = GoogleEventPlugin.instance;

  if (cachedCalendars.length) {
    //Filter for every request instead of caching the filtered result to allow hot swap settings
    // return filterCalendarsByBlackList(plugin, cachedCalendars);
    return cachedCalendars;
  }

  // Added a lock to prevent multiple requests at the same time

  const calendarList: GoogleCalendarList = await callRequest(
    `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
    "GET",
    null
  );

  // Display calendar list like Google Calendar. Primary Cal at the top, and others sorted alphabetically
  cachedCalendars = sortByField(calendarList.items, "summary", "primary");

  // const calendars = filterCalendarsByBlackList(plugin, cachedCalendars);

  // return calendars;
  return cachedCalendars;
}

/**
 * Helper function to sort calendars by field and priorityField
 */
function sortByField<T>(
  items: T[],
  field: keyof T,
  priorityField: keyof T
): T[] {
  return items.sort((a, b) => {
    if (a[priorityField] && !b[priorityField]) {
      return -1;
    } else if (!a[priorityField] && b[priorityField]) {
      return 1;
    }

    const valueA = String(a[field]).toLowerCase();
    const valueB = String(b[field]).toLowerCase();

    if (valueA < valueB) {
      return -1;
    }
    if (valueA > valueB) {
      return 1;
    }

    return 0;
  });
}

export async function listCalendars(): Promise<GoogleCalendar[]> {
  try {
    const calendars = await googleListCalendars();
    return calendars;
  } catch (error) {
    switch (error.status) {
      case 401:
        break;
      case 999:
        createNotice(error.message);
        break;
      default:
        createNotice("Could not list Google Calendars.");
        console.error("[GoogleCalendar]", error);
        break;
    }
    return [];
  }
}
