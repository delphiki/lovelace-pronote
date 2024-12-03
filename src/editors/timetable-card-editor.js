import BasePronoteCardEditor from "./base-editor";

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);

const html = LitElement.prototype.html;

class PronoteTimetableCardEditor extends BasePronoteCardEditor {
    render() {
        if (!this.hass || !this._config) {
            return html``;
        }

        return html`
            ${this.buildEntityPickerField('Timetable entity', 'entity', this._config.entity, 'timetable_(period|today|tomorrow|next_day)')}
            ${this.buildSwitchField('Display header', 'display_header', this._config.display_header, true)}
            ${this.buildSwitchField('Current week only', 'current_week_only', this._config.current_week_only, false)}
            ${this.buildSwitchField('Display classroom', 'display_classroom', this._config.display_classroom, true)}
            ${this.buildSwitchField('Display day hours', 'display_day_hours', this._config.display_day_hours, true)}
            ${this.buildSwitchField('Display lunch break', 'display_lunch_break', this._config.display_lunch_break, true)}
            ${this.buildSwitchField('Dim ended lessons', 'dim_ended_lessons', this._config.dim_ended_lessons, true)}
            ${this.buildSwitchField('Enable slider', 'enable_slider', this._config.enable_slider, false)}
        `;
    }
}

customElements.define("pronote-timetable-card-editor", PronoteTimetableCardEditor);
