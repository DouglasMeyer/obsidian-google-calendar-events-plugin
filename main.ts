import {
  App,
  // Editor,
  // MarkdownView,
  // Modal,
  // Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
} from "obsidian";
import { LoginGoogle } from "src/googleApi/GoogleAuth";
import { listCalendars } from "src/googleApi/GoogleListCalendars";
// import { LoginGoogle } from "src/GoogleAuth";
import { refreshToken, accessToken, expirationTime } from "src/state";

interface PluginSettings {
  // useCustomClient: boolean;
  googleOAuthServer: string;
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
  googleOAuthServer: "",
  googleClientId: "",
  googleClientSecret: "",
  googleRefreshToken: "",
};

export default class GoogleEventPlugin extends Plugin {
  static instance: GoogleEventPlugin;
  settings: PluginSettings;
  settingsTab: SettingTab;

  async onload() {
    GoogleEventPlugin.instance = this;
    await this.loadSettings();

    // this.registerMarkdownCodeBlockProcessor("csv", (source, el, ctx) => {
    // 	const rows = source.split("\n").filter((row) => row.length > 0);

    // 	const table = el.createEl("table");
    // 	const body = table.createEl("tbody");

    // 	for (let i = 0; i < rows.length; i++) {
    // 		const cols = rows[i].split(",");

    // 		const row = body.createEl("tr");

    // 		for (let j = 0; j < cols.length; j++) {
    // 			row.createEl("td", { text: cols[j] });
    // 		}
    // 	}
    // });
    this.registerMarkdownCodeBlockProcessor(
      "gcalevent",
      async (source, el, ctx) => {
        const calendars = await listCalendars();
        el.createEl("pre", {
          text: JSON.stringify(calendars, null, 2),
        });
      }
    );

    // // This creates an icon in the left ribbon.
    // const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
    // 	// Called when the user clicks the icon.
    // 	new Notice('This is a notice!');
    // });
    // // Perform additional things with the ribbon
    // ribbonIconEl.addClass('my-plugin-ribbon-class');

    // // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
    // const statusBarItemEl = this.addStatusBarItem();
    // statusBarItemEl.setText("Status Bar Text");

    // // This adds a simple command that can be triggered anywhere
    // this.addCommand({
    // 	id: 'open-sample-modal-simple',
    // 	name: 'Open sample modal (simple)',
    // 	callback: () => {
    // 		new SampleModal(this.app).open();
    // 	}
    // });
    // // This adds an editor command that can perform some operation on the current editor instance
    // this.addCommand({
    // 	id: 'sample-editor-command',
    // 	name: 'Sample editor command',
    // 	editorCallback: (editor: Editor, view: MarkdownView) => {
    // 		console.log(editor.getSelection());
    // 		editor.replaceSelection('Sample Editor Command');
    // 	}
    // });
    // // This adds a complex command that can check whether the current state of the app allows execution of the command
    // this.addCommand({
    // 	id: 'open-sample-modal-complex',
    // 	name: 'Open sample modal (complex)',
    // 	checkCallback: (checking: boolean) => {
    // 		// Conditions to check
    // 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    // 		if (markdownView) {
    // 			// If checking is true, we're simply "checking" if the command can be run.
    // 			// If checking is false, then we want to actually perform the operation.
    // 			if (!checking) {
    // 				new SampleModal(this.app).open();
    // 			}

    // 			// This command will only show up in Command Palette when the check function returns true
    // 			return true;
    // 		}
    // 	}
    // });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab((this.settingsTab = new SettingTab(this.app, this)));

    // // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
    // // Using this function will automatically remove the event listener when this plugin is disabled.
    // this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
    // 	console.log('click', evt);
    // });

    // // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
    // this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

    // this.registerEvent(
    // 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
    // 	(<any>this.app.workspace).on(
    // 		"periodic-notes:settings-updated",
    // 		this.onNoteSettingsUpdate
    // 	)
    // );
    // this.registerEvent(this.app.vault.on("create", this.onFileCreated));
    // this.registerEvent(this.app.vault.on("delete", this.onFileDeleted));
    // this.registerEvent(this.app.vault.on("modify", this.onFileModified));
    this.registerEvent(this.app.workspace.on("file-open", this.onFileOpen));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  onFileOpen = (file: TFile) => {
    // look for events
    // console.log("onFileOpen");
    // console.log("file", (window.file = file));
    // console.log("app", (window.app = this.app));
  };
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	onOpen() {
// 		const {contentEl} = this;
// 		contentEl.setText('Woah!');
// 	}

// 	onClose() {
// 		const {contentEl} = this;
// 		contentEl.empty();
// 	}
// }

class SettingTab extends PluginSettingTab {
  plugin: GoogleEventPlugin;

  constructor(app: App, plugin: GoogleEventPlugin) {
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
      // .setClass("SubSettings")
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
      // .setClass("SubSettings")
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
            // if (Platform.isMobileApp) {
            // 	if (this.plugin.settings.useCustomClient) {
            // 		StartLoginGoogleMobile();
            // 	} else {
            // 		window.open(
            // 			`${this.plugin.settings.googleOAuthServer}/api/google`
            // 		);
            // 	}
            // } else {
            LoginGoogle();
            // }
          }
        });
      });
  }
}
