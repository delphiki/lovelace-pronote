const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class BasePronoteCard extends LitElement {

    static get properties() {
        return {
            config: {},
            hass: {},
            header_title: { type: String },
            no_data_message: { type: String }
        };
    }

    getCardHeader() {
        let child_attributes = this.hass.states[this.config.entity].attributes;
        let child_name = (typeof child_attributes['nickname'] === 'string' && child_attributes['nickname'].length > 0) ? child_attributes['nickname'] : child_attributes['full_name'];
        return html`<div class="pronote-card-header">${this.header_title} ${child_name}</div>`;
    }

    noDataMessage() {
        return html`<div class="pronote-card-no-data">${this.no_data_message}</div>`;
    }

    render() {
        if (!this.config || !this.hass) {
            return html``;
        }

        const stateObj = this.hass.states[this.config.entity];

        if (stateObj) {

            return html`
                <ha-card id="${this.config.entity}-card">
                    ${this.config.display_header ? this.getCardHeader() : ''}
                    ${this.getCardContent()}
                </ha-card>`
            ;
        }
    }

    static get styles() {
        return css`
        .pronote-card-header {
            text-align:center;
        }
        div {
            padding: 12px;
            font-weight:bold;
            font-size:1em;
        }
        .pronote-card-no-data {
            display:block;
            padding:8px;
            text-align: center;
            font-style: italic;
        }
        `;
    }
}

export default BasePronoteCard;