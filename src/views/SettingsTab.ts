import GoogleEventsPlugin from "main";
import { PluginSettingTab, App, Setting } from "obsidian";
import { LoginGoogle } from "src/googleApi/GoogleAuth";
import { listCalendars } from "src/googleApi/GoogleListCalendars";
import { settingsAreCompleteAndLoggedIn } from "src/googleApi/common";
import { refreshToken, accessToken, expirationTime } from "src/state";

export class SettingTab extends PluginSettingTab {
  plugin: GoogleEventsPlugin;

  constructor(app: App, plugin: GoogleEventsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const isLoggedIn = refreshToken();

    containerEl.empty();

    new Setting(containerEl)
      .setName("ClientId")
      .setDesc("Google client id")
      .addText((text) =>
        text
          .setPlaceholder("Enter your client id")
          .setValue(this.plugin.settings.googleClientId)
          .onChange(async (value) => {
            this.plugin.settings.googleClientId = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("ClientSecret")
      .setDesc("Google client secret")
      .addText((text) =>
        text
          .setPlaceholder("Enter your client secret")
          .setValue(this.plugin.settings.googleClientSecret)
          .onChange(async (value) => {
            this.plugin.settings.googleClientSecret = value.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Login with google")
      .addButton((button) => {
        button.setButtonText(isLoggedIn ? "Logout" : "Login").onClick(() => {
          if (isLoggedIn) {
            refreshToken("");
            accessToken("");
            expirationTime(0);
            this.hide();
            this.display();
          } else {
            LoginGoogle();
          }
        });
      });

    if (settingsAreCompleteAndLoggedIn()) {
      new Setting(containerEl)
        .setName("Events Calendar")
        .addDropdown(async (dropdown) => {
          dropdown.addOption("Default", "Select a calendar");
          const calendars = await listCalendars();

          calendars.forEach((calendar) => {
            dropdown.addOption(calendar.id, calendar.summary);
          });
          dropdown.setValue(this.plugin.settings.defaultCalendar);
          dropdown.onChange(async (value) => {
            this.plugin.settings.defaultCalendar = value;
            await this.plugin.saveSettings();
          });
        });
    }
  }
}
