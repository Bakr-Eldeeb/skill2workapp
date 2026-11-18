import { BRAND } from '../../core/brand';
import { Reveal } from '../../shared/reveal';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../../shared/ui';
import { Preferences, TranslatePipe } from '../../core/preferences';
@Component({
  selector: 's2w-landing',
  imports: [Reveal, RouterLink, Logo, TranslatePipe],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  readonly brand = BRAND;
  p = inject(Preferences);
  steps = ['Claim your skills', 'Take an assessment', 'Build your passport', 'Find your match'];
}
