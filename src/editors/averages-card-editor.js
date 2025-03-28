import BasePronoteCardEditor from "./base-editor";

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);

const html = LitElement.prototype.html;

class PronoteAveragesCardEditor extends BasePronoteCardEditor {
    render() {
        if (!this.hass || !this._config) {
            return html``;
        }

        return html`
            ${this.buildEntityPickerField('Averages entity', 'entity', this._config.entity, 'averages')}
            ${this.buildSwitchField('Display header', 'display_header', this._config.display_header)}
            ${this.buildSelectField('Average format', 'average_format', [{value: 'full', label: 'Full'}, {value: 'short', label: 'Short'}],this._config.average_format)}
            ${this.buildSwitchField('Display class average', 'display_class_average', this._config.display_class_average)}
            ${this.buildSwitchField('Compare with class average', 'compare_with_class_average', this._config.compare_with_class_average)}
            ${this.buildTextField('Compare with ratio', 'compare_with_ratio', this._config.compare_with_ratio, '')}
            ${this.buildSwitchField('Display class min', 'display_class_min', this._config.display_class_min)}
            ${this.buildSwitchField('Display class max', 'display_class_max', this._config.display_class_max)}
            ${this.buildDefaultPeriodSelectField('Default period', 'default_period', 'averages', this._config.default_period, 'current', false)}
        `;
    }
}

customElements.define("pronote-averages-card-editor", PronoteAveragesCardEditor);
