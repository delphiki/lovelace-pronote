const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class PronoteAveragesCard extends LitElement {

    static get properties() {
        return {
            config: {},
            hass: {}
        };
    }

    getCardHeader() {
        let child_sensor = this.config.entity.split('_averages')[0];
        let child_attributes = this.hass.states[child_sensor].attributes;
        let child_name = (typeof child_attributes['nickname'] === 'string' && child_attributes['nickname'].length > 0) ? child_attributes['nickname'] : child_attributes['full_name'];
        return html`<div class="pronote-card-header">Moyennes de ${child_name}</div>`;
    }

    getAverageRow(averageData) {
        let average = parseFloat(averageData.average.replace(',', '.'));

        let average_classes = [];

        if (this.config.compare_with_ratio !== null) {
            let comparison_ratio = parseFloat(this.config.compare_with_ratio);
            let average_ratio = average / parseFloat(averageData.out_of.replace(',', '.'));
            average_classes.push(average_ratio >= comparison_ratio ? 'above-ratio' : 'below-ratio');
        } else if (this.config.compare_with_class_average && averageData.class) {
            let class_average = parseFloat(averageData.class.replace(',', '.'));
            average_classes.push(average > class_average ? 'above-average' : 'below-average');
        }

        let formatted_average = averageData.average+'/'+averageData.out_of;
        if (this.config.average_format === 'short') {
            formatted_average = averageData.average;
        }

        return html`
        <tr class="${average_classes.join(' ')}">
            <td class="average-color"><span style="background-color:${averageData.background_color}"></span></td>
            <td class="average-description">
                <span class="average-subject">${averageData.subject}</span>
            </td>
            <td class="average-detail">
                <span class="average-value">${formatted_average}</span>
                ${this.config.display_class_average && averageData.class ? html`<span class="average-class-average">Classe ${averageData.class}</span>` : ''}
                ${this.config.display_class_min && averageData.min ? html`<span class="average-class-min">Min. ${averageData.min}</span>` : ''}
                ${this.config.display_class_max && averageData.max ? html`<span class="average-class-max">Max. ${averageData.max}</span>` : ''}
            </td>
        </tr>
        `;
    }

    render() {
        if (!this.config || !this.hass) {
            return html``;
        }

        const stateObj = this.hass.states[this.config.entity];
        const averages = this.hass.states[this.config.entity].attributes['averages']

        if (stateObj) {

            const averagesRows = [];
            const itemTemplates = [];


            for (let index = 0; index < averages.length; index++) {
                let average = averages[index];
                averagesRows.push(this.getAverageRow(average));
            }

            if (averagesRows.length > 0) {
                itemTemplates.push(html`<table>${averagesRows}</table>`);
            } else {
                itemTemplates.push(html`<span class="no-average">Pas de moyenne à afficher</span>`);
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
            average_format: 'full',
            display_header: true,
            display_class_average: true,
            compare_with_class_average: true,
            compare_with_ratio: null,
            display_class_min: true,
            display_class_max: true,
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
        .no-average {
            display:block;
            padding:8px;
            text-align: center;
            font-style: italic;
        }
        table {
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
        td.average-comparison-color, td.average-color {
            width: 4px;
            padding-top: 11px;
        }
        td.average-comparison-color > span, td.average-color > span {
            display:inline-block;
            width: 4px;
            height: 1rem;
            border-radius:4px;
            background-color: grey;
        }

        .above-average .average-detail, .above-ratio .average-detail,
        .below-average .average-detail, .below-ratio .average-detail {
            position: relative;
        }
        .above-average span.average-value, .above-ratio span.average-value,
        .below-average span.average-value, .below-ratio span.average-value {
            padding-right: 16px;
        }
        .above-average span.average-value:before, .above-ratio span.average-value:before,
        .below-average span.average-value:before, .below-ratio span.average-value:before {
            content: ' ';
            display: block;
            width: 10px;
            height: 10px;
            border-radius: 5px;
            position: absolute;
            right: 10px;
            top: 13px;
        }
        .above-average span.average-value:before, .above-ratio span.average-value:before {
            background-color: green;
        }
        .below-average span.average-value:before, .below-ratio span.average-value:before {
            background-color: orange;
        }
        .average-description {
            padding-left: 0;
        }
        .average-subject {
            display: inline-block;
            font-weight: bold;
            position: relative;
        }
        .average-detail {
            text-align: right;
        }
        .average-value {
            font-weight: bold;
        }
        .average-value, .average-class-average {
            display:block;
        }
        .average-class-average, .average-class-min, .average-class-max {
            font-size: 0.9em;
            color: gray;
        }
        .average-class-min + .average-class-max:before {
            content: ' - '
        }
        `;
    }

    static getStubConfig() {
        return {
            average_format: 'full',
            display_header: true,
            display_class_average: true,
            compare_with_class_average: true,
            compare_with_ratio: null,
            display_class_min: true,
            display_class_max: true,
        }
    }

    static getConfigElement() {
        return document.createElement("pronote-averages-card-editor");
    }
}

customElements.define("pronote-averages-card", PronoteAveragesCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "pronote-averages-card",
    name: "Pronote Averages Card",
    description: "Display the averages from Pronote",
    documentationURL: "https://github.com/delphiki/lovelace-pronote?tab=readme-ov-file#averages",
});