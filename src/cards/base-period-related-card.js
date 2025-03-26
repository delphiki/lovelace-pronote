import BasePronoteCard from "./base-card";

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class BasePeriodRelatedPronoteCard extends BasePronoteCard {

    period_filter = 'all';
    allow_all_periods = true;
    items_attribute_key = null;
    period_sensor_key = null;

    getPeriodSwitcher() {
        let active_periods = this.getActivePeriods();
        let tabs = [];
        for (let period of active_periods) {
            let is_last = period === active_periods[active_periods.length - 1];
            
            tabs.push(
                html`<input
                        type="radio"
                        name="pronote-period-switcher" 
                        id="pronote-period-switcher-${period.id}" 
                        value="${period.id}" 
                        @change=${(e) => this.handlePeriodChange(e)}
                    />
                    <label class="pronote-period-switcher-tab" for="pronote-period-switcher-${period.id}">${period.name}</label>`
            );
        }

        if (this.allow_all_periods) {
            tabs.push(html`<input type="radio" name="pronote-period-switcher" id="pronote-period-switcher-all" value="all" @change=${(e) => this.handlePeriodChange(e)} checked />
                <label class="pronote-period-switcher-tab" for="pronote-period-switcher-all">Tout</label>`);
        } else { // ugly hack to force the last period to be checked because it won't work with a condition in the for loop
            tabs.pop();
            let period = active_periods[active_periods.length - 1];
            tabs.push(
                html`<input
                        type="radio"
                        name="pronote-period-switcher" 
                        id="pronote-period-switcher-${period.id}" 
                        value="${period.id}" 
                        @change=${(e) => this.handlePeriodChange(e)}
                        checked
                    />
                    <label class="pronote-period-switcher-tab" for="pronote-period-switcher-${period.id}">${period.name}</label>`
            );
        }

        return html`<div class="pronote-period-switcher">${tabs}</div>`;
    }

    handlePeriodChange(event) {
        this.period_filter = event.target.value;
        this.requestUpdate();
    }

    getActivePeriodsSensor() {
        let sensor_prefix = this.config.entity.split('_'+this.period_sensor_key)[0];
        return this.hass.states[`${sensor_prefix}_active_periods`];
    }

    getActivePeriods() {
        return this.getActivePeriodsSensor().attributes['periods'];
    }

    getAllEntityNames() {
        let active_periods = this.getActivePeriods();
        let entities = [
            this.config.entity
        ];
        for (let period of active_periods) {
            if (!period.is_current_period) {
                entities.push(`${this.config.entity}_${period.id}`);
            }
        }
        return entities;
    }

    getFilteredItems() {
        if (this.period_filter === 'all' && !this.allow_all_periods) {
            this.period_filter = this.getActivePeriods()[this.getActivePeriods().length - 1].id;
        }

        let entity_names = this.getAllEntityNames();
        let items = [];
        for (let entity_name of entity_names) {
            let entity_state = this.hass.states[entity_name];
            if (this.period_filter === 'all' || this.period_filter === entity_state.attributes['period_key']) {
                items.push(...entity_state.attributes[this.items_attribute_key]);
            }
        }
        return items;
    }

    static get styles() {
        return css`
        ${super.styles}
        .pronote-period-switcher {
            display: flex;
            justify-content: center;
            gap: 10px;
            padding:5px;
        }
        .pronote-period-switcher input {
            display: none;
        }
        .pronote-period-switcher-tab {
            padding: 10px;
        }
        .pronote-period-switcher-tab:hover {
            cursor: pointer;
        }
        .pronote-period-switcher input:checked + .pronote-period-switcher-tab {
            background-color: rgba(0,0,0,0.1);
        }
        `;
    }
}

export default BasePeriodRelatedPronoteCard;