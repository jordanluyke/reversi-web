import {Component, OnInit, OnDestroy} from '@angular/core'
import {tap} from 'rxjs/operators'
import {ErrorHandlingSubscriber, CoreApiService, Lobby, LobbyService, AccountService, PusherService, PusherChannel} from '../../shared/index'
import {Subscription} from 'rxjs'

@Component({
    selector: 'lobbies-component',
    styleUrls: ['lobbies.css'],
    templateUrl: 'lobbies.html'
})
export class LobbiesComponent implements OnInit, OnDestroy {

    public lobbies?: Lobby[]
    public loaded = false
    public joiningIndex?: number
    private lobbiesSubscription?: Subscription

    constructor(
        private core: CoreApiService,
        private lobbyService: LobbyService,
        private accountService: AccountService,
        private pusherService: PusherService,
    ) {}

    public ngOnInit(): void {
        this.getLobbies()
        this.subscribeLobbies()
    }

    public ngOnDestroy(): void {
        this.unsubscribeLobbies()
    }

    public clickJoin(index: number): void {
        this.joiningIndex = index
        let id = this.lobbies[index].id
        this.lobbyService.join(id)
    }

    public inGame(index: number): boolean {
        let lobby = this.lobbies[index]
        return lobby.playerIdDark == this.accountService.account.id || lobby.playerIdLight == this.accountService.account.id
    }

    private getLobbies(): void {
        this.core.get("/lobbies")
            .pipe(tap(lobbies => {
                this.lobbies = lobbies.data
                this.loaded = true
            }))
            .subscribe(new ErrorHandlingSubscriber())
    }

    private subscribeLobbies(): void {
        this.lobbiesSubscription = this.pusherService.subscribe(PusherChannel.Lobbies)
            .pipe(tap(Void => this.getLobbies()))
            .subscribe(new ErrorHandlingSubscriber())
    }

    private unsubscribeLobbies(): void {
        if(this.lobbiesSubscription != null) {
            this.lobbiesSubscription.unsubscribe()
            this.lobbiesSubscription = null
            this.pusherService.unsubscribe(PusherChannel.Lobbies)
        }
    }
}
