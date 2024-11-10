import BasePronoteCardEditor from "./base-editor";

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);

const html = LitElement.prototype.html;

class PronoteHomeworkCardEditor extends BasePronoteCardEditor {
    render() {
        if (!this.hass || !this._config) {
            return html``;
        }

        return html`
            ${this.buildEntityPickerField('Homework entity', 'entity', this._config.entity, 'homework')}
            ${this.buildSwitchField('Display header', 'display_header', this._config.display_header)}
            ${this.buildSwitchField('Current week only', 'current_week_only', this._config.current_week_only)}
            ${this.buildSwitchField('Reduce done homework', 'reduce_done_homework', this._config.reduce_done_homework)}
            ${this.buildSwitchField('Display done homework', 'display_done_homework', this._config.display_done_homework)}
        `;
    }
}

customElements.define("pronote-homework-card-editor", PronoteHomeworkCardEditor);
