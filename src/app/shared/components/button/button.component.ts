import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [class]="classes()"
      [disabled]="disabled()"
      (click)="clicked.emit()">
      <ng-content />
    </button>
  `,
  styles: [`
    :host { display: inline-block; }
  `],
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'danger'>('primary');
  readonly disabled = input(false);
  readonly clicked = output<void>();

  readonly classes = () => [
    'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer',
    this.variant() === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
    this.variant() === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    this.variant() === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
    this.disabled() && 'opacity-50 cursor-not-allowed',
  ].filter(Boolean).join(' ');
}
