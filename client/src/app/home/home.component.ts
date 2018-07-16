import {Component, OnInit} from '@angular/core'
import {ApiService, ErrorHandlingSubscriber} from '../../shared/index'
import {tap} from '../../../node_modules/rxjs/operators'

@Component({
    selector: 'home-component',
    styleUrls: ['home.css'],
    templateUrl: 'home.html'
})
export class HomeComponent implements OnInit {

    public signInVisible = false
    public email?: string
    public reqInProgress = false
    public signedIn = false

    constructor(
        private apiService: ApiService,
    ) {}

    public ngOnInit(): void {
    }

    public clickSignIn(): void {
        this.signInVisible = true
    }

    public submitSignIn(): void {
        console.log(this.email)
        this.reqInProgress = true
        this.apiService.post("/accounts", {
            body: {
                email: this.email
            }
        })
            .pipe(
                tap((body: any) => {
                    console.log(body)
                    this.reqInProgress = false
                    this.signInVisible = false
                    this.signedIn = true
                })
            )
            .subscribe(Void => {

            }, err => {
                this.reqInProgress = false
                console.error(err)
            })
    }
}
