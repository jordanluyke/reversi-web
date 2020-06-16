import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {HttpClientModule} from '@angular/common/http'
import {CommonModule} from '@angular/common'
import {FormsModule} from '@angular/forms'
import {RouterModule} from '@angular/router'
import {
    CoreApiService,
    CookieService,
    SessionService,
    SessionGuard,
    AccountService,
    MatchService,
    CoreConfigService,
    PusherService,
    LobbyService,
} from './services/index'
import {NgbModule} from '@ng-bootstrap/ng-bootstrap'
import {SocialAuthService, GoogleLoginProvider, FacebookLoginProvider, SocialAuthServiceConfig} from 'angularx-social-login'

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
        CoreApiService,
        CookieService,
        SessionService,
        SessionGuard,
        AccountService,
        MatchService,
        CoreConfigService,
        PusherService,
        LobbyService,
        SocialAuthService,
        {
            provide: "SocialAuthServiceConfig",
            useValue: {
                autoLogin: false,
                providers: [
                    {
                        id: GoogleLoginProvider.PROVIDER_ID,
                        provider: new GoogleLoginProvider("189745405951-mr203k8jk71l5vtsp94c84b6de2asft6.apps.googleusercontent.com")
                    },
                    {
                        id: FacebookLoginProvider.PROVIDER_ID,
                        provider: new FacebookLoginProvider("1838714972907653"),
                    },
                ]
            } as SocialAuthServiceConfig,
        }
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
