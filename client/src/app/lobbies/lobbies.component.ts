import {Component, OnInit} from '@angular/core'
import {tap} from 'rxjs/operators'
import {ErrorHandlingSubscriber, CoreApiService, Lobby, LobbyService} from '../../shared/index'

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
    ) {}

    public ngOnInit(): void {
        this.core.get("/lobbies")
            .pipe(tap(lobbies => {
                this.lobbies = lobbies.data
                this.loaded = true
            }))
            .subscribe(new ErrorHandlingSubscriber())
    }

    public clickJoin(i: number): void {
        this.joiningIndex = i
        let id = this.lobbies[i].id
        this.lobbyService.join(id)
    }
}
