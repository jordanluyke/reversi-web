import {Component} from '@angular/core'
import {ActivatedRoute} from '@angular/router'

@Component({
    selector: 'header-component',
    styleUrls: ['header.css'],
    templateUrl: 'header.html'
})
export class HeaderComponent {

    constructor(private activedRoute: ActivatedRoute) {}

    public isPathActive(path: string): boolean {
        return this.activedRoute.snapshot.url[0].path == path
    }
}
