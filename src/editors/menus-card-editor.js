import BasePronoteCardEditor from "./base-editor";

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);

const html = LitElement.prototype.html;

class PronoteMenusCardEditor extends BasePronoteCardEditor {
    render() {
        if (!this.hass || !this._config) {
            return html``;
        }

        return html`
            ${this.buildEntityPickerField('Menus entity', 'entity', this._config.entity, 'menus')}
            ${this.buildSwitchField('Display header', 'display_header', this._config.display_header, true)}
            ${this.buildSwitchField('Display menu name', 'display_menu_name', this._config.display_menu_name, true)}
            ${this.buildSwitchField('Display labels', 'display_labels', this._config.display_labels, true)}
            ${this.buildSwitchField('Current week only', 'current_week_only', this._config.current_week_only, false)}
            ${this.buildNumberField('Max days', 'max_days', this._config.max_days, null, 1)}
            ${this.buildSwitchField('Auto switch to next day', 'switch_to_next_day', this._config.switch_to_next_day, false)}
        `;
    }
}

customElements.define("pronote-menus-card-editor", PronoteMenusCardEditor);
