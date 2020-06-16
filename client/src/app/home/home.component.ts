import {Component, OnInit, OnDestroy} from '@angular/core'
import {CoreApiService, Session, AccountService, SessionService, Instant, ErrorHandlingSubscriber, MatchService, SignInType, Account, PusherService, PusherChannel, LobbyService} from '../../shared/index'
import {Observable, from} from 'rxjs'
import {tap, flatMap, filter} from 'rxjs/operators'
import {Router} from '@angular/router'
import {SocialAuthService, FacebookLoginProvider, GoogleLoginProvider} from 'angularx-social-login'

@Component({
    selector: 'home-component',
    styleUrls: ['home.css'],
    templateUrl: 'home.html'
})
export class HomeComponent implements OnInit, OnDestroy {

    public reqInProgress = false
    public submitNameInProgress = false
    public findGameInProgress = false
    public name?: string
    public nameInput?: string
    public isEditingName = false
    public showCreateBtnDuringFind = false

    constructor(
        private core: CoreApiService,
        public accountService: AccountService,
        private sessionService: SessionService,
        private router: Router,
        private matchService: MatchService,
        private socialAuthService: SocialAuthService,
        private pusherService: PusherService,
        private lobbyService: LobbyService,
    ) {}

    public ngOnInit(): void {
        if(this.accountService.loaded) {
            this.name = this.accountService.account.name
            this.nameInput = this.name
        }
    }

    public ngOnDestroy(): void {
        // this.pusherService.unsubscribe(PusherChannel.FindMatch)
    }

    public clickMatchmaking(): void {
        this.reqInProgress = true
        this.findGameInProgress = true
        setTimeout(() => {
            this.showCreateBtnDuringFind = true
        }, 5000)
        this.matchService.findMatch()
            .pipe(
                tap(match => {
                    this.showCreateBtnDuringFind = false
                    this.router.navigate(["matches", match.id])
                }, err => {
                    this.showCreateBtnDuringFind = false
                    this.reqInProgress = false
                    this.findGameInProgress = false
                })
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    public clickBrowseGames(): void {
        this.router.navigate(["lobbies"])
    }

    public clickCreateGame(): void {
        this.reqInProgress = true
        this.lobbyService.createLobby()
            .pipe(
                tap(lobby => {
                    this.router.navigate(["lobbies", lobby.id])
                }, err => {
                    this.reqInProgress = false
                })
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    public clickGuest(): void {
        this.reqInProgress = true
        this.signIn(SignInType.GUEST)
            .subscribe(new ErrorHandlingSubscriber())
    }

    public clickFbLogin(): void {
        from(this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID))
            .pipe(
                filter(user => user != null),
                tap(Void => this.reqInProgress = true),
                flatMap(user => this.signIn(SignInType.FACEBOOK, user.id)),
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    public clickGoogleLogin(): void {
        from(this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID))
            .pipe(
                tap(Void => this.reqInProgress = true),
                flatMap(user => this.signIn(SignInType.GOOGLE, user.id)),
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    public submitName(): void {
        this.submitNameInProgress = true
        this.core.put("/accounts/" + this.accountService.account.id, {
            body: {
                name: this.nameInput
            }
        })
            .pipe(
                tap(account => {
                    this.name = account.name
                    this.isEditingName = false
                    this.submitNameInProgress = false
                }, err => {
                    this.submitNameInProgress = false
                })
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    public clickEditName(): void {
        this.isEditingName = true
        this.nameInput = this.name
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
                    this.name = account.name
                    if(this.matchService.matchIdRedirect != null) {
                        this.router.navigate(["matches", this.matchService.matchIdRedirect])
                        this.matchService.matchIdRedirect = null
                    } else {
                        this.reqInProgress = false
                    }
                }, err => {
                    this.reqInProgress = false
                })
            )
    }
}
