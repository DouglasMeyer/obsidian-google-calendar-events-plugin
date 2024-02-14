import { Plugin } from "obsidian";
import { EVENTS_VIEW_VIEW_TYPE, EventsView } from "src/views/EventsView";
import { listCalendars } from "src/googleApi/GoogleListCalendars";
import { SettingTab } from "src/views/SettingsTab";

interface PluginSettings {
  googleOAuthServer: string;
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
  defaultCalendar: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
  googleOAuthServer: "",
  googleClientId: "",
  googleClientSecret: "",
  googleRefreshToken: "",
  defaultCalendar: "",
};

export default class GoogleEventsPlugin extends Plugin {
  static instance: GoogleEventsPlugin;
  settings: PluginSettings;
  settingsTab: SettingTab;

  async onload() {
    GoogleEventsPlugin.instance = this;
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

    this.registerView(EVENTS_VIEW_VIEW_TYPE, (leaf) => new EventsView(leaf));
    if (this.app.workspace.layoutReady) {
      this.initLeaf();
    } else {
      this.registerEvent(this.app.workspace.on("layout-ready", this.initLeaf));
    }
    this.addCommand({
      id: "show-events-view",
      name: "Open events view",
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            this.app.workspace.getLeavesOfType(EVENTS_VIEW_VIEW_TYPE).length ===
            0
          );
        }
        this.initLeaf();
      },
    });
  }

  initLeaf = () => {
    if (this.app.workspace.getLeavesOfType(EVENTS_VIEW_VIEW_TYPE).length) {
      return;
    }
    this.app.workspace.getRightLeaf(false).setViewState({
      type: EVENTS_VIEW_VIEW_TYPE,
    });
  };

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
