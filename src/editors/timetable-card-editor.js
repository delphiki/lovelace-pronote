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
            ${this.buildEntityPickerField('Timetable entity', 'entity', this._config.entity, '(period_s|today_s|tomorrow_s|next_day_s)_timetable')}
            ${this.buildSwitchField('Display header', 'display_header', this._config.display_header, true)}
            ${this.buildSwitchField('Current week only', 'current_week_only', this._config.current_week_only, false)}
            ${this.buildNumberField('Max days', 'max_days', this._config.max_days, null, 1)}
            ${this.buildSwitchField('Display classroom', 'display_classroom', this._config.display_classroom, true)}
            ${this.buildSwitchField('Display teacher', 'display_teacher', this._config.display_teacher, true)}
            ${this.buildSwitchField('Display day hours', 'display_day_hours', this._config.display_day_hours, true)}
            ${this.buildSwitchField('Display lunch break', 'display_lunch_break', this._config.display_lunch_break, true)}
            ${this.buildSwitchField('Dim ended lessons', 'dim_ended_lessons', this._config.dim_ended_lessons, true)}
            ${this.buildSwitchField('Enable slider', 'enable_slider', this._config.enable_slider, false)}
            ${this.buildSwitchField('Auto switch to next day (if slider enabled)', 'switch_to_next_day', this._config.switch_to_next_day, false)}
            ${this.buildSwitchField('Display free time slots', 'display_free_time_slots', this._config.display_free_time_slots, true)}
        `;
    }
}

customElements.define("pronote-timetable-card-editor", PronoteTimetableCardEditor);
