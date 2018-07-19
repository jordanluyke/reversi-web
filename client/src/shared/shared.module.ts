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
// import {
//     BsDropdownModule,
//     ModalModule,
// } from 'ngx-bootstrap'


@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        RouterModule,
        // BsDropdownModule.forRoot(),
        // ModalModule.forRoot(),
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
        // BsDropdownModule,
        // ModalModule,
    ]
})
export class SharedModule {}
