import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DecodeHtmlPipe } from '@shared/utils/decode-html.pipe';
import { UnaryOperators } from '@shared/enums/unary-operators';
import { SafeHtml } from '@angular/platform-browser';
import { NumberToFractionPipe } from '@shared/utils/number-to-fraction.pipe';
import { HtmlSanitizerService } from '@shared/services/html-sanitizer.service';
import { ConfigService } from '@shared/services/config.service';

@Component({
  selector: 'app-problems',
  standalone: true,
  imports: [CommonModule, DecodeHtmlPipe, NumberToFractionPipe],
  templateUrl: './problems.component.html',
  styleUrl: './problems.component.scss',
})
export class ProblemsComponent {
  @Input() operator: UnaryOperators;
  @Input() matrixOperation?: string;
  @Input() matrix1: number[][];
  @Input() matrix2?: number[][];

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
