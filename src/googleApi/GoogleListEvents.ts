import type { GoogleEvent } from "./types";
import { callRequest } from "./common";

export async function getEventsForPath(
  path: string,
  calendarId: string
): Promise<Array<GoogleEvent>> {
  let tmpRequestResult;
  const resultSizes = 50;
  // const startString = new Date().toISOString();
  let url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events?`;
  url += `sharedExtendedProperty=${encodeURIComponent(
    `obsidianPlugin_gcalEvents_path=${path}`
  )}`;
  url += `&maxResults=${resultSizes}`;
  // url += `&futureevents=true`;
  // url += `&singleEvents=true`;
  // url += `&orderby=starttime`;
  url += `&sortorder=ascending`;
  // url += `&timeMin=${startString}`;
  // url += `&timeMax=${endString}`;

  // if (tmpRequestResult && tmpRequestResult.nextPageToken) {
  //   url += `&pageToken=${tmpRequestResult.nextPageToken}`;
  // }

  tmpRequestResult = await callRequest(url, "GET", null);

  return tmpRequestResult.items;
}
