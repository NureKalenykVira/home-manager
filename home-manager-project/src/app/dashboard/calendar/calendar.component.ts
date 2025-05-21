import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService, CalendarEvent } from '../../services/calendar.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  events: CalendarEvent[] = [];
  groupedEvents: { [date: string]: CalendarEvent[] } = {};

  newTitle: string = '';
  newDate: string = '';

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    const familyId = Number(localStorage.getItem('familyId'));
    this.calendarService.getEvents(familyId).subscribe(events => {
      console.log('Отримані події:', events);
      this.events = events;
      this.groupedEvents = this.groupByDate(events);
    });
  }

  groupByDate(events: CalendarEvent[]): { [date: string]: CalendarEvent[] } {
    const grouped: { [date: string]: CalendarEvent[] } = {};
    for (const event of events) {
      if (!event.date) continue;

      const date = event.date.slice(0, 10);
      if (!grouped[date]) grouped[date] = [];
        grouped[date].push(event);
    }
    return grouped;
  }


  addEvent(): void {
    const userId = Number(localStorage.getItem('userId'));
    if (!this.newTitle.trim() || !this.newDate) return;

    this.calendarService.addEvent(this.newTitle.trim(), this.newDate, userId).subscribe(() => {
      this.newTitle = '';
      this.newDate = '';
      this.ngOnInit(); // оновити
    });
  }

  deleteEvent(id: number) {
    this.calendarService.deleteEvent(id).subscribe(() => {
      this.ngOnInit();
    });
  }
}
