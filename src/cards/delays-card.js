const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class PronoteDelaysCard extends LitElement {
    static get properties() {
        return {
            config: {},
            hass: {}
        };
    }

    // Récupère l'en-tête de la carte
    getCardHeader() {
        const childSensor = this.config.entity.split('_delays')[0];
        const childAttributes = this.hass.states[childSensor].attributes;
        const childName = (typeof childAttributes['nickname'] === 'string' && childAttributes['nickname'] !== '')
            ? childAttributes['nickname']
            : childAttributes['full_name'];

        // Utilise le nom personnalisé si défini dans la configuration
        const displayName = (this.config.child_name !== null)
            ? this.config.child_name
            : childName;

        return html`<div class="pronote-card-header">Retards de ${displayName}</div>`;
    }

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
    render() {
        if (!this.config || !this.hass) {
            return html``;
        }

        const stateObj = this.hass.states[this.config.entity];
        const delays = stateObj.attributes['delays'];

        if (stateObj) {
            const itemTemplates = [];
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
                itemTemplates.push(html`<span class="no-data">Pas de retard à afficher</span>`);
            }

            // Ajoute l'en-tête de la carte si l'option est activée dans la configuration
            const cardContent = html`
                <ha-card id="${this.config.entity}-card">
                    ${this.config.display_header ? this.getCardHeader() : ''}
                    ${itemTemplates}
                </ha-card>
            `;

            return cardContent;
        }
    }

    // Définit la configuration de la carte
    setConfig(config) {
        if (!config.entity) {
            throw new Error('You need to define an entity');
        }

        const defaultConfig = {
            entity: null,
            display_header: true,
            max_delays: null,
            child_name: null
        }

        this.config = {
            ...defaultConfig,
            ...config
        };
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
        .no-data {
            display:block;
            padding:8px;
            text-align: center;
            font-style: italic;
        }
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
}

customElements.define("pronote-delays-card", PronoteDelaysCard);
