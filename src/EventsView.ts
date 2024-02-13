import { ItemView, Setting, WorkspaceLeaf } from "obsidian";
import { googleCreateEvent } from "./googleApi/GoogleCreateEvent";
import { listCalendars } from "./googleApi/GoogleListCalendars";
import GoogleEventPlugin from "main";
import { createNotice } from "./googleApi/common";
import { GoogleApiError } from "./googleApi/GoogleApiError";
import {
  getEventsForPath,
  googleListEvents,
} from "./googleApi/GoogleListEvents";

export const EVENTS_VIEW_VIEW_TYPE = "google-events-view";

interface EventData {
  summary: string;
  description: string;
  start: { date: string };
  end: { date: string };
  parent: { id: string };
}

export class EventsView extends ItemView {
  defaultNewEvent: EventData;
  newEvent: EventData;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.defaultNewEvent = {
      summary: "Summary",
      description: "Description",
      start: { date: new Date().toLocaleDateString() },
      end: { date: new Date().toLocaleDateString() },
      parent: { id: GoogleEventPlugin.instance.settings.defaultCalendar },
    };
    this.newEvent = { ...this.defaultNewEvent };
  }

  getViewType() {
    return EVENTS_VIEW_VIEW_TYPE;
  }

  getDisplayText() {
    return "Events view";
  }

  getActiveFilePath() {
    const path = this.app.workspace.getActiveFile()?.path;
    return path || "unknown";
  }

  async onOpen() {
    this.containerEl.empty();

    const events = await getEventsForPath(
      this.getActiveFilePath(),
      GoogleEventPlugin.instance.settings.defaultCalendar
    );
    if (events.length === 0) {
      this.containerEl.createEl("small", { text: "No Events" });
    } else {
      console.log(events[0]);
    }
    for (const event of events) {
      this.containerEl.createDiv({ cls: "CalendarCard" }, (div) => {
        div.createEl("h3", { cls: "summary", text: event.summary });
        let date = event.start.date;
        if (date !== event.end.date) {
          date += " - " + event.end.date;
        }
        div.createEl("small", { cls: "date", text: date });
        div.createEl("p", { cls: "description", text: event.description });
      });
    }

    new Setting(this.containerEl)
      .setName("Start")
      .setDesc("start date")
      .addText((text) =>
        text
          .setPlaceholder("mm/dd/yyyy")
          .setValue(this.newEvent.start.date)
          .onChange(async (value) => {
            this.newEvent.start.date = value.trim();
          })
      );
    new Setting(this.containerEl)
      .setName("End")
      .setDesc("end date")
      .addText((text) =>
        text
          .setPlaceholder("mm/dd/yyyy")
          .setValue(this.newEvent.end.date)
          .onChange(async (value) => {
            this.newEvent.end.date = value.trim();
          })
      );
    new Setting(this.containerEl)
      .setName("summary")
      .setDesc("Summary")
      .addText((text) =>
        text
          .setPlaceholder("Enter event summary")
          .setValue(this.newEvent.summary)
          .onChange(async (value) => {
            this.newEvent.summary = value.trim();
          })
      );
    new Setting(this.containerEl)
      .setName("description")
      .setDesc("Description")
      .addTextArea((text) =>
        text
          .setPlaceholder("Enter event description")
          .setValue(this.newEvent.description)
          .onChange(async (value) => {
            this.newEvent.description = value.trim();
          })
      );
    // new Setting(this.containerEl)
    //   .setName("Calendar")
    //   .addDropdown(async (dropdown) => {
    //     const calendars = await listCalendars();

    //     calendars.forEach((calendar) => {
    //       dropdown.addOption(calendar.id, calendar.summary);
    //     });
    //     dropdown.setValue(this.newEvent.parent.id);
    //     dropdown.onChange(async (value) => {
    //       this.newEvent.parent.id = value;
    //     });
    //   });
    new Setting(this.containerEl)
      .setName("create event")
      .addButton((button) => {
        button.setButtonText("Create event").onClick(() => {
          googleCreateEvent({
            ...this.newEvent,
            extendedProperties: {
              shared: {
                obsidianPlugin_gcalEvents_path: this.getActiveFilePath(),
              },
            },
          }).catch((error: GoogleApiError) => {
            createNotice(error.message);
          });
          this.newEvent = { ...this.defaultNewEvent };
          this.onOpen();
        });
      });
  }

  async onClose() {
    // Nothing to clean up.
  }
}
