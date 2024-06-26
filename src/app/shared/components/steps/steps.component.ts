import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { ConfigService } from '@shared/services/config.service';
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
  @Input() matrixOperation: string;
  @Input() steps: string[][];
  @Input() preSteps: number[][];
  @Input() determinantSteps: string[];

  listMatrixOperation: {
    label: string;
    value: string;
    disabled: boolean;
  }[];

  constructor(
    private htmlSanitizerService: HtmlSanitizerService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.listMatrixOperation = this.configService.getOperations();
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.htmlSanitizerService.sanitizeHtml(html);
  }

  getLabelByValue(value: string): string {
    return this.configService.getLabelByValue(value);
  }
}
