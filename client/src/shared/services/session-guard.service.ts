import {Injectable} from '@angular/core'
import {CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router'
import {Observable} from 'rxjs'
import {SessionService} from './session.service'

@Injectable()
export class SessionGuard implements CanActivate {

    constructor(private sessionService: SessionService, private router: Router) {
    }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if(this.sessionService.session.validate())
            return true
        this.sessionService.redirectUrl = state.url
        this.router.navigate(["/"])
        return false
    }
}
