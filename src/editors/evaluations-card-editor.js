import BasePronoteCardEditor from "./base-editor";

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);

const html = LitElement.prototype.html;

class PronoteEvaluationsCardEditor extends BasePronoteCardEditor {
    render() {
        if (!this.hass || !this._config) {
            return html``;
        }

        return html`
            ${this.buildEntityPickerField('Evaluations entity', 'entity', this._config.entity, 'evaluations')}
            ${this.buildSwitchField('Display header', 'display_header', this._config.display_header)}
            ${this.buildSwitchField('Display description', 'display_description', this._config.display_description)}
            ${this.buildSwitchField('Display teacher', 'display_teacher', this._config.display_teacher)}
            ${this.buildSwitchField('Display date', 'display_date', this._config.display_date)}
            ${this.buildSwitchField('Display comment', 'display_comment', this._config.display_comment)}
            ${this.buildSwitchField('Display coefficient', 'display_coefficient', this._config.display_coefficient)}
            ${this.buildNumberField('Max evaluations', 'max_evaluations', this._config.max_evaluations)}
            ${this.buildTextField('Child name', 'child_name', this._config.child_name)}
        `;
    }
}

customElements.define("pronote-evaluations-card-editor", PronoteEvaluationsCardEditor);
