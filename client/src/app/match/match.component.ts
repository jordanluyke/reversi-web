import {Component, OnInit, OnDestroy} from '@angular/core'
import {tap} from 'rxjs/operators'
import {ErrorHandlingSubscriber, CoreService, MatchService, Match, Side, AccountService} from '../../shared/index'

@Component({
    selector: 'match-component',
    styleUrls: ['match.css'],
    templateUrl: 'match.html'
})
export class MatchComponent implements OnInit, OnDestroy {

    public match: Match
    public darkCount: number
    public lightCount: number
    public Side = Side
    private joining = false
    private joinError?: string
    private placeInProgress = false

    constructor(
        private core: CoreService,
        private matchService: MatchService,
        private accountService: AccountService,
    ) {}

    public ngOnInit(): void {
        this.matchService.onUpdate
            .pipe(tap(match => {
                this.match = match
                this.darkCount = this.count(match, Side.DARK)
                this.lightCount = this.count(match, Side.LIGHT)
                console.log(this.darkCount)
            }))
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
        if(!this.accountService.loaded)
            return false
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

    public getStatus(): string {
        if(this.match.playerDarkId == null || this.match.playerLightId == null)
            return "Waiting on players to join..."
        if(this.match.playerDarkId != null && this.match.playerLightId != null) {
            if(this.match.turn == Side.DARK) {
                if(this.accountService.loaded && this.match.playerDarkId == this.accountService.account.id)
                    return "Your turn"
                return "Dark's turn"
            }
            if(this.match.turn == Side.LIGHT) {
                if(this.accountService.loaded && this.match.playerLightId == this.accountService.account.id)
                    return "Your turn"
                return "Light's turn"
            }
        }
        throw "Invalid status"
    }

    public getSquareClasses(square: Side): string[] {
        let classes = []
        if(square == Side.LIGHT)
            classes.push("light")
        if(square == Side.DARK)
            classes.push("dark")
        if(this.accountService.loaded && this.match.playerDarkId != null && this.match.playerLightId != null) {
            if(this.accountService.account.id == this.match.playerDarkId && this.match.turn == Side.DARK)
                classes.push("hoverDark")
            if(this.accountService.account.id == this.match.playerLightId && this.match.turn == Side.LIGHT)
                classes.push("hoverLight")
        }
        return classes
    }

    public isActivePlayer(): boolean {
        return this.accountService.loaded &&
        this.match.playerDarkId != null &&
        this.match.playerLightId != null &&
        (this.accountService.account.id == this.match.playerDarkId || this.accountService.account.id == this.match.playerLightId)
    }

    private count(match: Match, side: Side): number {
        return match.board.squares.filter(square => square == side).length
    }
}
