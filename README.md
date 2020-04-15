# udem_music_calendar

* **Author:** Savoir-faire Linux
* **Contributor:** Gharib Larbi "larbi.gharib@savoirfairelinux.com"
* **Version:** 1.0
* **Description:** This calendar is used to fecth data from the api 
endpoint for calendar events in an Odoo instance.
* **Dependencies:** 
  * [fullcalendar-4.3.1](https://fullcalendar.io/)
  * [project_resource_calendar_api](https://github.com/savoirfairelinux/project-addons/tree/11.0.0/project_resource_calendar_api)


## Change Odoo server:

1. Go to app.js
2. Replace 

`var url= ""`

with 

`var url = "http://YOUR-SERVER-NAME/api/calendar/events"`

## Add a class room:

1. Go to rooms.json
2. Add a json element

```
{
		"name": "NAME-OF-CLASS-ROOM-EXACTLY-LIKE-ON-ODOO",
		"color": "HEXADECILMAL-COLOR-CODE-TO-DISPLAY-ON-CALENDAR-EXAMPLE-#40a9dd"
}
```