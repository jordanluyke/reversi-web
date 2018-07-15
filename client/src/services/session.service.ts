import {Injectable} from '@angular/core'
import {Session} from './model/session'
import {ReplaySubject, Subject} from 'rxjs'
import {CookieService} from './cookie.service'

/**
 * @author Jordan Luyke
 */
@Injectable({
    providedIn: "root"
})
export class SessionService {
    public session: Session = new Session()
    public redirectUrl?: string
    public onSet: ReplaySubject<void> = new ReplaySubject(1)
    public onClear: Subject<void> = new Subject()

    constructor(private cookieService: CookieService) {
        this.load()
    }

    public setSession(session: Session): void {
        if(!session.validate())
            throw new Error("Assigned session not valid")

        this.session = session
        this.save()
        this.onSet.next(null)
    }

    public clear(): void {
        this.session = new Session()
        this.cookieService.remove("sessionId")
        this.cookieService.remove("accountId")
        this.cookieService.remove("XSRF-TOKEN")
        this.onClear.next(null)
        this.onSet = new ReplaySubject(1)
    }

    private load(): void {
        let session = new Session()
        session.sessionId = this.cookieService.get("sessionId")
        session.accountId = this.cookieService.get("accountId")
        if(session.validate())
            this.setSession(session)
    }

    private save(): void {
        this.cookieService.put("sessionId", this.session.sessionId)
        this.cookieService.put("accountId", this.session.accountId)
    }
}
