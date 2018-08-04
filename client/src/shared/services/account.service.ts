import {Injectable} from '@angular/core'
import {ApiService} from './api.service'
import {SessionService} from './session.service'
import {ReplaySubject, Observable, of} from 'rxjs'
import {tap, catchError, flatMap} from 'rxjs/operators'
import {Resolve, ActivatedRouteSnapshot} from '@angular/router'
import {Account} from './model/index'
import {ErrorHandlingSubscriber} from '../util/index'

/**
 * @author Jordan Luyke
 */

@Injectable()
export class AccountService implements Resolve<any> {

    public account?: Account
    public onLoad: ReplaySubject<void> = new ReplaySubject(1)
    public onUpdate: ReplaySubject<void> = new ReplaySubject(1)
    private started: boolean = false
    public loaded: boolean = false

    constructor(
        private apiService: ApiService,
        private sessionService: SessionService,
    ) {}

    public clear(): void {
        this.onLoad = new ReplaySubject(1)
        this.onUpdate = new ReplaySubject(1)
        this.started = false
        this.loaded = false
        this.account = null
    }

    private getAccount(): Observable<Account> {
        return this.apiService.get("/accounts/" + this.sessionService.session.accountId)
            .pipe(
                tap(account => {
                    this.account = account
                    if(!this.loaded)
                        this.onLoad.next(null)
                    this.loaded = true
                    this.onUpdate.next(null)
                }),
                catchError(err => {
                    this.sessionService.clear()
                    this.clear()
                    console.error(err)
                    return of(null)
                })
            )
    }

    private getAccountOnSessionSet(): void {
        this.sessionService.onSet
            .pipe(
                flatMap(Void => this.getAccount())
            )
            .subscribe(new ErrorHandlingSubscriber())
    }

    public resolve(route: ActivatedRouteSnapshot): Observable<any> {
        if(this.started)
            return of(null)
        this.started = true

        if(this.sessionService.session.validate())
            return this.getAccount()

        this.getAccountOnSessionSet()

        return of(null)
    }
}
