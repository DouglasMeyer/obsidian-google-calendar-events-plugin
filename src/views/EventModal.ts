import { Modal, App, Setting } from "obsidian";
import { GoogleApiError } from "src/googleApi/GoogleApiError";
import {
  googleCreateEvent,
  googleUpdateEvent,
} from "src/googleApi/GoogleCreateEvent";
import { createNotice } from "src/googleApi/common";

export interface EventData {
  id: string | undefined;
  summary: string;
  description: string;
  start: { date: string };
  end: { date: string };
  parent: { id: string };
  extendedProperties: {
    shared: {
      obsidianPlugin_gcalEvents_path: string;
    };
  };
}

export class EventModal extends Modal {
  constructor(app: App, private event: EventData) {
    super(app);
  }

  onOpen() {
    new Setting(this.contentEl)
      .setName("summary")
      .setDesc("Summary")
      .addText((text) =>
        text
          .setPlaceholder("Enter event summary")
          .setValue(this.event.summary)
          .onChange(async (value) => {
            this.event.summary = value.trim();
          })
      );
    new Setting(this.contentEl)
      .setName("description")
      .setDesc("Description")
      .addTextArea((text) =>
        text
          .setPlaceholder("Enter event description")
          .setValue(this.event.description)
          .onChange(async (value) => {
            this.event.description = value.trim();
          })
      );
    new Setting(this.contentEl)
      .setName("Start")
      .setDesc("start date")
      .addText((text) => {
        text.inputEl.type = "date";
        text
          .setPlaceholder("mm/dd/yyyy")
          .setValue(new Date(this.event.start.date).toISOString().slice(0, 10))
          .onChange(async (value) => {
            this.event.start.date = value.trim();
          });
      });
    new Setting(this.contentEl)
      .setName("End")
      .setDesc("end date")
      .addText((text) => {
        text.inputEl.type = "date";
        text
          .setPlaceholder("mm/dd/yyyy")
          .setValue(new Date(this.event.end.date).toISOString().slice(0, 10))
          .onChange(async (value) => {
            this.event.end.date = value.trim();
          });
      });
    new Setting(this.contentEl).addButton((button) => {
      button
        .setButtonText(this.event.id ? "Update event" : "Create event")
        .onClick(() => {
          (this.event.id ? googleUpdateEvent : googleCreateEvent)(
            this.event
          ).then(
            () => {
              this.close();
            },
            (error: GoogleApiError) => {
              createNotice(error.message);
            }
          );
        });
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
