import '@angular/compiler';
import { type VirtualizedListAngularClasses } from 'angular-layout-virtual';
type Data = {
    i: number;
    image?: string;
    title: string;
    excerpt: string;
};
export default class AppComponent {
    data: Data[];
    startIndex: number;
    endIndex: number;
    styling: VirtualizedListAngularClasses;
    get total(): number;
}
export {};
