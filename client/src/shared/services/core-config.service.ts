import {Injectable} from '@angular/core'
import {CoreApiService} from './core-api.service'
import {ReplaySubject, Observable, of} from 'rxjs'
import {tap, flatMap} from 'rxjs/operators'
import {Resolve} from '@angular/router'
import {Account, CoreConfig} from './model/index'
import {ErrorHandlingSubscriber} from '../util/index'

@Injectable()
export class CoreConfigService implements Resolve<Observable<Account>> {

    public config: CoreConfig
    public onLoad: ReplaySubject<Account> = new ReplaySubject(1)
    public loaded: boolean = false

    constructor(
        private coreApiService: CoreApiService,
    ) {}

    public clear(): void {
        this.onLoad = new ReplaySubject(1)
        this.loaded = false
    }

    private getConfig(): Observable<Account> {
        return this.coreApiService.get("/config")
            .pipe(
                tap(config => {
                    this.config = config
                    if(!this.loaded)
                        this.onLoad.next(config)
                    this.loaded = true
                })
            )
    }

    public resolve(): Observable<Account> {
        return this.getConfig()
    }
}
