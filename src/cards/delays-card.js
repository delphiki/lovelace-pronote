import BasePeriodRelatedPronoteCard from './base-period-related-card';

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class PronoteDelaysCard extends BasePeriodRelatedPronoteCard {

    header_title = 'Retards de '
    no_data_message = 'Aucun retard'
    period_sensor_key = 'delays'
    items_attribute_key = 'delays'

    // Génère une ligne pour un retard donné
    getDelaysRow(delay) {
        const date = this.getFormattedDate(delay.date);

        const rowContent = html`
            <tr>
                <td class="delay-status">
                    <span>
                        ${delay.justified
                            ? html`<ha-icon icon="mdi:check"></ha-icon>`
                            : html`<ha-icon icon="mdi:clock-alert-outline"></ha-icon>`}
                    </span>
                </td>
                <td>
                    <span style="background-color: ${delay.justified ? '#107c41' : '#e73a1f'}"></span>
                </td>
                <td>
                    <span class="delay-from">${date}</span>
                    <br>
                    <span class="delay-hours">${delay.minutes} minutes de retard</span>
                </td>
                <td>
                    <span class="delay-reason">${delay.reasons}</span>
                </td>
            </tr>
        `;

        return html`${rowContent}`;
    }

    // Formate la date d'un retard
    getFormattedDate(date) {
        return (new Date(date))
            ? new Date(date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
                }).replace(/^(.)/, (match) => match.toUpperCase())
            : '';
    }

    // Génère le rendu de la carte
    getCardContent() {
        const stateObj = this.hass.states[this.config.entity];

        if (stateObj) {

            const delays = this.getFilteredItems();
            const itemTemplates = [
                this.getPeriodSwitcher()
            ];
            let dayTemplates = [];
            let delaysCount = 0;

            // Génère les lignes pour chaque retard, en respectant la limite maximale si définie
            for (let index = 0; index < delays.length; index++) {
                delaysCount++;

                if (this.config.max_delays && this.config.max_delays < delaysCount) {
                    break;
                }

                const currentDelay = delays[index];
                dayTemplates.push(this.getDelaysRow(currentDelay));
            }

            if (dayTemplates.length > 0) {
                itemTemplates.push(html`<table>${dayTemplates}</table>`);
            } else {
                itemTemplates.push(this.noDataMessage());
            }

            return itemTemplates;
        }
    }

    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            display_header: true,
            max_delays: null,
        }
    }

    static get styles() {
        return css`
        ${super.styles}
        table{
            clear:both;
            font-size: 0.9em;
            font-family: Roboto;
            width: 100%;
            outline: 0px solid #393c3d;
            border-collapse: collapse;
        }
        tr:nth-child(odd) {
            background-color: rgba(0,0,0,0.1);
        }
        td {
            vertical-align: middle;
            padding: 5px 10px 5px 10px;
            text-align: left;
        }
        tr td:first-child {
            width: 13%;
            text-align:right;
        }
        span.delay-reason {
            font-weight:bold;
            display:block;
        }
        tr td:nth-child(2) {
            width: 4px;
            padding: 5px 0;
        }
        tr td:nth-child(2) > span {
            display:inline-block;
            width: 4px;
            height: 3rem;
            border-radius:4px;
            background-color: grey;
            margin-top:4px;
        }
        span.delay-from {
            color: white;
            font-weight:bold;
            padding: 4px;
            border-radius: 4px;
        }
        span.delay-hours {
            font-size: 0.9em;
            padding: 4px;
        }
        table + div {
            border-top: 1px solid white;
        }
        `;
    }

    static getStubConfig() {
        return {
            display_header: true,
            max_delays: null,
        }
    }

    static getConfigElement() {
        return document.createElement("pronote-delays-card-editor");
    }
}

customElements.define("pronote-delays-card", PronoteDelaysCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "pronote-delays-card",
    name: "Pronote Delays Card",
    description: "Display the delays from Pronote",
    documentationURL: "https://github.com/delphiki/lovelace-pronote?tab=readme-ov-file#delays",
});