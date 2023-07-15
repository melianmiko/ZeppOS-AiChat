import {ListScreen} from "./mmk/ListScreen";

const { config } = getApp()._options.globalData;

export class ConfiguredListScreen extends ListScreen {
    constructor() {
        super();
        this.fontSize = config.get("fontSize", this.fontSize);
        this.accentColor = 0x16b48d;
    }
}
