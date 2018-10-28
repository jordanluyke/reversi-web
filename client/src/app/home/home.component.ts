import {Component, OnInit} from '@angular/core'
import {CoreService, Session, AccountService, SessionService, Instant, ErrorHandlingSubscriber, MatchService, SignInType, Account} from '../../shared/index'
import {Observable, from} from 'rxjs'
import {tap, flatMap, filter} from 'rxjs/operators'
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
                filter(res => res.authResponse != null),
                tap(Void => this.accountLoading = true),
                flatMap(res => this.signIn(SignInType.FACEBOOK, res.authResponse.userID)),
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    public clickGoogleLogin(): void {
        let auth2 = gapi.auth2.init({
            client_id: "189745405951-mr203k8jk71l5vtsp94c84b6de2asft6.apps.googleusercontent.com",
        })
        from(auth2.signIn())
            .pipe(
                tap(Void => this.accountLoading = true),
                flatMap((user: gapi.auth2.GoogleUser) => this.signIn(SignInType.GOOGLE, user.getId()))
            )
            .subscribe(new ErrorHandlingSubscriber())
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
        if(type == SignInType.GOOGLE)
            reqBody['googleUserId'] = id
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
