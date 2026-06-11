import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector:     'app-root',
  standalone:   true,
  imports: [
    // Angular Router
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app.html',
  styleUrl:    './app.scss',
})
export class App {
  readonly title = 'FocusMind';

  // Control del menú móvil (preparado para responsive)
  mobileMenuOpen = false;
  toggleMenu(): void { this.mobileMenuOpen = !this.mobileMenuOpen; }
}
