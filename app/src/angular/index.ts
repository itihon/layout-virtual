import '@angular/compiler';
import { Component, Type, type OnInit } from '@angular/core';
import { NgComponentOutlet, CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';

import App from './main';
import InfiniteScrollExample from '../../../homepage/src/examples/infinite-scroll/angular/infinite-scroll';
import AppComponent from '../../../homepage/src/examples/responsive-grid/angular/responsive-grid';

import AppExampleStyles from '../main.css?raw';
import InfiniteScrollExampleStyles from '../../../homepage/src/examples/infinite-scroll/styles.css?raw';
import ResponsiveGridExampleStyles from '../../../homepage/src/examples/responsive-grid/styles.css?raw';

const styles = {
  'main': AppExampleStyles,
  'infinite-scroll': InfiniteScrollExampleStyles,
  'responsive-grid': ResponsiveGridExampleStyles,
};

const examples = {
  'main': App,
  'infinite-scroll': InfiniteScrollExample,
  'responsive-grid': AppComponent,
};

type ExampleName = keyof typeof examples;

@Component({
  selector: '#app',
  standalone: true,
  imports: [
    CommonModule,
    NgComponentOutlet,
  ],
  template: `
    <nav>
      <a *ngFor="let key of exampleKeys" [href]="'./?example=' + key" [class.active]="key === example">
        {{ key }}
      </a>
    </nav>

    <ng-container *ngComponentOutlet="currentComponent"></ng-container>
  `,
})
class RootComponent implements OnInit {
  exampleKeys = Object.keys(examples);
  example: ExampleName = 'main';
  currentComponent!: Type<unknown>;

  ngOnInit(): void {
    this.example = (new URLSearchParams(window.location.search).get('example') || 'main') as ExampleName;

    this.currentComponent = examples[this.example];

    const style = document.createElement('style');
    style.textContent = styles[this.example];
    document.head.appendChild(style);
  }
}

bootstrapApplication(RootComponent).catch((error: unknown) => {
  console.error(error);
});