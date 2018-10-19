import {Component, OnInit} from '@angular/core'
import {CoreService, Session, AccountService, SessionService, Instant, ErrorHandlingSubscriber, MatchService, SignInType, Account} from '../../shared/index'
import {Observable, from} from 'rxjs'
import {tap, flatMap, filter, catchError} from 'rxjs/operators'
import {Router} from '@angular/router'
import {FacebookService} from 'ngx-facebook'

@Component({
    selector: 'home-component',
    styleUrls: ['home.css'],
    templateUrl: 'home.html'
})
export class HomeComponent implements OnInit {

    public reqInProgress = false
    public accountLoading = false
    public name?: string

    constructor(
        private core: CoreService,
        public accountService: AccountService,
        private sessionService: SessionService,
        private router: Router,
        private matchService: MatchService,
        private facebookService: FacebookService,
    ) {}

    public ngOnInit(): void {
        if(this.accountService.loaded)
            this.name = this.accountService.account.name
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

    public clickGuest(): void {
        this.accountLoading = true
        this.signIn(SignInType.GUEST)
            .subscribe(new ErrorHandlingSubscriber())
    }

    public clickFbLogin(): void {
        from(this.facebookService.login())
            .pipe(
                // tap(res => console.log(res)),
                filter(res => res.authResponse != null),
                tap(Void => this.accountLoading = true),
                flatMap(res => this.signIn(SignInType.FACEBOOK, res.authResponse.userID)),
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    public clickGoogleLogin(): void {
        console.log("google")
    }

    public onNameChange(): void {
        this.core.put("/accounts/" + this.accountService.account.id, {
            body: {
                name: this.name
            }
        })
            .subscribe(new ErrorHandlingSubscriber())
    }

    private signIn(type: SignInType, id?: string): Observable<Account> {
        let reqBody = {}
        if(type == SignInType.FACEBOOK)
            reqBody['facebookUserId'] = id
        return this.core.post("/sessions", {
            body: reqBody
        })
            .pipe(
                flatMap(body => {
                    let session = new Session()
                    session.accountId = body.accountId
                    session.sessionId = body.sessionId
                    session.expiresAt = Instant.fromMillis(body.expiresAt)
                    this.sessionService.setSession(session)

                    return this.accountService.resolve()
                }),
                tap(account => {
                    this.accountLoading = false
                    this.name = account.name
                }, err => {
                    this.accountLoading = false
                })
            )
    }
}
