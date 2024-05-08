const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class PronoteAbsencesCard extends LitElement {

    static get properties() {
        return {
            config: {},
            hass: {}
        };
    }

    getCardHeader() {
        let child_sensor = this.config.entity.split('_absences')[0];
        let child_attributes = this.hass.states[child_sensor].attributes;
        let child_name = (typeof child_attributes['nickname'] === 'string' && child_attributes['nickname'].length > 0) ? child_attributes['nickname'] : child_attributes['full_name'];
        child_name = (this.config.child_name !== null) ? this.config.child_name : child_name;
        return html`<div class="pronote-card-header">Absences de ${child_name}</div>`;
    }

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

    render() {
        if (!this.config || !this.hass) {
            return html``;
        }

        const stateObj = this.hass.states[this.config.entity];
        const absences = stateObj.attributes['absences']

        if (stateObj) {
            const itemTemplates = [];
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
                itemTemplates.push(html`<span class="no-absence">Pas d'absence à afficher</span>`)
            }

            return html`
                <ha-card id="${this.config.entity}-card">
                    ${this.config.display_header ? this.getCardHeader() : ''}
                    ${itemTemplates}
                </ha-card>`
            ;
        }
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error('You need to define an entity');
        }

        const defaultConfig = {
            entity: null,
            display_header: true,
            max_absences: null,
            child_name: null,
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
        .no-absence {
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
            color: white;
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
}

customElements.define("pronote-absences-card", PronoteAbsencesCard);