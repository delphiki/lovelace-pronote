import BasePronoteCardEditor from "./base-editor";

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);

const html = LitElement.prototype.html;

class PronoteAbsencesCardEditor extends BasePronoteCardEditor {
    render() {
        if (!this.hass || !this._config) {
            return html``;
        }

        return html`
            ${this.buildEntityPickerField('Absences entity', 'entity', this._config.entity, 'absences')}
            ${this.buildSwitchField('Display header', 'display_header', this._config.display_header)}
            ${this.buildNumberField('Max absences', 'max_absences', this._config.max_absences)}
        `;
    }
}

customElements.define("pronote-absences-card-editor", PronoteAbsencesCardEditor);
