import BasePronoteCardEditor from "./base-editor";

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);

const html = LitElement.prototype.html;

class PronoteDelaysCardEditor extends BasePronoteCardEditor {
    render() {
        if (!this.hass || !this._config) {
            return html``;
        }

        return html`
            ${this.buildEntityPickerField('Delays entity', 'entity', this._config.entity, 'delays')}
            ${this.buildSwitchField('Display header', 'display_header', this._config.display_header)}
            ${this.buildNumberField('Max delays', 'max_delays', this._config.max_delays)}
            ${this.buildTextField('Child name', 'child_name', this._config.child_name)}
        `;
    }
}

customElements.define("pronote-delays-card-editor", PronoteDelaysCardEditor);
