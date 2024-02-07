# Lovelace cards for the Pronote integration

A few cards to help display informations from the [Pronote integration for Home Assistant](https://github.com/delphiki/hass-pronote)

## Installation

### Using HACS

Add this repository to HACS, then:  
HACS > Lovelace > **Pronote Cards**

## Cards

### Timetable
  
![Timetable card example](/doc/images/timetable-card.png "Timetable card example").  
  
```yaml
type: custom:pronote-timetable-card
entity: sensor.pronote_XXXX_YYYY_timetable_next_day
display_lunch_break: true
display_classroom: true
display_teacher: true
display_day_hours: true
dim_ended_lessons: true
max_days: null
current_week_only: false
```

This card can be used with all timetable sensors.

### Homework
  
![Homework card example](/doc/images/homework-card.png "Homework card example").
  
```yaml
type: custom:pronote-homework-card
entity: sensor.pronote_XXXX_YYYY_homework
display_done_homework: true
reduce_done_homework: true
current_week_only: false
```

This card can be used with all homework sensors.
