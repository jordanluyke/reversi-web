import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core'
import {CoreService, Session, AccountService, SessionService, Instant, ErrorHandlingSubscriber, MatchService} from '../../shared/index'
import {throwError} from 'rxjs'
import {tap, flatMap, catchError} from 'rxjs/operators'
import {Router} from '@angular/router'

@Component({
    selector: 'home-component',
    styleUrls: ['home.css'],
    templateUrl: 'home.html'
})
export class HomeComponent implements OnInit {

    public signInVisible = false
    public email?: string
    public reqInProgress = false
    public accountLoading = false
    public guestName?: string

    constructor(
        private core: CoreService,
        public accountService: AccountService,
        private sessionService: SessionService,
        private router: Router,
        private matchService: MatchService,
    ) {}

    public ngOnInit(): void {
        // console.log(this.router.)
        if(this.sessionService.session.validate()) {
            this.accountLoading = true
            this.accountService.resolve()
                .pipe(
                    tap(Void => {
                        this.accountLoading = false
                    }),
                    catchError(err => {
                        this.accountLoading = false
                        return throwError(err)
                    })
                )
                .subscribe(new ErrorHandlingSubscriber())
        }
    }

    public clickSignIn(): void {
        this.signInVisible = true
    }

    public submitAccountSignIn(): void {
        if(this.reqInProgress) return
        this.reqInProgress = true
        this.core.post("/sessions", {
            body: {
                email: this.email
            }
        })
            .pipe(
                tap(body => {
                    let session = new Session()
                    session.accountId = body.accountId
                    session.sessionId = body.sessionId
                    session.expiresAt = Instant.fromMillis(body.expiresAt)
                    this.sessionService.setSession(session)
                }),
                flatMap(body => this.accountService.resolve()),
                tap(Void => {
                    this.signInVisible = false
                    this.reqInProgress = false
                })
            )
            .subscribe(Void => {}, err => {
                this.reqInProgress = false
                console.error(err)
            })
    }

    public clickCreateGame(): void {
        this.reqInProgress = true
        this.matchService.createMatch()
            .pipe(
                tap(match => {
                    this.router.navigate(["matches", match.id])
                })
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    public submitGuestSignIn(): void {
        if(this.reqInProgress) return
        this.reqInProgress = true
        this.core.post("/sessions", {
            body: {
                name: this.guestName
            }
        })
            .pipe(
                tap(body => {
                    let session = new Session()
                    session.accountId = body.accountId
                    session.sessionId = body.sessionId
                    session.expiresAt = Instant.fromMillis(body.expiresAt)
                    this.sessionService.setSession(session)
                }),
                flatMap(body => this.accountService.resolve()),
                tap(Void => {
                    this.signInVisible = false
                    this.reqInProgress = false
                })
            )
            .subscribe(Void => {}, err => {
                this.reqInProgress = false
                console.error(err)
            })
    }
}
