import BasePeriodRelatedPronoteCard from "./base-period-related-card";

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class PronoteEvaluationsCard extends BasePeriodRelatedPronoteCard {

    header_title = 'Evaluations de '
    no_data_message = 'Pas d\'évaluation à afficher'
    period_sensor_key = 'evaluations'
    items_attribute_key = 'evaluations'

    getFormattedDate(date) {
        return (new Date(date))
            .toLocaleDateString('fr-FR', {weekday: 'short', day: '2-digit', month: '2-digit'})
            .replace(/^(.)/, (match) => match.toUpperCase())
        ;
    }

    getAcquisitionRow(acquisition) {
        return html`<tr class="acquisition-row">
            <td>${acquisition.name}</td>
            <td>${this.getAcquisitionIcon(acquisition)}</td>
        </tr>`;
    }

	getAcquisitionIcon(acquisition) {
		const remappedEvaluations = this.config.mapping_evaluations[acquisition.abbreviation] || acquisition.abbreviation;
		let icon = '';
		if (remappedEvaluations === 'A+') {
			icon = '+';
		} else if (remappedEvaluations === 'Abs') {
			icon = 'a';
		}
		return html`
			<span title="${remappedEvaluations}" class="acquisition-icon acquisition-icon-${remappedEvaluations.replace('+', 'plus')}">
				${icon}
			</span>
		`;
	}

    getEvaluationRow(evaluation, index, lessons_colors) {
        let acquisitions = evaluation.acquisitions;
        let acquisitionIcons = [];
        let acquisitionsRows = [];
        let lesson_background_color = lessons_colors[evaluation.subject];

        for (let i = 0; i < acquisitions.length; i++) {
            acquisitionIcons.push(this.getAcquisitionIcon(acquisitions[i]));
            acquisitionsRows.push(this.getAcquisitionRow(acquisitions[i]));
        }

        return html`
        <tr class="evaluation-row">
            <td class="evaluation-color"><span style="background-color:${lesson_background_color}"></span></td>
            <td class="evaluation-description">
                <label for="evaluation-full-detail-${index}">
                    <span class="evaluation-subject">${evaluation.subject}</span>
                </label>
                ${this.config.display_teacher ? html`<span class="evaluation-teacher">${evaluation.teacher}</span>` : ''}
                <input type="checkbox" id="evaluation-full-detail-${index}" />
                ${this.config.display_comment ? html`<span class="evaluation-comment">${evaluation.name}</span>` : ''}
                ${this.config.display_description ? html`<span class="evaluation-description">${evaluation.description}</span>` : ''}
                ${this.config.display_date ? html`<span class="evaluation-date">${this.getFormattedDate(evaluation.date)}</span>`: ''}
                ${this.config.display_coefficient && evaluation.coefficient ? html`<span class="evaluation-coefficient">Coef. ${evaluation.coefficient}</span>` : ''}
            </td>
            <td class="evaluation-detail">
                ${acquisitionIcons}
            </td>
        </tr>
        ${acquisitionsRows}
        `;
    }

    getCardContent() {
        const stateObj = this.hass.states[this.config.entity];

        if (stateObj) {
            const evaluations = this.getFilteredItems();
            const max_evaluations = this.config.max_evaluations ?? evaluations.length;

            const evaluationsRows = [];
            const itemTemplates = [
                this.getPeriodSwitcher()
            ];

            // Va chercher les couleurs des matières
            const lessons = this.hass.states[this.config.entity.replace("_evaluations", "_period_s_timetable")].attributes['lessons']
            var lessons_colors = {};
            if (lessons) {
                for (let index = 0; index < lessons.length; index++) {
                    let lesson = lessons[index];
                    lessons_colors[lesson.lesson]=lesson.background_color;
                }
            }

            for (let index = 0; index < max_evaluations; index++) {
                let evaluation = evaluations[index];
                evaluationsRows.push(this.getEvaluationRow(evaluation, index, lessons_colors));
            }

            if (evaluationsRows.length > 0) {
                itemTemplates.push(html`<table>${evaluationsRows}</table>`);
            } else {
                itemTemplates.push(this.noDataMessage());
            }

            return itemTemplates;
        }

        return [];
    }

    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            display_header: true,
            display_description: true,
            display_teacher: true,
            display_date: true,
            display_comment: true,
            display_coefficient: true,
            max_evaluations: null,
            mapping_evaluations: {},
        }
    }

    static get styles() {
        return css`
        ${super.styles}
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
            text-align: left;
        }
        td.evaluation-color {
            width: 4px;
            padding-top: 11px;
        }
        td.evaluation-color > span {
            display:inline-block;
            width: 4px;
            height: 2rem;
            border-radius:4px;
            background-color: grey;
        }
        .above-average .evaluation-color > span, .above-ratio .evaluation-color > span {
            background-color: green;
        }
        .below-average .evaluation-color > span, .below-ratio .evaluation-color > span {
            background-color: orange;
        }
        .evaluation-subject {
            font-weight: bold;
            display: block;
        }
        .evaluation-description {
            display: block;
        }
        .evaluation-teacher {
            display: block;
        }
        .evaluation-date, .evaluation-coefficient {
            font-size: 0.9em;
            color: gray;
        }
        .evaluation-comment {
            display: block;
        }		
        .evaluation-date + .evaluation-coefficient:before {
            content: ' - '
        }
        .evaluation-detail {
            text-align: right;
        }
        .evaluation-value {
            font-weight: bold;
        }
        .acquisition-icon {
            display: inline-block;
            width:14px;
            height:14px;
            border-radius:50%;
            border: solid 0.02em rgba(0, 0, 0, 0.5);
            margin-left: 4px;
            vertical-align: middle; 
            color: white;
            content: '+';
            text-align:center;
            line-height:14px;
        }
        .acquisition-icon-Aplus {
            background-color: #008000;
        }
        .acquisition-icon-A {
            background-color: #45B851;
        }
        .acquisition-icon-B {
            background-color: ;
        }
        .acquisition-icon-C {
            background-color: #FFDA01;
        }
        .acquisition-icon-D {
            background-color: #F80A0A;
        }
        .acquisition-icon-E {
            background-color: #F80A0A;
        }
        .acquisition-row {
            display: none;
        }
        input[type="checkbox"] {
            display: none;
        }
        /** FIXME
        .evaluation-row:has(input:checked) .acquisition-icon {
            display:none;
        }
        .evaluation-row:has(input:checked) + .acquisition-row {
            display: table-row;
        }
        */
        .acquisition-row td:nth-child(2) {
            text-align: right;
        }
        `;
    }

    static getStubConfig() {
        return {
            display_header: true,
            display_description: true,
            display_teacher: true,
            display_date: true,
            display_comment: true,
            display_coefficient: true,
            max_evaluations: null,
            mapping_evaluations: {},
        }
    }

    static getConfigElement() {
        return document.createElement("pronote-evaluations-card-editor");
    }
}

customElements.define("pronote-evaluations-card", PronoteEvaluationsCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "pronote-evaluations-card",
    name: "Pronote Evaluations Card",
    description: "Display the evaluations from Pronote",
    documentationURL: "https://github.com/delphiki/lovelace-pronote?tab=readme-ov-file#evaluations",
});