import {unsafeHTML} from 'https://unpkg.com/lit-html@2.8.0/directives/unsafe-html.js?module';

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

Date.prototype.getWeekNumber = function () {
    var d = new Date(+this);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
};

class PronoteHomeworkCard extends LitElement {

    lunchBreakRendered = false;

    static get properties() {
        return {
            config: {},
            hass: {}
        };
    }

    getCardHeader() {
        let child_sensor = this.config.entity.split('_homework')[0];
        let child_attributes = this.hass.states[child_sensor].attributes;
        let child_name = (typeof child_attributes['nickname'] === 'string' && child_attributes['nickname'] !== '') ? child_attributes['nickname'] : child_attributes['full_name'];
        return html`<div class="pronote-card-header">Devoirs de ${child_name}</div>`;
    }

    getFormattedDate(date) {
        return (new Date(date))
            .toLocaleDateString('fr-FR', {weekday: 'long', day: '2-digit', month: '2-digit'})
            .replace(/^(.)/, (match) => match.toUpperCase())
        ;
    }

    getFormattedTime(time) {
        return new Intl.DateTimeFormat("fr-FR", {hour:"numeric", minute:"numeric"}).format(new Date(time));
    }

    getDayHeader(homework) {
        return html`<div class="pronote-homework-header">
            <span>${this.getFormattedDate(homework.date)}</span>
        </div>`;
    }

    getHomeworkRow(homework, index) {
        let description = homework.description.trim().replace("\n", "<br />");
        let files = [];
        homework.files.forEach((file) => {
            if (file.name.trim() === '') {
                return;
            }
            files.push(html`<span class="homework-file">➤ <a href="${file.url}">${file.name}</a></span>`);
        });


        return html`
        <tr class="${homework.done ? 'homework-done':''}">
            <td class="homework-color"><span style="background-color:${homework.background_color}"></span></td>
            <td class="homework-detail">
                <label for="homework-${index}">
                    <span class="homework-subject">${homework.subject}</span>
                </label>
                <input type="checkbox" id="homework-${index}" />
                <span class="homework-description">${unsafeHTML(description)}</span>
                ${files.length > 0 ? html`<span class="homework-files">${files}</span>` : ''}
            </td>
            <td class="homework-status">
                <span>${homework.done ? html`<ha-icon icon="mdi:check"></ha-icon>` : html`<ha-icon icon="mdi:account-clock"></ha-icon>`}</span>
            </td>
        </tr>
        `;
    }

    render() {
        if (!this.config || !this.hass) {
            return html``;
        }

        const stateObj = this.hass.states[this.config.entity];
        const homework = this.hass.states[this.config.entity].attributes['homework'];

        if (stateObj) {
            const currentWeekNumber = new Date().getWeekNumber();
            const itemTemplates = [];
            let dayTemplates = [];

            if (homework && homework.length > 0) {
                let latestHomeworkDay = this.getFormattedDate(homework[0].date);
                for (let index = 0; index < homework.length; index++) {
                    let hw = homework[index];
                    let currentFormattedDate = this.getFormattedDate(hw.date);

                    if (hw.done === true && this.config.display_done_homework === false) {
                        continue;
                    }

                    if (latestHomeworkDay !== currentFormattedDate) {
                        if (dayTemplates.length > 0) {
                            itemTemplates.push(this.getDayHeader(homework[index-1]));
                            itemTemplates.push(html`<table class="${this.config.reduce_done_homework ? 'reduce-done' : ''}">${dayTemplates}</table>`);
                            dayTemplates = [];
                        }

                        latestHomeworkDay = currentFormattedDate;
                    }

                    if (this.config.current_week_only && new Date(hw.date).getWeekNumber() !== currentWeekNumber) {
                        break;
                    }

                    dayTemplates.push(this.getHomeworkRow(hw, index));
                }

                if (dayTemplates.length > 0 && (
                    !this.config.current_week_only
                    || (this.config.current_week_only && currentWeekNumber === new Date(homework[homework.length-1].date).getWeekNumber())
                )) {
                    itemTemplates.push(this.getDayHeader(homework[homework.length-1]));
                    itemTemplates.push(html`<table class="${this.config.reduce_done_homework ? 'reduce-done' : ''}">${dayTemplates}</table>`);
                }
            }

            if (itemTemplates.length === 0) {
                itemTemplates.push(html`<span class="no-homework">Pas de devoirs à faire</span>`);
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
            current_week_only: true,
            reduce_done_homework: true,
            display_done_homework: true,
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
        .no-homework {
            display:block;
            padding:8px;
            text-align: center;
            font-style: italic;
        }
        .pronote-homework-header {
            border-bottom: 2px solid grey;
        }
        table{
            font-size: 0.9em;
            font-family: Roboto;
            width: 100%;
            outline: 0px solid #393c3d;
            border-collapse: collapse;
        }
        td {
            vertical-align: top;
            padding: 5px 10px 5px 10px;
            padding-top: 8px;
            text-align: left;
        }
        td.homework-color {
            width: 4px;
            padding-top: 11px;
        }
        td.homework-color > span {
            display:inline-block;
            width: 4px;
            height: 1rem;
            border-radius:4px;
            background-color: grey;
        }
        td.homework-detail {
            padding:0;
            padding-top: 8px;
            padding-bottom: 8px;
        }
        span.homework-subject {
            display:block;
            font-weight:bold;
        }
        span.homework-description {
            font-size: 0.9em;
        }
        span.homework-files {
            display: block;
        }
        span.homework-files .homework-file {
            display: inline-block;
        }
        td.homework-status {
            width: 5%;
        }
        .reduce-done .homework-done label:hover {
            cusor: pointer;
        }
        .reduce-done .homework-done .homework-description {
            display: none;
        }
        .reduce-done .homework-done input:checked + .homework-description {
            display: block;
        }
        .homework-detail input {
            display: none;
        }
        `;
    }

    static getStubConfig() {
        return {
            display_header: true,
            current_week_only: true,
            reduce_done_homework: true,
            display_done_homework: true,
        }
    }

    static getConfigElement() {
        return document.createElement("pronote-homework-card-editor");
    }
}

customElements.define("pronote-homework-card", PronoteHomeworkCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "pronote-homework-card",
    name: "Pronote Homework Card",
    description: "Display the homework from Pronote",
    documentationURL: "https://github.com/delphiki/lovelace-pronote?tab=readme-ov-file#homework",
});
