import BasePronoteCard from "./base-card"

const LitElement = Object.getPrototypeOf(
    customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

const HOUR_HEIGHT = 60;
const START_HOUR = 8;
const END_HOUR = 18;

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

function getDecimalHour(dateStr) {
    const d = new Date(dateStr);
    return d.getHours() + d.getMinutes() / 60;
}

class PronoteTimetableCard extends BasePronoteCard {

    lunchBreakRendered = false;

    // =====================
    // List mode methods
    // =====================

    getBreakRow(label, ended) {
        return html`
        <tr class="lunch-break ${ended ? 'lesson-ended' : ''}">
            <td></td>
            <td><span></span></td>
            <td colspan="2">
                <span class="lesson-name">${label}</span>
            </td>
        </tr>`;
    }

    getTimetableRow(lesson) {
        let currentDate = new Date();
        let startAt = Date.parse(lesson.start_at);
        let endAt = Date.parse(lesson.end_at);

        let prefix = html``;
        if (this.config.display_lunch_break && lesson.is_afternoon && !this.lunchBreakRendered) {
            prefix = this.getBreakRow('Repas', this.config.dim_ended_lessons && startAt < currentDate);
            this.lunchBreakRendered = true;
        }

        let content = html`
        <tr class="${lesson.canceled ? 'lesson-canceled':''} ${this.config.dim_ended_lessons && endAt < currentDate ? 'lesson-ended' : ''}">
            <td>
                ${lesson.start_time}<br />
                ${lesson.end_time}
            </td>
            <td><span style="background-color:${lesson.background_color}"></span></td>
            <td>
                <span class="lesson-name">${lesson.lesson}</span>
                ${this.config.display_classroom ? html`<span class="lesson-classroom">
                    ${lesson.classroom ? 'Salle '+lesson.classroom : ''}
                    ${lesson.classroom && this.config.display_teacher ? ', ' : '' }
                </span>` : '' }
                ${this.config.display_teacher ? html`<span class="lesson-teacher">
                    ${lesson.teacher_name}
                </span>`: '' }
            </td>
            <td>
                ${lesson.status ? html`<span class="lesson-status">${lesson.status}</span>`:''}
            </td>
        </tr>
        `
        return html`${prefix}${content}`;
    }

    // =====================
    // Timeline mode methods
    // =====================

    getTimelineScale() {
        const markers = [];
        for (let h = START_HOUR; h <= END_HOUR; h++) {
            const top = (h - START_HOUR) * HOUR_HEIGHT;
            markers.push(html`
                <div class="timeline-hour-row" style="top: ${top}px">
                    <span class="timeline-hour-label">${h}h</span>
                    <span class="timeline-hour-line"></span>
                </div>
            `);
        }
        return markers;
    }

    getLessonBlock(lesson) {
        const currentDate = new Date();
        const startAt = Date.parse(lesson.start_at);
        const endAt = Date.parse(lesson.end_at);

        const startHour = getDecimalHour(lesson.start_at);
        const endHour = getDecimalHour(lesson.end_at);
        const top = (startHour - START_HOUR) * HOUR_HEIGHT;
        const height = (endHour - startHour) * HOUR_HEIGHT;

        return html`
        <div class="timeline-lesson ${lesson.canceled ? 'lesson-canceled' : ''} ${this.config.dim_ended_lessons && endAt < currentDate ? 'lesson-ended' : ''}"
             style="top: ${top}px; height: ${height}px">
            <span class="timeline-lesson-color" style="background-color:${lesson.background_color}"></span>
            <div class="timeline-lesson-content">
                <span class="lesson-name">${lesson.lesson}</span>
                ${this.config.display_classroom ? html`<span class="lesson-classroom">
                    ${lesson.classroom ? 'Salle ' + lesson.classroom : ''}
                    ${lesson.classroom && this.config.display_teacher ? ', ' : ''}
                </span>` : ''}
                ${this.config.display_teacher ? html`<span class="lesson-teacher">
                    ${lesson.teacher_name}
                </span>` : ''}
            </div>
            <div class="timeline-lesson-right">
                <span class="lesson-times">${lesson.start_time} - ${lesson.end_time}</span>
                ${lesson.status ? html`<span class="lesson-status">${lesson.status}</span>` : ''}
            </div>
        </div>
        `;
    }

    getLunchBreakBlock(dayLessons) {
        if (!this.config.display_lunch_break) return html``;

        let lastMorningEnd = null;
        let firstAfternoonStart = null;

        for (const lesson of dayLessons) {
            if (lesson.canceled) continue;
            if (lesson.is_morning) {
                const end = getDecimalHour(lesson.end_at);
                if (lastMorningEnd === null || end > lastMorningEnd) {
                    lastMorningEnd = end;
                }
            }
            if (lesson.is_afternoon && firstAfternoonStart === null) {
                firstAfternoonStart = getDecimalHour(lesson.start_at);
            }
        }

        if (lastMorningEnd === null || firstAfternoonStart === null || firstAfternoonStart <= lastMorningEnd) {
            return html``;
        }

        const top = (lastMorningEnd - START_HOUR) * HOUR_HEIGHT;
        const height = (firstAfternoonStart - lastMorningEnd) * HOUR_HEIGHT;

        const now = new Date();
        const firstAfternoonLesson = dayLessons.find(l => l.is_afternoon && !l.canceled);
        const ended = this.config.dim_ended_lessons && firstAfternoonLesson && Date.parse(firstAfternoonLesson.start_at) < now;

        return html`
        <div class="timeline-break ${ended ? 'lesson-ended' : ''}"
             style="top: ${top}px; height: ${height}px">
            <span class="lesson-name">Repas</span>
        </div>
        `;
    }

    getDayTimeline(dayLessons) {
        const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
        const nonCanceled = dayLessons.filter(l => !l.canceled);
        const filtered = dayLessons.filter(lesson => {
            if (!lesson.canceled) return true;
            const start = Date.parse(lesson.start_at);
            const end = Date.parse(lesson.end_at);
            return !nonCanceled.some(other => Date.parse(other.start_at) < end && Date.parse(other.end_at) > start);
        });
        const lessonBlocks = filtered.map(lesson => this.getLessonBlock(lesson));

        return html`
        <div class="timetable-timeline" style="height: ${totalHeight}px">
            ${this.getTimelineScale()}
            <div class="timeline-lessons">
                ${lessonBlocks}
                ${this.getLunchBreakBlock(dayLessons)}
            </div>
        </div>
        `;
    }

    // =====================
    // Shared methods
    // =====================

    getFormattedDate(lesson) {
        return (new Date(lesson.start_at))
            .toLocaleDateString('fr-FR', {weekday: 'long', day: '2-digit', month: '2-digit'})
            .replace(/^(.)/, (match) => match.toUpperCase())
        ;
    }

    getFormattedTime(time) {
        return new Intl.DateTimeFormat("fr-FR", {hour:"numeric", minute:"numeric"}).format(new Date(time));
    }

    getDayHeader(firstLesson, dayStartAt, dayEndAt, daysCount) {
        return html`<div class="pronote-timetable-header">
            ${this.config.enable_slider ? html`<span
                class="pronote-timetable-header-arrow-left ${daysCount === 0 ? 'disabled' : ''}"
                @click=${(e) => this.changeDay('previous', e)}
            >&#8592;</span>` : '' }
            <span class="pronote-timetable-header-date">${this.getFormattedDate(firstLesson)}</span>
            ${this.config.display_day_hours && dayStartAt && dayEndAt ? html`<span class="pronote-timetable-header-hours">
                ${this.getFormattedTime(dayStartAt)} - ${this.getFormattedTime(dayEndAt)}
            </span>` : '' }
            ${this.config.enable_slider ? html`<span
                class="pronote-timetable-header-arrow-right"
                @click=${(e) => this.changeDay('next', e)}
            >&#8594;</span>` : '' }
        </div>`;
    }

    changeDay(direction, e) {
        e.preventDefault();
        if (e.target.classList.contains('disabled')) {
            return;
        }

        const activeDay = e.target.parentElement.parentElement;
        let hasPreviousDay = activeDay.previousElementSibling && activeDay.previousElementSibling.classList.contains('pronote-timetable-day-wrapper');
        let hasNextDay = activeDay.nextElementSibling && activeDay.nextElementSibling.classList.contains('pronote-timetable-day-wrapper');
        let newActiveDay = null;

        if (direction === 'previous' && hasPreviousDay) {
            newActiveDay = activeDay.previousElementSibling;
        } else if (direction === 'next' && hasNextDay) {
            newActiveDay = activeDay.nextElementSibling;
        }

        if (newActiveDay) {
            activeDay.classList.remove('active');
            newActiveDay.classList.add('active');

            hasPreviousDay = newActiveDay.previousElementSibling && newActiveDay.previousElementSibling.classList.contains('pronote-timetable-day-wrapper');
            hasNextDay = newActiveDay.nextElementSibling && newActiveDay.nextElementSibling.classList.contains('pronote-timetable-day-wrapper');

            if (!hasPreviousDay) {
                newActiveDay.querySelector('.pronote-timetable-header-arrow-left').classList.add('disabled');
            }

            if (!hasNextDay) {
                newActiveDay.querySelector('.pronote-timetable-header-arrow-right').classList.add('disabled');
            }
        }
    }

    // we override the render method to return the card content
    render() {
        if (!this.config || !this.hass) {
            return html``;
        }

        const stateObj = this.hass.states[this.config.entity];

        const lessons = this.hass.states[this.config.entity].attributes['lessons']

        const isTimeline = this.config.display_as_timeline;

        if (stateObj) {
            this.lunchBreakRendered = false;
            const currentWeekNumber = new Date().getWeekNumber();

            const itemTemplates = [];
            let dayTemplates = [];
            let dayLessons = [];
            let daysCount = 0;

            let dayStartAt = null;
            let dayEndAt = null;

            let now = new Date();
            let activeDay = 0;

            for (let index = 0; index < lessons.length; index++) {
                let lesson = lessons[index];
                let currentFormattedDate = this.getFormattedDate(lesson);
                let endOfDay = new Date(lesson.end_at);

                if (!lesson.canceled) {
                    if (dayStartAt === null) {
                        dayStartAt = lesson.start_at;
                    }
                    dayEndAt = lesson.end_at;
                }

                if (lesson.canceled && index < lessons.length - 1) {
                    let nextLesson = lessons[index + 1];
                    if (lesson.start_at === nextLesson.start_at && !nextLesson.canceled) {
                        continue;
                    }
                }

                if (this.config.current_week_only) {
                    if (new Date(lesson.start_at).getWeekNumber() > currentWeekNumber) {
                        break;
                    }
                }

                if (isTimeline) {
                    dayLessons.push(lesson);
                } else {
                    dayTemplates.push(this.getTimetableRow(lesson));
                }

                // checking if next lesson is on another day
                if (index + 1 >= lessons.length || ((index + 1) < lessons.length && currentFormattedDate !== this.getFormattedDate(lessons[index+1]))) {
                    if (
                        this.config.enable_slider && this.config.switch_to_next_day
                        && isSameDay(endOfDay, now) && endOfDay < now
                    ) {
                        activeDay = daysCount + 1;
                    }

                    const dayContent = isTimeline
                        ? this.getDayTimeline(dayLessons)
                        : html`<table>${dayTemplates}</table>`;

                    itemTemplates.push(html`
                        <div class="${this.config.enable_slider ? 'slider-enabled' : ''} pronote-timetable-day-wrapper ${daysCount === activeDay ? 'active' : ''}">
                            ${this.getDayHeader(lesson, dayStartAt, dayEndAt, daysCount)}
                            ${dayContent}
                        </div>
                    `);
                    dayTemplates = [];
                    dayLessons = [];

                    this.lunchBreakRendered = false;
                    dayStartAt = null;
                    dayEndAt = null;

                    daysCount++;
                    if (this.config.max_days && this.config.max_days <= daysCount) {
                        break;
                    }
                } else if (!isTimeline && this.config.display_free_time_slots && index + 1 < lessons.length) {
                    const currentEndAt = new Date(lesson.end_at);
                    const nextLesson = lessons[index+1];
                    const nextLessonStartAt = new Date(nextLesson.start_at);
                    if (lesson.is_morning === nextLesson.is_morning && Math.floor((nextLessonStartAt-currentEndAt) / 1000 / 60) > 30) {
                        const now = new Date();
                        dayTemplates.push(this.getBreakRow('Pas de cours', this.config.dim_ended_lessons && nextLessonStartAt < now));
                    }
                }
            }

            if (dayTemplates.length > 0) {
                itemTemplates.push(html`<table>${dayTemplates}</table>`);
            }
            if (dayLessons.length > 0) {
                itemTemplates.push(html`
                    <div class="pronote-timetable-day-wrapper">
                        ${this.getDayTimeline(dayLessons)}
                    </div>
                `);
            }

            return html`
                <ha-card id="${this.config.entity}-card" class="${this.config.enable_slider ? 'pronote-timetable-card-slider' : ''}">
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
            display_lunch_break: true,
            display_classroom: true,
            display_teacher: true,
            display_day_hours: true,
            dim_ended_lessons: true,
            max_days: null,
            current_week_only: false,
            enable_slider: false,
            display_free_time_slots: true,
            switch_to_next_day: false,
            display_as_timeline: false,
        }

        this.config = {
            ...defaultConfig,
            ...config
        };

        this.header_title = 'Emploi du temps de ';
        this.no_data_message = 'Pas d\'emploi du temps à afficher';
    }

    static get styles() {
        return css`
        ${super.styles}

        /* Slider */
        .pronote-timetable-card-slider .pronote-timetable-day-wrapper {
            display: none;
        }
        .pronote-timetable-card-slider .pronote-timetable-day-wrapper.active {
            display: block;
        }
        .pronote-timetable-card-slider .pronote-timetable-header-date {
            display: inline-block;
            text-align: center;
            width: 120px;
        }
        .pronote-timetable-header-arrow-left,
        .pronote-timetable-header-arrow-right {
            cursor: pointer;
        }
        .pronote-timetable-header-arrow-left.disabled,
        .pronote-timetable-header-arrow-right.disabled {
            opacity: 0.3;
            pointer-events: none;
        }
        span.pronote-timetable-header-hours {
            float:right;
        }

        /* Day separator */
        div:not(.slider-enabled).pronote-timetable-day-wrapper + div:not(.slider-enabled).pronote-timetable-day-wrapper {
            border-top: 1px solid white;
        }

        /* ===================== */
        /* List mode styles      */
        /* ===================== */
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

        /* ===================== */
        /* Timeline mode styles  */
        /* ===================== */
        .timetable-timeline {
            position: relative;
            margin-left: 40px;
            margin-right: 8px;
            margin-bottom: 12px;
            font-size: 0.9em;
            font-family: Roboto;
        }
        .timeline-hour-row {
            position: absolute;
            width: calc(100% + 40px);
            left: -40px;
            height: 0;
            display: flex;
            align-items: center;
            pointer-events: none;
        }
        .timeline-hour-label {
            width: 32px;
            text-align: right;
            font-size: 0.75em;
            color: var(--secondary-text-color, #888);
            flex-shrink: 0;
        }
        .timeline-hour-line {
            flex: 1;
            border-top: 1px solid var(--divider-color, rgba(0,0,0,0.12));
            margin-left: 8px;
        }
        .timeline-lessons {
            position: relative;
            width: 100%;
            height: 100%;
        }
        .timeline-lesson {
            position: absolute;
            left: 0;
            right: 0;
            display: flex;
            align-items: flex-start;
            border-radius: 6px;
            background-color: var(--card-background-color, rgba(0,0,0,0.05));
            border: 1px solid var(--divider-color, rgba(0,0,0,0.1));
            overflow: hidden;
            padding: 2px 8px;
            box-sizing: border-box;
            z-index: 1;
        }
        .timeline-lesson-color {
            width: 4px;
            min-height: 100%;
            border-radius: 4px;
            flex-shrink: 0;
            margin-right: 8px;
            align-self: stretch;
        }
        .timeline-lesson-content {
            flex: 1;
            min-width: 0;
            padding: 4px;
        }
        .timeline-lesson-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: space-between;
            align-self: stretch;
            margin-left: auto;
            flex-shrink: 0;
            padding: 2px 0;
        }
        span.lesson-times {
            font-size: 0.75em;
            color: var(--secondary-text-color, #888);
        }
        .timeline-break {
            position: absolute;
            left: 0;
            right: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            box-sizing: border-box;
            z-index: 1;
            color: var(--secondary-text-color, #888);
            font-style: italic;
        }

        /* ===================== */
        /* Shared styles         */
        /* ===================== */
        span.lesson-name {
            font-weight:bold;
            display:block;
        }
        span.lesson-classroom,
        span.lesson-teacher {
            font-size: 0.9em;
            color: var(--secondary-text-color, #888);
        }
        span.lesson-status {
            color: white;
            background-color: rgb(75, 197, 253);
            padding: 4px;
            border-radius: 4px;
        }
        .lesson-canceled span.lesson-name {
            text-decoration: line-through;
        }
        .lesson-canceled span.lesson-status {
            background-color: rgb(250, 50, 75);
        }
        .lesson-ended {
            opacity: 0.3;
        }
        `;
    }

    static getStubConfig() {
        return {
            display_header: true,
            display_lunch_break: true,
            display_classroom: true,
            display_teacher: true,
            display_day_hours: true,
            dim_ended_lessons: true,
            max_days: null,
            current_week_only: false,
            enable_slider: false,
            display_free_time_slots: true,
            switch_to_next_day: false,
            display_as_timeline: false,
        }
    }

    static getConfigElement() {
        return document.createElement("pronote-timetable-card-editor");
    }
}

customElements.define("pronote-timetable-card", PronoteTimetableCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "pronote-timetable-card",
    name: "Pronote Timetable Card",
    description: "Display the timetable from Pronote",
    documentationURL: "https://github.com/delphiki/lovelace-pronote?tab=readme-ov-file#timetable",
});
