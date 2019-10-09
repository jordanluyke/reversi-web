import {Injectable} from '@angular/core'
import {CoreApiService} from './core-api.service'
import {SessionService} from './session.service'
import {ReplaySubject, Observable, of} from 'rxjs'
import {tap, flatMap} from 'rxjs/operators'
import {Resolve} from '@angular/router'
import {Account, PusherChannel} from './model/index'
import {ErrorHandlingSubscriber} from '../util/index'
import {PusherService} from './pusher.service'

@Injectable()
export class AccountService implements Resolve<Observable<Account>> {

    public account?: Account
    public onLoad: ReplaySubject<Account> = new ReplaySubject(1)
    public onUpdate: ReplaySubject<Account> = new ReplaySubject(1)
    private started: boolean = false
    public loaded: boolean = false

    constructor(
        private coreApiService: CoreApiService,
        private sessionService: SessionService,
        private pusherService: PusherService,
    ) {}

    public clear(): void {
        this.onLoad = new ReplaySubject(1)
        this.onUpdate = new ReplaySubject(1)
        this.started = false
        this.loaded = false
        this.account = null
    }

    private getAccount(): Observable<Account> {
        return this.coreApiService.get("/accounts/" + this.sessionService.session.accountId)
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
        this.pusherService.subscribe(PusherChannel.Account, this.account.id)
            .pipe(flatMap(Void => this.getAccount()))
            .subscribe(new ErrorHandlingSubscriber())
    }

    public resolve(): Observable<Account> {
        if(!this.sessionService.session.validate() || this.started)
            return of(null)
        this.started = true
        return this.getAccount()
            .pipe(tap(Void => this.subscribeUpdates()))
    }
}
