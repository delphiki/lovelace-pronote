const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class BasePronoteCardEditor extends LitElement {
    static get properties() {
        return {
            hass: {},
            _config: {},
        };
    }

    setConfig(config) {
        this._config = config;
        this.loadEntityPicker();
    }

    _valueChanged(ev) {
        this._setConfigValue(ev.target.configValue, ev.target.value);
    }

    _setConfigValue(config_key, value) {
        const _config = Object.assign({}, this._config);
        _config[config_key] = value === '' || value === undefined ? null : value;
        this._config = _config;

        const event = new CustomEvent("config-changed", {
            detail: { config: _config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    buildFormField(label, config_key, value, selector) {
        return html`
            <ha-form
                .hass=${this.hass}
                .data=${{ [config_key]: value }}
                .schema=${[{ name: config_key, selector: selector }]}
                .computeLabel=${() => label}
                @value-changed=${(ev) => this._setConfigValue(config_key, ev.detail.value[config_key])}
            ></ha-form>
        `;
    }

    buildSelectField(label, config_key, options, value, default_value) {
        return this.buildFormField(label, config_key, value || default_value, {
            select: { mode: 'dropdown', options: options },
        });
    }

    buildDefaultPeriodSelectField(label, config_key, period_sensor_key, value, default_value = 'current', allow_all_periods = true) {
        if (!this._config.entity) {
            return html``;
        }
        let sensor_prefix = this._config.entity.split('_'+period_sensor_key)[0];
        let active_periods = this.hass.states[`${sensor_prefix}_active_periods`].attributes['periods'];

        let options = [];
        if (allow_all_periods) {
            options.push({value:'all', label: 'All'});
        }
        options.push({value:'current', label: 'Current'});
        for (let period of active_periods) {
            options.push({value: period.id, label: period.name});
        }

        return this.buildSelectField(label, config_key, options, value, default_value);
    }

    buildSwitchField(label, config_key, value, default_value) {
        if (typeof value !== 'boolean') {
            value = default_value;
        }

        return this.buildFormField(label, config_key, value, { boolean: {} });
    }

    buildNumberField(label, config_key, value, default_value, step) {
        return this.buildFormField(label, config_key, value || default_value, {
            number: { mode: 'box', step: step || 1 },
        });
    }

    buildTextField(label, config_key, value, default_value) {
        return this.buildFormField(label, config_key, value || default_value, { text: {} });
    }

    buildEntityPickerField(label, config_key, value, filter) {
        const entityFilter = new RegExp("pronote_[a-z_]+_"+filter);

        return html`
            <ha-entity-picker
                label="${label}"
                .hass=${this.hass}
                .value=${value || ''}
                .configValue=${config_key}
                .includeDomains=${['sensor']}
                .entityFilter="${(entity) => entityFilter.test(entity.entity_id)}"
                @value-changed=${this._valueChanged}
                allow-custom-entity
            ></ha-entity-picker>
        `
    }

    async loadEntityPicker() {
        if (window.customElements.get("ha-entity-picker") && window.customElements.get("ha-form")) {
            return;
        }

        const ch = await window.loadCardHelpers();
        const c = await ch.createCardElement({ type: "entities", entities: [] });
        await c.constructor.getConfigElement();
    }

    static get styles() {
        return css`
            ha-form {
                display: block;
                padding-top: 15px;
            }
        `;
    }
}

export default BasePronoteCardEditor;