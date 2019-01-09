import {Component, OnInit, OnDestroy} from '@angular/core'
import {tap} from 'rxjs/operators'
import {ErrorHandlingSubscriber, CoreApiService, MatchService, Match, Side, AccountService, Profile, SessionService} from '../../shared/index'
import {Observable} from 'rxjs'
import {Router} from '@angular/router'

@Component({
    selector: 'match-component',
    styleUrls: ['match.css'],
    templateUrl: 'match.html'
})
export class MatchComponent implements OnInit, OnDestroy {

    public match: Match
    public darkCount: number
    public lightCount: number
    public darkProfile?: Profile
    public lightProfile?: Profile
    public Side = Side
    private joining = false
    private joinError?: string
    private placeInProgress = false

    constructor(
        private core: CoreApiService,
        private matchService: MatchService,
        private accountService: AccountService,
        private sessionService: SessionService,
        private router: Router,
    ) {}

    public ngOnInit(): void {
        this.matchService.onUpdate
            .pipe(tap(match => {
                this.match = match
                this.darkCount = this.count(Side.DARK)
                this.lightCount = this.count(Side.LIGHT)
                this.getProfiles()
            }))
            .subscribe(new ErrorHandlingSubscriber())
    }

    public ngOnDestroy(): void {
        this.matchService.clear()
    }

    public isJoinable(): boolean {
        if(this.accountService.loaded && (this.accountService.account.id == this.match.playerDarkId || this.accountService.account.id == this.match.playerLightId))
            return false
        return this.match.playerDarkId == null || this.match.playerLightId == null
    }

    public clickJoin(): void {
        if(!this.sessionService.session.validate()) {
            this.matchService.matchIdRedirect = this.match.id
            this.router.navigate(["/"])
            return
        }
        if(this.joining) return
        this.joining = true
        this.core.post("/matches/" + this.match.id + "/join")
            .pipe(
                tap(match => {
                    this.joining = false
                    this.match = match
                    this.getProfiles()
                }, err => {
                    this.joinError = err.message
                    this.joining = false
                })
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    public placePiece(i: number): void {
        if(!this.accountService.loaded || this.match.playerDarkId == null || this.match.playerLightId == null || this.match.completedAt != null ||
            (this.match.playerDarkId != this.accountService.account.id && this.match.playerLightId != this.accountService.account.id) ||
            ((this.match.playerDarkId == this.accountService.account.id && this.match.turn != Side.DARK) ||
            (this.match.playerLightId == this.accountService.account.id && this.match.turn != Side.LIGHT))) return
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
        if(this.match.completedAt != null) {
            if(this.darkCount > this.lightCount)
                return "Dark wins!"
            else if(this.lightCount > this.darkCount)
                return "Light wins!"
            return "Draw!"
        }
        if(this.match.playerDarkId != null && this.match.playerLightId != null) {
            if(this.match.turn == Side.DARK) {
                if(this.accountService.loaded && this.match.playerDarkId == this.accountService.account.id)
                    return "Your turn"
                let name = "Dark"
                if(this.darkProfile != null)
                    name = this.darkProfile.name
                return name + "'s turn"
            }
            if(this.match.turn == Side.LIGHT) {
                if(this.accountService.loaded && this.match.playerLightId == this.accountService.account.id)
                    return "Your turn"
                let name = "Light"
                if(this.lightProfile != null)
                    name = this.lightProfile.name
                return name + "'s turn"
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
        ((this.accountService.account.id == this.match.playerDarkId && this.match.turn == Side.DARK) ||
        (this.accountService.account.id == this.match.playerLightId && this.match.turn == Side.LIGHT))
    }

    private count(side: Side): number {
        return this.match.board.squares.filter(square => square == side).length
    }

    private getProfiles(): void {
        if(this.darkProfile == null && this.match.playerDarkId != null) {
            if(this.accountService.loaded && this.accountService.account.id == this.match.playerDarkId) {
                this.darkProfile = {
                    name: this.accountService.account.name,
                    stats: this.accountService.account.stats
                }
            } else {
                this.getProfile(this.match.playerDarkId)
                    .pipe(tap(profile => this.darkProfile = profile))
                    .subscribe(new ErrorHandlingSubscriber())
            }
        }
        if(this.lightProfile == null && this.match.playerLightId != null) {
            if(this.accountService.loaded && this.accountService.account.id == this.match.playerLightId) {
                this.lightProfile = {
                    name: this.accountService.account.name,
                    stats: this.accountService.account.stats
                }
            } else {
                this.getProfile(this.match.playerLightId)
                    .pipe(tap(profile => this.lightProfile = profile))
                    .subscribe(new ErrorHandlingSubscriber())
            }
        }
    }

    private getProfile(accountId: string): Observable<Profile> {
        return this.core.get(`/accounts/${accountId}/profile`)
    }
}
