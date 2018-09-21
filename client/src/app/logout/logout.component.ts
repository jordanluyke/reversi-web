import {Component, OnInit} from '@angular/core'
import {
    AccountService,
    SessionService,
    CoreService,
    ErrorHandlingSubscriber
} from '../../shared/index'
import {Router} from '@angular/router'
import {empty} from 'rxjs'
import {catchError, tap, defaultIfEmpty} from 'rxjs/operators'

@Component({
    selector: 'logout-component',
    styleUrls: ['logout.css'],
    templateUrl: 'logout.html'
})
export class LogoutComponent implements OnInit {

    constructor(
        private router: Router,
        private core: CoreService,
        private accountService: AccountService,
        private sessionService: SessionService,
    ) {}

    public ngOnInit(): void {
        if(this.sessionService.session.validate())
            this.logout()
        else {
            this.clear()
            this.router.navigate(["/"])
        }
    }

    private logout(): void {
        this.core.delete("/session/" + this.sessionService.session.sessionId)
            .pipe(
                catchError(err => empty()),
                defaultIfEmpty(null),
                tap(Void => {
                    this.clear()
                    this.router.navigate(["/"])
                })
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    private clear(): void {
        this.accountService.clear()
        this.sessionService.clear()
    }
}
