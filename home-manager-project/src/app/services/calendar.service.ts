import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CalendarEvent {
  entryId: number;
  title: string;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private apiUrl = 'http://localhost:3000/api/calendar';

  constructor(private http: HttpClient) {}

  getEvents(familyId: number): Observable<CalendarEvent[]> {
    return this.http.get<any[]>(`${this.apiUrl}?familyId=${familyId}`).pipe(
      map(data => data.map(item => ({
        entryId: item.EntryID,
        title: item.Title,
        date: item.Date
      })))
    );
  }

  addEvent(title: string, date: string, userId: number): Observable<any> {
    return this.http.post(this.apiUrl, { title, date, userId });
  }

  deleteEvent(entryId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${entryId}`);
  }
}
