import {Injectable} from '@angular/core'
import {CoreService} from './core.service'
import {SessionService} from './session.service'
import {ReplaySubject, Observable, of, throwError, from} from 'rxjs'
import {tap, catchError, first, map} from 'rxjs/operators'
import {Resolve, Router} from '@angular/router'
import {Account} from './model/index'

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
        private router: Router,
    ) {}

    public clear(): void {
        this.onLoad = new ReplaySubject(1)
        this.onUpdate = new ReplaySubject(1)
        this.started = false
        this.loaded = false
        this.account = null
    }

    public load(): Observable<Account> {
        return this.getAccount()
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

    public resolve(): Observable<Account> {
        if(this.started)
            return this.onLoad.pipe(first())
        this.started = true
        return this.getAccount()
            .pipe(
                catchError(err => {
                    console.error(err)
                    this.router.navigate(["logout"])
                    return throwError(err)
                })
            )
    }
}
