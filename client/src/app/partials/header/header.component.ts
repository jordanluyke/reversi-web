import {Component, ViewChild, TemplateRef} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap'

@Component({
    selector: 'header-component',
    styleUrls: ['header.css'],
    templateUrl: 'header.html'
})
export class HeaderComponent {

    @ViewChild('aboutModal') public aboutModal: TemplateRef<any>

    constructor(
        private activedRoute: ActivatedRoute,
        private modalService: NgbModal,
    ) {}

    public isPathActive(path: string): boolean {
        return this.activedRoute.snapshot.url[0].path == path
    }

    public openAboutModal(): void {
        this.modalService.open(this.aboutModal)
    }
}
