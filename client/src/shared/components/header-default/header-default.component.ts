import {Component, OnInit} from '@angular/core'
import {ActivatedRoute} from '@angular/router'
import {flatMap, tap} from 'rxjs/operators'

@Component({
    selector: 'header-default-component',
    styleUrls: ['header-default.css'],
    templateUrl: 'header-default.html'
})
export class HeaderDefaultComponent implements OnInit {

    private match?: any
    private loading = true
    private joining = false
    private errMsg?: string

    constructor(
        private route: ActivatedRoute,
    ) {}

    public ngOnInit(): void {
    }
}
