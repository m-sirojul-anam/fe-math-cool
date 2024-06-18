import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { HtmlSanitizerService } from '@shared/services/html-sanitizer.service';
import { DecodeHtmlPipe } from '@shared/utils/decode-html.pipe';
import { NumberToFractionPipe } from '@shared/utils/number-to-fraction.pipe';

@Component({
  selector: 'app-steps',
  standalone: true,
  imports: [CommonModule, DecodeHtmlPipe, NumberToFractionPipe],
  templateUrl: './steps.component.html',
  styleUrl: './steps.component.scss',
})
export class StepsComponent {
  @Input() matrixOperation?: string;
  @Input() steps: string[][];

  constructor(private htmlSanitizerService: HtmlSanitizerService) {}

  sanitizeHtml(html: string): SafeHtml {
    return this.htmlSanitizerService.sanitizeHtml(html);
  }
}
