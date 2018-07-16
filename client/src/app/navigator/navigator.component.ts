import {Component, OnInit} from '@angular/core'
import {Router, ActivatedRoute} from '@angular/router'
import {ErrorHandlingSubscriber} from '../../shared/index'
import {tap} from 'rxjs/operators'

/**
 * Used for redirect handling & prevent HomeComponent loading
 */

@Component({
    selector: 'navigator-component',
    styleUrls: ['navigator.css'],
    templateUrl: 'navigator.html'
})
export class NavigatorComponent implements OnInit {

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) {}

    public ngOnInit(): void {
        this.navigate()
    }

    private navigate(): void {
        if(this.router.url == "/") {
            this.router.navigate(["home"], {
                replaceUrl: true,
                skipLocationChange: true
            })
        } else {
            this.route.fragment
                .pipe(
                    tap(fragment => {
                        this.router.navigateByUrl(fragment, {
                            replaceUrl: true
                        })
                    })
                )
                .subscribe(new ErrorHandlingSubscriber())
        }
    }
}
