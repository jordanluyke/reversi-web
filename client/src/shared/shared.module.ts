import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {HttpClientModule} from '@angular/common/http'
import {CommonModule} from '@angular/common'
import {FormsModule} from '@angular/forms'
import {RouterModule} from '@angular/router'
import {
    ApiService,
    CookieService,
    SessionService,
    SessionGuard,
    AccountService,
} from './services/index'
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'


@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        RouterModule,
        NgbModule,
    ],
    declarations: [
    ],
    providers: [
        ApiService,
        CookieService,
        SessionService,
        SessionGuard,
        AccountService,
    ],
    exports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        RouterModule,
        NgbModule,
    ]
})
export class SharedModule {}
