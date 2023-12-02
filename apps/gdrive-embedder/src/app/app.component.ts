import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule, FormsModule],
  selector: 'gde-root',
  templateUrl: './app.component.html',
  styles: [''],
})
export class AppComponent {
  #url = signal<string>('');
  #embedCode = signal<string>('');

  viewModel = computed(() => ({
    url: this.#url(),
    embedCode: this.#embedCode(),
  }));

  generate(url: string) {
    // validate url
    // parse url
    const fileId = url.substring(
      url.lastIndexOf('d/') + 2,
      url.lastIndexOf('/')
    );

    this.#embedCode.update(
      () => `https://drive.google.com/uc?export=view&id=${fileId}`
    );
  }
}
