import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {HttpClientModule} from '@angular/common/http'
import {CommonModule} from '@angular/common'
import {FormsModule} from '@angular/forms'
import {RouterModule} from '@angular/router'
import {
    CoreService,
    CookieService,
    SessionService,
    SessionGuard,
    AccountService,
    MatchService,
    SocketService,
} from './services/index'
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'
import {FacebookModule} from 'ngx-facebook'

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        RouterModule,
        NgbModule.forRoot(),
        FacebookModule.forRoot(),
    ],
    declarations: [
    ],
    providers: [
        CoreService,
        CookieService,
        SessionService,
        SessionGuard,
        AccountService,
        MatchService,
        SocketService,
    ],
    exports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        RouterModule,
        NgbModule,
        FacebookModule,
    ]
})
export class SharedModule {}
