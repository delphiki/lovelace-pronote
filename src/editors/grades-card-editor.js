import BasePronoteCardEditor from "./base-editor";

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);

const html = LitElement.prototype.html;

class PronoteGradesCardEditor extends BasePronoteCardEditor {
    render() {
        if (!this.hass || !this._config) {
            return html``;
        }

        return html`
            ${this.buildEntityPickerField('Grades entity', 'entity', this._config.entity, 'grades')}
            ${this.buildSwitchField('Display header', 'display_header', this._config.display_header)}
            ${this.buildSwitchField('Display date', 'display_date', this._config.display_date)}
            ${this.buildSwitchField('Display comment', 'display_comment', this._config.display_comment)}
            ${this.buildSwitchField('Display class average', 'display_class_average', this._config.display_class_average)}
            ${this.buildSwitchField('Compare with class average', 'compare_with_class_average', this._config.compare_with_class_average)}
            ${this.buildSelectField('Grade format', 'grade_format', [{value: 'full', label: 'Full'}, {value: 'short', label: 'Short'}], this._config.grade_format)}
            ${this.buildSwitchField('Display coefficient', 'display_coefficient', this._config.display_coefficient)}
            ${this.buildSwitchField('Display class min', 'display_class_min', this._config.display_class_min)}
            ${this.buildSwitchField('Display class max', 'display_class_max', this._config.display_class_max)}
            ${this.buildSwitchField('Display new grade notice', 'display_new_grade_notice', this._config.display_new_grade_notice)}
            ${this.buildNumberField('Max grades', 'max_grades', this._config.max_grades)}
        `;
    }
}

customElements.define("pronote-grades-card-editor", PronoteGradesCardEditor);
