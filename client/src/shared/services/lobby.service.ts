import {Injectable} from '@angular/core'
import {CoreApiService} from './core-api.service'
import {ReplaySubject, Observable, throwError, Subscription, of} from 'rxjs'
import {tap, catchError, flatMap, filter} from 'rxjs/operators'
import {Resolve, ActivatedRouteSnapshot, Router} from '@angular/router'
import {Lobby, PusherChannel} from './model/index'
import {PusherService} from './pusher.service'
import {ErrorHandlingSubscriber} from '../util/index'

@Injectable()
export class LobbyService implements Resolve<Observable<Lobby>> {

    public lobby?: Lobby
    public onLoad: ReplaySubject<Lobby> = new ReplaySubject(1)
    public onUpdate: ReplaySubject<Lobby> = new ReplaySubject(1)
    private started: boolean = false
    private loaded: boolean = false
    private lobbySubscription?: Subscription

    constructor(
        private core: CoreApiService,
        private router: Router,
        private pusherService: PusherService,
    ) {}

    public clear(): void {
        this.onLoad = new ReplaySubject(1)
        this.onUpdate = new ReplaySubject(1)
        this.started = false
        this.loaded = false
        this.lobby = null
        this.unsubscribeLobby()
    }

    public createLobby(): Observable<Lobby> {
        this.started = true
        return this.core.post("/lobbies")
            .pipe(
                tap(lobby => {
                    this.lobby = lobby
                    this.loaded = true
                    this.onLoad.next(lobby)
                    this.onUpdate.next(lobby)
                    this.subscribeLobby()
                })
            )
    }

    public join(id: string): void {
        this.core.post("/lobbies/" + id + "/join")
            .pipe(
                tap(lobby => {
                    this.lobby = lobby
                    if(!this.loaded)
                        this.onLoad.next(lobby)
                    this.loaded = true
                    this.onUpdate.next(lobby)
                    this.router.navigate(["lobbies", id])
                })
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    public leave(id: string): void {
        this.clear()
        this.core.post("/lobbies/" + id + "/leave")
            .subscribe(new ErrorHandlingSubscriber())
    }

    private getLobby(id: string): Observable<Lobby> {
        return this.core.get("/lobbies/" + id)
            .pipe(
                tap(lobby => {
                    this.lobby = lobby
                    if(!this.loaded)
                        this.onLoad.next(lobby)
                    this.loaded = true
                    this.onUpdate.next(lobby)
                })
            )
    }

    private subscribeLobby(): void {
        this.lobbySubscription = this.pusherService.subscribe(PusherChannel.Lobby, this.lobby.id)
            .pipe(flatMap(Void => this.getLobby(this.lobby.id)))
            .subscribe(new ErrorHandlingSubscriber())
    }

    private unsubscribeLobby(): void {
        if(this.lobbySubscription != null) {
            this.lobbySubscription.unsubscribe()
            this.lobbySubscription = null
            this.pusherService.unsubscribe(PusherChannel.Lobby)
        }
    }

    public resolve(route: ActivatedRouteSnapshot): Observable<Lobby> {
        if(this.started)
            return of(null)
        let id = route.paramMap.get("id")
        if(id == null) {
            this.router.navigate(["404"])
            return throwError("Lobby ID not present")
        }
        return this.getLobby(id)
            .pipe(tap(Void => this.subscribeLobby()))
    }
}
