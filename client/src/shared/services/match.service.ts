import {Injectable} from '@angular/core'
import {CoreApiService} from './core-api.service'
import {ReplaySubject, Observable, throwError, Subscription, of} from 'rxjs'
import {tap, catchError, flatMap, filter} from 'rxjs/operators'
import {Resolve, ActivatedRouteSnapshot, Router} from '@angular/router'
import {Match, PusherChannel} from './model/index'
import {PusherService} from './pusher.service'
import {ErrorHandlingSubscriber} from '../util/index'
import {AccountService} from './account.service'

@Injectable()
export class MatchService implements Resolve<Observable<Match>> {

    public match?: Match
    public onLoad: ReplaySubject<Match> = new ReplaySubject(1)
    public onUpdate: ReplaySubject<Match> = new ReplaySubject(1)
    public matchIdRedirect?: string
    private started: boolean = false
    private loaded: boolean = false
    private matchSubscription?: Subscription

    constructor(
        private core: CoreApiService,
        private router: Router,
        private pusherService: PusherService,
        private accountService: AccountService,
    ) {}

    public clear(): void {
        this.onLoad = new ReplaySubject(1)
        this.onUpdate = new ReplaySubject(1)
        this.started = false
        this.loaded = false
        this.match = null
        this.unsubscribeMatch()
    }

    public createMatch(): Observable<Match> {
        this.started = true
        return this.core.post("/matches")
            .pipe(
                tap(match => {
                    this.match = match
                    this.loaded = true
                    this.onLoad.next(match)
                    this.onUpdate.next(match)
                    this.subscribeMatch()
                })
            )
    }

    public findMatch(): Observable<Match> {
        return this.pusherService.subscribe(PusherChannel.FindMatch, this.accountService.account.id)
            .pipe(
                flatMap(body => this.getMatch(body.matchId)),
                tap(match => this.pusherService.unsubscribe(PusherChannel.FindMatch))
            )
    }

    public getMatch(id: string): Observable<Match> {
        return this.core.get("/matches/" + id)
            .pipe(
                tap(match => {
                    this.match = match
                    if(!this.loaded)
                        this.onLoad.next(match)
                    this.loaded = true
                    this.onUpdate.next(match)
                })
            )
    }

    private subscribeMatch(): void {
        this.matchSubscription = this.pusherService.subscribe(PusherChannel.Match, this.match.id)
            .pipe(flatMap(Void => this.getMatch(this.match.id)))
            .subscribe(new ErrorHandlingSubscriber())
    }

    private unsubscribeMatch(): void {
        if(this.matchSubscription != null) {
            this.matchSubscription.unsubscribe()
            this.matchSubscription = null
            this.pusherService.unsubscribe(PusherChannel.Match)
        }
    }

    public resolve(route: ActivatedRouteSnapshot): Observable<Match> {
        if(this.started)
            return of(null)
        let id = route.paramMap.get("id")
        if(id == null) {
            this.router.navigate(["404"])
            return throwError("Match ID not present")
        }
        return this.getMatch(id)
            .pipe(tap(Void => this.subscribeMatch()))
    }
}
