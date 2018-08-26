import {Component, OnInit, OnDestroy} from '@angular/core'
import {tap} from 'rxjs/operators'
import {ErrorHandlingSubscriber, CoreService, MatchService, Match} from '../../shared/index'

@Component({
    selector: 'match-component',
    styleUrls: ['match.css'],
    templateUrl: 'match.html'
})
export class MatchComponent implements OnInit, OnDestroy {

    public match: Match
    private joining = false
    private joinError?: string

    constructor(
        private core: CoreService,
        private matchService: MatchService,
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
            .subscribe(Void => {
                this.joining = false
            }, err => {
                this.joinError = err.message
                this.joining = false
                console.error(err)
            })
    }
}
