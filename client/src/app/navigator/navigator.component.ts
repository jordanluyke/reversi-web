import {Component, OnInit} from '@angular/core'
import {Router, ActivatedRoute} from '@angular/router'
import {Observable, from} from 'rxjs'
import {flatMap, toArray} from 'rxjs/operators'
import {SocketService, ErrorHandlingSubscriber, AccountService} from '../../shared/index'

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
        private route: ActivatedRoute,
        private accountService: AccountService,
        private socketService: SocketService,
    ) {}

    public ngOnInit(): void {
        from([
            this.accountService,
            this.socketService,
        ])
            .pipe(
                flatMap((service: any) => service.resolve()),
                toArray(),
                flatMap(Void => this.navigate())
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    private navigate(): Observable<boolean> {
        if(this.router.url == "/") {
            return from(this.router.navigate(["home"], {
                replaceUrl: true,
                skipLocationChange: true
            }))
        } else {
            return from(this.route.fragment
                .pipe(flatMap(fragment => this.router.navigateByUrl(fragment, {
                    replaceUrl: true
                }))))
        }
    }
}
