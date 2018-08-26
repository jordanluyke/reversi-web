import {NgModule} from '@angular/core'
import {AppComponent} from './app.component'
import {SharedModule} from '../shared/shared.module'
import {routing} from './app.routing'
import {HomeComponent} from './home/home.component'
import {NavigatorComponent} from './navigator/navigator.component'
import {NotFoundComponent} from './not-found/not-found.component'
import {LogoutComponent} from './logout/logout.component'
import {MatchComponent} from './match/match.component'

@NgModule({
    imports: [
        SharedModule,
        routing,
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        NavigatorComponent,
        NotFoundComponent,
        LogoutComponent,
        MatchComponent,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
