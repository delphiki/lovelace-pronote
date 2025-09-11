import BasePeriodRelatedPronoteCard from './base-period-related-card';

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);

const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class PronoteGradesCard extends BasePeriodRelatedPronoteCard {

    header_title = 'Notes de '
    no_data_message = 'Aucune note disponible'
    period_sensor_key = 'grades'
    items_attribute_key = 'grades'

    getFormattedDate(date) {
        return (new Date(date))
            .toLocaleDateString('fr-FR', {weekday: 'short', day: '2-digit', month: '2-digit'})
            .replace(/^(.)/, (match) => match.toUpperCase())
        ;
    }

    getGradeRow(gradeData) {
        let grade = parseFloat(gradeData.grade.replace(',', '.'));

        let grade_classes = [];

        if (this.config.compare_with_ratio !== null) {
            let comparison_ratio = parseFloat(this.config.compare_with_ratio);
            let grade_ratio = grade / parseFloat(gradeData.out_of.replace(',', '.'));
            grade_classes.push(grade_ratio >= comparison_ratio ? 'above-ratio' : 'below-ratio');
        } else if (this.config.compare_with_class_average && gradeData.class_average) {
            let class_average = parseFloat(gradeData.class_average.replace(',', '.'));
            grade_classes.push(grade > class_average ? 'above-average' : 'below-average');
        }

        let formatted_grade = gradeData.grade_out_of;
        if (this.config.grade_format === 'short') {
            formatted_grade = gradeData.grade;
        }

        if (this.config.display_new_grade_notice) {
            let grade_date = new Date(gradeData.date);
            let today = new Date();
            if (
                grade_date.getFullYear() === today.getFullYear()
                && grade_date.getMonth() === today.getMonth()
                && grade_date.getDate() === today.getDate()
            ) {
                grade_classes.push('new-grade');
            }
        }

        return html`
        <tr class="${grade_classes.join(' ')}">
            <td class="grade-color"><span></span></td>
            <td class="grade-description">
                <span class="grade-subject">${gradeData.subject}</span>
                ${this.config.display_comment ? html`<span class="grade-comment">${gradeData.comment}</span>` : ''}
                ${this.config.display_date ? html`<span class="grade-date">${this.getFormattedDate(gradeData.date)}</span>`: ''}
                ${this.config.display_coefficient && gradeData.coefficient ? html`<span class="grade-coefficient">Coef. ${gradeData.coefficient}</span>` : ''}
            </td>
            <td class="grade-detail">
                <span class="grade-value">${formatted_grade}</span>
                ${this.config.display_class_average && gradeData.class_average ? html`<span class="grade-class-average">Moy. ${gradeData.class_average}</span>` : ''}
                ${this.config.display_class_min && gradeData.min ? html`<span class="grade-class-min">Min. ${gradeData.min}</span>` : ''}
                ${this.config.display_class_max && gradeData.max ? html`<span class="grade-class-max">Max. ${gradeData.max}</span>` : ''}
            </td>
        </tr>
        `;
    }

    getCardContent() {
        const stateObj = this.hass.states[this.config.entity];
        const grades = this.getFilteredItems();
        const max_grades = this.config.max_grades ?? grades.length;

        if (stateObj) {

            const gradesRows = [];
            const itemTemplates = [
                this.getPeriodSwitcher()
            ];


            for (let index = 0; index < max_grades; index++) {
                if (index >= grades.length) {
                    break;
                }
                let grade = grades[index];
                gradesRows.push(this.getGradeRow(grade));
            }

            if (gradesRows.length > 0) {
                itemTemplates.push(html`<table>${gradesRows}</table>`);
            } else {
                itemTemplates.push(this.noDataMessage());
            }

            return itemTemplates;
        }
    }

    getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            grade_format: 'full',
            display_header: true,
            display_date: true,
            display_comment: true,
            display_class_average: true,
            compare_with_class_average: true,
            compare_with_ratio: null,
            display_coefficient: true,
            display_class_min: true,
            display_class_max: true,
            display_new_grade_notice: true,
            max_grades: null,
        };
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
            padding-top: 8px;
            text-align: left;
        }
        td.grade-color {
            width: 4px;
            padding-top: 11px;
        }
        td.grade-color > span {
            display:inline-block;
            width: 4px;
            height: 1rem;
            border-radius:4px;
            background-color: grey;
        }
        .above-average .grade-color > span, .above-ratio .grade-color > span {
            background-color: green;
        }
        .below-average .grade-color > span, .below-ratio .grade-color > span {
            background-color: orange;
        }
        .grade-description {
            padding-left: 0;
        }
        .grade-subject {
            display: inline-block;
            font-weight: bold;
            position: relative;
        }
        .new-grade .grade-subject:after {
            content: " ";
            display: block;
            width: 6px;
            height: 6px;
            border-radius: 6px;
            background-color: orange;
            position: absolute;
            top: 6px;
            right: -14px;
        }
        .grade-comment {
            display: block;
        }
        .grade-date, .grade-coefficient {
            font-size: 0.9em;
            color: gray;
        }
        .grade-date + .grade-coefficient:before {
            content: ' - '
        }
        .grade-detail {
            text-align: right;
        }
        .grade-value {
            font-weight: bold;
        }
        .grade-value, .grade-class-average {
            display:block;
        }
        .grade-class-average, .grade-class-min, .grade-class-max {
            font-size: 0.9em;
            color: gray;
        }
        .grade-class-min + .grade-class-max:before {
            content: ' - '
        }
        `;
    }

    static getStubConfig() {
        return {
            grade_format: 'full',
            display_header: true,
            display_date: true,
            display_comment: true,
            display_class_average: true,
            compare_with_class_average: true,
            compare_with_ratio: null,
            display_coefficient: true,
            display_class_min: true,
            display_class_max: true,
            display_new_grade_notice: true,
            max_grades: null,
        }
    }

    static getConfigElement() {
        return document.createElement("pronote-grades-card-editor");
    }
}

customElements.define("pronote-grades-card", PronoteGradesCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "pronote-grades-card",
    name: "Pronote Grades Card",
    description: "Display the grades from Pronote",
    documentationURL: "https://github.com/delphiki/lovelace-pronote?tab=readme-ov-file#grades",
});