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
display_header: true
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
display_header: true
display_done_homework: true
reduce_done_homework: true
current_week_only: false
```

This card can be used with all homework sensors.

### Grades
  
![Grades card example](/doc/images/grades-card.png "Grades card example").
  
```yaml
type: custom:pronote-grades-card
entity: sensor.pronote_XXXX_YYYY_grades
grade_format: full # 'full' will display grade as "X/Y", 'short' will display "X"
display_header: true
display_date: true
display_comment: true
display_class_average: true
compare_with_class_average: true
compare_with_ratio: null # use a float number, e.g. '0.6' to compare with the grade / out_of ratio
display_coefficient: true
display_class_min: true
display_class_max: true
display_new_grade_notice: true
max_grades: null
```

### Averages
  
![Averages card example](/doc/images/averages-card.png "Averages card example").
  
```yaml
type: custom:pronote-averages-card
entity: sensor.pronote_XXXX_YYYY_averages
average_format: full # 'full' will display grade as "X/Y", 'short' will display "X"
display_header: true
compare_with_class_average: true
compare_with_ratio: null # use a float number, e.g. '0.6' to compare with the grade / out_of ratio
display_class_average: true
display_class_min: true
display_class_max: true
```
