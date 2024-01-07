# Lovelace cards for the Pronote integration

A few cards to help display informations from the [Pronote integration for Home Assistant](https://github.com/delphiki/hass-pronote)

## Installation

### Using HACS

Add this repository to HACS, then:  
HACS > Lovelace > **Pronote Cards**

## Cards

### Timetable

```yaml
type: custom:pronote-timetable-card
entity: sensor.pronote_XXXX_YYYY_timetable_next_day
display_lunch_break: true 
display_classroom: true
display_teacher: true
display_day_hours: true
darken_ended_lessons: true
```

This card can be used with all sensors.
