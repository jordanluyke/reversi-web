import {Injectable} from '@angular/core'
import {CoreService} from './core.service'
import {SessionService} from './session.service'
import {ReplaySubject, Observable, throwError, of} from 'rxjs'
import {tap, catchError, first, flatMap} from 'rxjs/operators'
import {Resolve, Router} from '@angular/router'
import {Account, SocketEvent} from './model/index'
import {SocketService} from './socket.service'
import {ErrorHandlingSubscriber} from '../util/index'

@Injectable()
export class AccountService implements Resolve<Observable<Account>> {

    public account?: Account
    public onLoad: ReplaySubject<Account> = new ReplaySubject(1)
    public onUpdate: ReplaySubject<Account> = new ReplaySubject(1)
    private started: boolean = false
    public loaded: boolean = false

    constructor(
        private coreService: CoreService,
        private sessionService: SessionService,
        private socketService: SocketService,
        private router: Router,
    ) {}

    public clear(): void {
        this.onLoad = new ReplaySubject(1)
        this.onUpdate = new ReplaySubject(1)
        this.started = false
        this.loaded = false
        this.account = null
    }

    private getAccount(): Observable<Account> {
        return this.coreService.get("/accounts/" + this.sessionService.session.accountId)
            .pipe(
                tap(account => {
                    this.account = account
                    if(!this.loaded)
                        this.onLoad.next(account)
                    this.loaded = true
                    this.onUpdate.next(account)
                })
            )
    }

    private subscribeUpdates(): void {
        this.socketService.subscribe(SocketEvent.Account, this.account.id)
            .pipe(flatMap(Void => this.getAccount()))
            .subscribe(new ErrorHandlingSubscriber())
    }

    public resolve(): Observable<Account> {
        if(this.started)
            return of(null)
        this.started = true
        return this.getAccount()
            .pipe(
                tap(Void => this.subscribeUpdates()),
                catchError(err => {
                    console.error(err)
                    this.router.navigate(["logout"])
                    return throwError(err)
                })
            )
    }
}
