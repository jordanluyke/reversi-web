import {Component, OnInit} from '@angular/core'
import {ApiService, Session, AccountService, SessionService} from '../../shared/index'

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
            .subscribe(body => {
                let session = new Session()
                session.accountId = body.accountId
                session.sessionId = body.sessionId
                session.expiresAt = new Date(body.expiresAt)
                this.sessionService.setSession(session)

                this.reqInProgress = false
                this.signInVisible = false
            }, err => {
                this.reqInProgress = false
                console.error(err)
            })
    }
}
