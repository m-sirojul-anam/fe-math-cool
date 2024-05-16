import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  isMenMenu: boolean = false;
  isWomenMenu: boolean = true;
  isCollapsed: boolean = true;

  setMenu() {
    this.isMenMenu = !this.isMenMenu;
    this.isWomenMenu = !this.isWomenMenu;
  }

  setCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
}
