import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingService, ShoppingItem } from '../../services/shopping.service';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss']
})
export class ShoppingListComponent implements OnInit {
  shoppingItems: ShoppingItem[] = [];
  newItem: string = '';

  constructor(private shoppingService: ShoppingService) {}

  ngOnInit() {
    const familyId = Number(localStorage.getItem('familyId'));
    this.shoppingService.getItems(familyId).subscribe(items => {
      console.log('отримано товари:', items);
      this.shoppingItems = items;
    });
  }

  toggleBought(item: ShoppingItem) {
    this.shoppingService.updateItemStatus(item.itemId, item.isBought).subscribe();
  }

  addItem() {
    const userId = Number(localStorage.getItem('userId'));
    if (!this.newItem.trim()) return;

    this.shoppingService.addItem(this.newItem.trim(), userId).subscribe(() => {
      this.newItem = '';
      this.ngOnInit();
    });
  }

  deleteItem(itemId: number) {
    this.shoppingService.deleteItem(itemId).subscribe(() => {
      this.shoppingItems = this.shoppingItems.filter(item => item.itemId !== itemId);
    });
  }
}
