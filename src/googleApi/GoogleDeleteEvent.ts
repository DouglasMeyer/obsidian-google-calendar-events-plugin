import { GoogleApiError } from "./GoogleApiError";
import GoogleEventsPlugin from "main";
import { GoogleEvent } from "./types";
import { settingsAreCompleteAndLoggedIn, callRequest } from "./common";

/**
 * This function will remove the event from the google api
 * If the event is recurrent is will delete all it's instanced except if deleteSingle is set
 * @param event The event to delete
 * @param deleteSingle If set to true and if the event is recurrent only one instance is deleted
 * @returns a boolean if the deletion was successfully
 */
export async function googleDeleteEvent(
  event: GoogleEvent,
  deleteAllOccurrences = false
): Promise<boolean> {
  const plugin = GoogleEventsPlugin.instance;

  if (!settingsAreCompleteAndLoggedIn()) {
    throw new GoogleApiError("Not logged in", null, 401, {
      error: "Not logged in",
    });
  }

  let calendarId = event.parent?.id;

  if (!calendarId) {
    calendarId = plugin.settings.defaultCalendar ?? "";
  }

  if (calendarId === "") {
    throw new GoogleApiError(
      "Could not delete Google Event because no default calendar selected in Settings",
      null,
      999,
      { error: "No calendar set" }
    );
  }

  // Use the recurrence id to delete all events from a recurring task
  let id = event.recurringEventId ?? event.id;

  if (!deleteAllOccurrences && event.recurringEventId) {
    id = event.id;
  }

  const response = await callRequest(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${id}`,
    "DELETE",
    null
  );
  return response;
}
