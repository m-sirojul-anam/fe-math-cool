import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
})
export class ErrorComponent {
  @Input() message?: string;
  @Input() isShow?: boolean;
  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>()

  close(): void {
    this.isShow = !this.isShow
    this.closeModal.emit(false)
  }
}
