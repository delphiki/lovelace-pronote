import BasePronoteCard from "./base-card"

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

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

class PronoteMenusCard extends BasePronoteCard {

    getMenuRow(menu) {
        return html`
            ${menu.first_meal.length > 0 ? this.getMealRow(menu.first_meal, 'Entrée') : ''}
            ${menu.main_meal.length > 0 ? this.getMealRow(menu.main_meal, 'Plat principal') : ''}
            ${menu.side_meal.length > 0 ? this.getMealRow(menu.side_meal, 'Accompagnement') : ''}
            ${menu.cheese.length > 0 ? this.getMealRow(menu.cheese, 'Fromage') : ''}
            ${menu.dessert.length > 0 ? this.getMealRow(menu.dessert, 'Dessert') : ''}
        `;
    }

    getMealChoices(meal) {
        let list = html``;
        for (let i = 0; i < meal.length; i++) {
            let choice = meal[i];
            list = html`${list} ${choice.name} <br />`

            let labels = choice.labels;
            if (this.config.display_labels && labels.length > 0) {
                for (let l = 0; l < labels.length; l++) {
                    let label = labels[l];
                    list = html`${list} <span class="pronote-meal-label">${label.name}</span>`;
                }
                list = html`${list} <br />`;
            }

            if (i >= meal.length - 1) {
                break;
            }

            list = html`${list} -<br />`
        }

        return list;
    }

    getMealRow(meal, title) {
        return html`
            <tr>
                <td>
                    ${title}
                </td>
                <td class="pronote-meal-choices">
                    ${this.getMealChoices(meal)}
                </td>
            </tr>
        `;
    }

    getFormattedDate(menu) {
        return (new Date(menu.date))
            .toLocaleDateString('fr-FR', {weekday: 'long', day: '2-digit', month: '2-digit'})
            .replace(/^(.)/, (match) => match.toUpperCase())
        ;
    }

    getDayHeader(menu, daysCount) {
        return html`<div class="pronote-menus-header">
            <span
                class="pronote-menus-header-arrow-left ${daysCount === 0 ? 'disabled' : ''}"
                @click=${(e) => this.changeDay('previous', e)}
            >←</span>
            <span class="pronote-menus-header-date">${this.getFormattedDate(menu)}</span>
            <span
                class="pronote-menus-header-arrow-right"
                @click=${(e) => this.changeDay('next', e)}
            >→</span>
        </div>`;
    }

    changeDay(direction, e) {
        e.preventDefault();
        if (e.target.classList.contains('disabled')) {
            return;
        }

        const activeDay = e.target.parentElement.parentElement;
        let hasPreviousDay = activeDay.previousElementSibling && activeDay.previousElementSibling.classList.contains('pronote-menus-day-wrapper');
        let hasNextDay = activeDay.nextElementSibling && activeDay.nextElementSibling.classList.contains('pronote-menus-day-wrapper');
        let newActiveDay = null;

        if (direction === 'previous' && hasPreviousDay) {
            newActiveDay = activeDay.previousElementSibling;
        } else if (direction === 'next' && hasNextDay) {
            newActiveDay = activeDay.nextElementSibling;
        }

        if (newActiveDay) {
            activeDay.classList.remove('active');
            newActiveDay.classList.add('active');

            hasPreviousDay = newActiveDay.previousElementSibling && newActiveDay.previousElementSibling.classList.contains('pronote-menus-day-wrapper');
            hasNextDay = newActiveDay.nextElementSibling && newActiveDay.nextElementSibling.classList.contains('pronote-menus-day-wrapper');

            if (!hasPreviousDay) {
                newActiveDay.querySelector('.pronote-menus-header-arrow-left').classList.add('disabled');
            }

            if (!hasNextDay) {
                newActiveDay.querySelector('.pronote-menus-header-arrow-right').classList.add('disabled');
            }
        }
    }

    // we override the render method to return the card content
    render() {
        if (!this.config || !this.hass) {
            return html``;
        }

        const stateObj = this.hass.states[this.config.entity];

        const menus = this.hass.states[this.config.entity].attributes['menus']

        if (stateObj) {
            const currentWeekNumber = new Date().getWeekNumber();

            const itemTemplates = [];
            let daysCount = 0;

            let now = new Date();
            let activeDay = 0;

            for (let index = 0; index < menus.length; index++) {
                let menu = menus[index];
                let lunchPassedAt = new Date(menu.date);
                lunchPassedAt.setHours(14, 0, 0, 0);

                if (
                    this.config.switch_to_next_day
                    && isSameDay(lunchPassedAt, now) && lunchPassedAt < now
                ) {
                    activeDay = daysCount + 1;
                }

                if (this.config.current_week_only) {
                    if (new Date(menu.date).getWeekNumber() > currentWeekNumber) {
                        break;
                    }
                }

                itemTemplates.push(html`
                    <div class="${this.config.enable_slider ? 'slider-enabled' : ''} pronote-menus-day-wrapper ${daysCount === activeDay ? 'active' : ''}">
                        ${this.getDayHeader(menu, daysCount)}
                        ${this.config.display_menu_name ? html`<div class="pronote-menus-name">${menu.name}</div>` : ''}
                        <table>${this.getMenuRow(menu)}</table>
                    </div>
                `);

                daysCount++;
                if (this.config.max_days && this.config.max_days <= daysCount) {
                    break;
                }
            }

            return html`
                <ha-card id="${this.config.entity}-card" class="pronote-menus-card-slider">
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
            display_menu_name: true,
            display_labels: true,
            max_days: null,
            current_week_only: false,
            switch_to_next_day: false,
        }

        this.config = {
            ...defaultConfig,
            ...config
        };

        this.header_title = 'Menus de la cantine de ';
        this.no_data_message = 'Pas de menus à afficher';
    }

    static get styles() {
        return css`
        ${super.styles}
        .pronote-menus-card-slider .pronote-menus-day-wrapper {
            display: none;
        }
        .pronote-menus-card-slider .pronote-menus-day-wrapper.active {
            display: block;
        }
        .pronote-menus-header {
            text-align: center;
        }
        .pronote-menus-card-slider .pronote-menus-header-date {
            display: inline-block;
            text-align: center;
            width: 120px;
        }
        .pronote-menus-header-arrow-left,
        .pronote-menus-header-arrow-right {
            cursor: pointer;
        }
        .pronote-menus-header-arrow-left.disabled,
        .pronote-menus-header-arrow-right.disabled {
            opacity: 0.3;
            pointer-events: none;
        }
        .pronote-menus-name {
            font-weight: lighter;
            font-style: italic;
            max-width: 90%;
            margin:auto;
            padding: 5px;
            text-align:center;
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
            padding: 10px;
            text-align: center;
        }
        tr td:first-child {
            width: 40%;
        }
        .pronote-meal-label {
            font-weight: lighter;
            font-size: 0.9em;
        }
        .pronote-meal-label + .pronote-meal-label:before {
            content: ' / '
        }
        `;
    }

    static getStubConfig() {
        return {
            display_header: true,
            display_menu_name: true,
            display_labels: true,
            max_days: null,
            current_week_only: false,
            switch_to_next_day: false,
        }
    }

    static getConfigElement() {
        return document.createElement("pronote-menus-card-editor");
    }
}

customElements.define("pronote-menus-card", PronoteMenusCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "pronote-menus-card",
    name: "Pronote Menus Card",
    description: "Display the menus from Pronote",
    documentationURL: "https://github.com/delphiki/lovelace-pronote?tab=readme-ov-file#menus",
});