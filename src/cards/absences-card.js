import BasePeriodRelatedPronoteCard from './base-period-related-card';

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class PronoteAbsencesCard extends BasePeriodRelatedPronoteCard {

    getAbsencesRow(absence) {
        let from = this.getFormattedDate(absence.from);
        let to = this.getFormattedDate(absence.to);
        let content = html`
        <tr>
            <td class="absence-status">
                <span>${absence.justified ? html`<ha-icon icon="mdi:check"></ha-icon>` : html`<ha-icon icon="mdi:clock-alert-outline"></ha-icon>`}</span>
            </td>
            <td><span style="background-color:${absence.justified ? '#107c41' : '#e73a1f'}"></span></td>
            <td><span class="absence-from">${from} au ${to}</span><br><span class="absence-hours">${absence.hours} de cours manquées</span>
        </td>
            <td>
                <span class="absence-reason">${absence.reason}</span>
            </td>
        </tr>
        `
        return html`${content}`;
    }

    getFormattedDate(date) {
        return (new Date(date)) ? new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/^(.)/, (match) => match.toUpperCase()) : '';
    }

    getCardContent() {
        const stateObj = this.hass.states[this.config.entity];

        if (stateObj) {
            const absences = this.getFilteredItems();
            const itemTemplates = [
                this.getPeriodSwitcher()
            ];
            let dayTemplates = [];
            let absencesCount = 0;
            for (let index = 0; index < absences.length; index++) {
                absencesCount++;
                if (this.config.max_absences && this.config.max_absences < absencesCount) {
                    break;
                }
                let absence = absences[index];
                dayTemplates.push(this.getAbsencesRow(absence));
            }

            if (absencesCount > 0) {
                itemTemplates.push(html`<table>${dayTemplates}</table>`);
            } else {
                itemTemplates.push(this.noDataMessage());
            }

            return itemTemplates;
        }
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error('You need to define an entity');
        }

        const defaultConfig = {
            entity: null,
            display_header: true,
            max_absences: null
        }

        this.config = {
            ...defaultConfig,
            ...config
        };

        this.period_sensor_key = 'absences';
        this.items_attribute_key = 'absences';
        this.header_title = 'Absences de ';
        this.no_data_message = 'Aucune absence';
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
            width: 10%;
            text-align:right;
        }
        span.absence-reason {
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
        span.absence-from {
            font-weight:bold;
            padding: 4px;
            border-radius: 4px;
        }
        span.absence-hours {
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
            max_absences: null,
        }
    }

    static getConfigElement() {
        return document.createElement("pronote-absences-card-editor");
    }
}

customElements.define("pronote-absences-card", PronoteAbsencesCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "pronote-absences-card",
    name: "Pronote Absences Card",
    description: "Display the absences from Pronote",
    documentationURL: "https://github.com/delphiki/lovelace-pronote?tab=readme-ov-file#absences",
});
