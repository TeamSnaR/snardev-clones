import { Component, computed, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule, FormsModule],
  selector: 'gde-root',
  templateUrl: './app.component.html',
  styles: [''],
})
export class AppComponent {
  #formData = signal<{ url: string; imageAlt: string }>({
    url: '',
    imageAlt: '',
  });

  #embedCode = signal<string>('');

  viewModel = computed(() => ({
    url: this.#formData().url,
    imageAlt: this.#formData().imageAlt,
    embedCode: this.#embedCode(),
    submit: (ngForm: NgForm) => this.generate(ngForm),
  }));

  generate(ngForm: NgForm) {
    // validate url
    const url = ngForm.value.url;
    const imageAlt = ngForm.value.imageAlt;
    // parse url
    const fileId = url.substring(
      url.lastIndexOf('d/') + 2,
      url.lastIndexOf('/')
    );

    this.#formData.update(() => ({ url, imageAlt }));

    this.#embedCode.update(
      () => `<figure>
      <figcaption>
        <span class="whitespace-pre-wrap">
         ${imageAlt}
        </span>
      </figcaption>
      <img src="https://drive.google.com/uc?export=view&id=${fileId}" alt="${imageAlt}" />
    </figure>`
    );
  }

  copy() {
    const embedCode = this.viewModel().embedCode;
    navigator.clipboard
      .writeText(embedCode)
      .then(() => {
        console.log('Embed code copied to clipboard');
      })
      .catch((error) => {
        console.error('Failed to copy embed code to clipboard:', error);
      });
  }
}
