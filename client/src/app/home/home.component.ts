import {Component, OnInit} from '@angular/core'
import {ApiService, Session, AccountService, SessionService, Instant} from '../../shared/index'
import {tap, flatMap} from 'rxjs/operators'

@Component({
    selector: 'home-component',
    styleUrls: ['home.css'],
    templateUrl: 'home.html'
})
export class HomeComponent implements OnInit {

    public signInVisible = false
    public email?: string
    public reqInProgress = false

    constructor(
        private apiService: ApiService,
        public accountService: AccountService,
        private sessionService: SessionService,
    ) {}

    public ngOnInit(): void {
    }

    public clickSignIn(): void {
        this.signInVisible = true
    }

    public submitSignIn(): void {
        this.reqInProgress = true
        this.apiService.post("/sessions", {
            body: {
                email: this.email
            }
        })
            .pipe(
                tap(body => {
                    let session = new Session()
                    session.accountId = body.accountId
                    session.sessionId = body.sessionId
                    session.expiresAt = Instant.fromMillis(body.expiresAt)
                    this.sessionService.setSession(session)
                }),
                flatMap(body => this.accountService.onLoad),
                tap(Void => {
                    this.signInVisible = false
                    this.reqInProgress = false
                })
            )
            .subscribe(Void => {}, err => {
                this.reqInProgress = false
                console.error(err)
            })
    }
}
