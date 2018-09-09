import {Component, OnInit, OnDestroy} from '@angular/core'
import {tap} from 'rxjs/operators'
import {ErrorHandlingSubscriber, CoreService, MatchService, Match, Square, AccountService} from '../../shared/index'

@Component({
    selector: 'match-component',
    styleUrls: ['match.css'],
    templateUrl: 'match.html'
})
export class MatchComponent implements OnInit, OnDestroy {

    public match: Match
    private joining = false
    private joinError?: string
    private placeInProgress = false

    public Square = Square

    constructor(
        private core: CoreService,
        private matchService: MatchService,
        public accountService: AccountService,
    ) {}

    public ngOnInit(): void {
        this.matchService.onUpdate
            .pipe(tap(match => this.match = match))
            .subscribe(new ErrorHandlingSubscriber())
    }

    public ngOnDestroy(): void {
        this.matchService.clear()
    }

    public clickJoin(): void {
        if(this.joining) return
        this.joining = true
        this.core.post("/matches/" + this.match.id + "/join")
            .pipe(
                tap(match => {
                    this.joining = false
                    this.match = match
                }, err => {
                    this.joinError = err.message
                    this.joining = false
                })
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    public isJoinable(): boolean {
        return (this.match.playerDarkId == null || this.match.playerLightId == null) &&
            this.accountService.account.id != this.match.playerDarkId &&
            this.accountService.account.id != this.match.playerLightId
    }

    public placePiece(i: number): void {
        if(this.placeInProgress) return
        this.placeInProgress = true
        this.core.post("/matches/" + this.match.id + "/move", {
            body: {
                index: i
            }
        })
            .pipe(
                tap(match => {
                    this.match = match
                    this.placeInProgress = false
                }, err => {
                    this.placeInProgress = false
                })
            )
            .subscribe(new ErrorHandlingSubscriber())
    }
}
