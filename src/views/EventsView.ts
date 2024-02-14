import { ItemView, Setting, TFile, getIcon } from "obsidian";
import GoogleEventsPlugin from "main";
import { getEventsForPath } from "../googleApi/GoogleListEvents";
import { GoogleEvent } from "src/googleApi/types";
import { EventModal } from "./EventModal";
import { googleDeleteEvent } from "src/googleApi/GoogleDeleteEvent";

export const EVENTS_VIEW_VIEW_TYPE = "google-events-view";

export class EventsView extends ItemView {
  activeFilePath: string | undefined;
  activeFileEvents: Array<GoogleEvent> | null;

  getViewType() {
    return EVENTS_VIEW_VIEW_TYPE;
  }

  getDisplayText() {
    return "Events view";
  }

  getIcon() {
    return "calendar";
  }

  onload(): void {
    this.registerEvent(this.app.workspace.on("file-open", this.onFileOpen));
    this.onFileOpen(this.app.workspace.getActiveFile());
  }

  onFileOpen = async (file: TFile | null) => {
    this.activeFilePath = file?.path;
    if (this.activeFilePath) {
      this.activeFileEvents = await getEventsForPath(
        this.activeFilePath,
        GoogleEventsPlugin.instance.settings.defaultCalendar
      );
    } else {
      this.activeFileEvents = null;
    }
    // re-render
    this.onOpen();
  };

  async onOpen() {
    this.contentEl.empty();

    if (!this.activeFileEvents) {
      this.contentEl.createEl("small", { text: "No active file" });
      return;
    }
    if (this.activeFileEvents.length === 0) {
      this.contentEl.createEl("small", { text: "No Events" });
    }
    // if (this.activeFileEvents.length > 0) {
    //   console.log(this.activeFileEvents[0]);
    // }
    // TODO: hide past events
    for (const event of this.activeFileEvents) {
      this.contentEl.createDiv({ cls: "CalendarCard" }, (div) => {
        div.createEl("h3", { cls: "summary", text: event.summary });
        // TODO: datetime
        let date = event.start.date;
        if (date !== event.end.date) {
          date += " - " + event.end.date;
        }
        div.createEl("small", { cls: "date", text: date });
        div.createEl("p", { cls: "description", text: event.description });
        div
          .createEl("button", {
            cls: "edit",
            text: getIcon("pencil") || ("edit" as any),
          })
          .onClickEvent(() => {
            new EventModal(this.app, event as any).open();
          });
        div
          .createEl("button", {
            cls: "delete",
            text: getIcon("trash-2") || ("delete" as any),
          })
          .onClickEvent(async () => {
            await googleDeleteEvent(event);
            const index = this.activeFileEvents?.indexOf(event);
            if (index) this.activeFileEvents?.splice(index, 1);
            // re-render
            this.onOpen();
          });
      });
    }

    new Setting(this.contentEl).addButton((button) => {
      button.setButtonText("Create event").onClick(() => {
        if (this.activeFilePath) {
          new EventModal(this.app, {
            id: undefined,
            summary: "Summary",
            description: "Description",
            start: { date: new Date().toLocaleDateString() },
            end: { date: new Date().toLocaleDateString() },
            parent: {
              id: GoogleEventsPlugin.instance.settings.defaultCalendar,
            },
            extendedProperties: {
              shared: {
                obsidianPlugin_gcalEvents_path: this.activeFilePath,
              },
            },
          }).open();
        }
      });
    });
  }

  async onClose() {
    // Nothing to clean up.
  }
}
