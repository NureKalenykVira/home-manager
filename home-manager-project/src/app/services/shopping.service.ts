import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ShoppingItem {
  itemId: number;
  itemName: string;
  isBought: boolean;
  createdBy: number;
}

@Injectable({ providedIn: 'root' })
export class ShoppingService {
  private apiUrl = 'http://localhost:3000/api/shopping';

  constructor(private http: HttpClient) {}

  getItems(familyId: number): Observable<ShoppingItem[]> {
    return this.http.get<any[]>(`${this.apiUrl}?familyId=${familyId}`).pipe(
      map(items => items.map(item => ({
        itemId: item.ItemID,
        itemName: item.ItemName,
        isBought: item.IsBought,
        createdBy: item.CreatedBy
      })))
    );
  }


  addItem(itemName: string, userId: number): Observable<any> {
    return this.http.post(this.apiUrl, { itemName, createdBy: userId });
  }

  updateItemStatus(itemId: number, isBought: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${itemId}`, { isBought });
  }

  deleteItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${itemId}`);
  }
}
