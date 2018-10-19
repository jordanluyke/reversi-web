import {Component, ViewChild, TemplateRef} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap'
import {AccountService} from '../../../shared/index'

@Component({
    selector: 'header-component',
    styleUrls: ['header.css'],
    templateUrl: 'header.html'
})
export class HeaderComponent {

    @ViewChild('aboutModal') public aboutModal: TemplateRef<any>
    @ViewChild('profileModal') public profileModal: TemplateRef<any>

    constructor(
        private activedRoute: ActivatedRoute,
        private modalService: NgbModal,
        public accountService: AccountService,
    ) {}

    public isPathActive(path: string): boolean {
        return this.activedRoute.snapshot.url[0].path == path
    }

    public openAboutModal(): void {
        this.modalService.open(this.aboutModal)
    }

    public openProfileModal(): void {
        this.modalService.open(this.profileModal)
    }
}