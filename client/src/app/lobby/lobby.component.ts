import {Component, OnInit, OnDestroy} from '@angular/core'
import {tap} from 'rxjs/operators'
import {ErrorHandlingSubscriber, CoreApiService, LobbyService, Lobby, AccountService, Profile, MatchService} from '../../shared/index'
import {Observable} from 'rxjs'
import {Router} from '@angular/router'

@Component({
    selector: 'lobby-component',
    styleUrls: ['lobby.css'],
    templateUrl: 'lobby.html'
})
export class LobbyComponent implements OnInit, OnDestroy {

    public lobby: Lobby
    public darkName?: string
    public lightName?: string
    public readyInProgress = false

    constructor(
        private core: CoreApiService,
        private lobbyService: LobbyService,
        private accountService: AccountService,
        private router: Router,
        private matchService: MatchService,
    ) {}

    public ngOnInit(): void {
        this.lobbyService.onUpdate
            .pipe(tap(lobby => this.onLobbyUpdate(lobby)))
            .subscribe(new ErrorHandlingSubscriber())
    }

    public ngOnDestroy(): void {
        if((this.isDark() || this.isLight()) && this.lobby.startingAt == null)
            this.lobbyService.leave(this.lobby.id)
    }

    public clickReady(): void {
        this.readyInProgress = true
        let path = this.isReady() ? "cancel" : "ready"
        this.core.post(`/lobbies/${this.lobby.id}/${path}`)
            .pipe(tap(lobby => {
                this.readyInProgress = false
                this.onLobbyUpdate(lobby)
            }, err => {
                this.readyInProgress = false
            }))
            .subscribe(new ErrorHandlingSubscriber())
    }

    private onLobbyUpdate(lobby: Lobby): void {
        if(lobby.matchId != null) {
            this.matchService.getMatch(lobby.matchId)
                .pipe(tap(match => {
                    this.router.navigate(["matches", match.id])
                }))
                .subscribe(new ErrorHandlingSubscriber())
        } else if(lobby.closedAt != null) {
            this.router.navigate(["lobbies"])
        } else {
            if(this.lobby == null || lobby.playerIdDark != this.lobby.playerIdDark) {
                if(this.accountService.account.id == lobby.playerIdDark) {
                    this.darkName = this.accountService.account.name
                } else {
                    this.getProfile(lobby.playerIdDark)
                        .pipe(tap(profile => this.darkName = profile.name))
                        .subscribe(new ErrorHandlingSubscriber())
                }
            }
            if(this.lobby == null || lobby.playerIdLight != this.lobby.playerIdLight) {
                if(lobby.playerIdLight == null) {
                    this.lightName = null
                } else if(this.accountService.account.id == lobby.playerIdLight) {
                    this.lightName = this.accountService.account.name
                } else {
                    this.getProfile(lobby.playerIdLight)
                        .pipe(tap(profile => this.lightName = profile.name))
                        .subscribe(new ErrorHandlingSubscriber())
                }
            }
        }

        this.lobby = lobby
    }

    private getProfile(accountId: string): Observable<Profile> {
        return this.core.get(`/accounts/${accountId}/profile`)
    }

    private isDark(): boolean {
        return this.lobby.playerIdDark == this.accountService.account.id
    }

    private isLight(): boolean {
        return this.lobby.playerIdLight == this.accountService.account.id
    }

    public isReady(): boolean {
        return (this.isDark() && this.lobby.playerReadyDark) || (this.isLight() && this.lobby.playerReadyLight)
    }
}
