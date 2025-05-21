import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  private apiUrl = 'http://localhost:3000/api/family';

  constructor(private http: HttpClient) {}

  createFamily(data: { familyName: string; familyDescription?: string; userId: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

  joinFamily(data: { familyCode: string; userId: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/join`, data);
  }
}
