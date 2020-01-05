import {Component, OnInit} from '@angular/core'
import {tap} from 'rxjs/operators'
import {ErrorHandlingSubscriber, CoreApiService, Lobby, LobbyService, AccountService} from '../../shared/index'

@Component({
    selector: 'lobbies-component',
    styleUrls: ['lobbies.css'],
    templateUrl: 'lobbies.html'
})
export class LobbiesComponent implements OnInit {

    public lobbies?: Lobby[]
    public loaded = false
    public joiningIndex?: number

    constructor(
        private core: CoreApiService,
        private lobbyService: LobbyService,
        private accountService: AccountService,
    ) {}

    public ngOnInit(): void {
        this.core.get("/lobbies")
            .pipe(tap(lobbies => {
                this.lobbies = lobbies.data
                this.loaded = true
            }))
            .subscribe(new ErrorHandlingSubscriber())
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
}
