import {ModuleWithProviders} from '@angular/core'
import {Routes, RouterModule} from '@angular/router'
import {AccountService, SessionGuard, MatchService, CoreConfigService, PusherService} from '../shared/index'
import {HomeComponent} from './home/home.component'
import {NavigatorComponent} from './navigator/navigator.component'
import {NotFoundComponent} from './not-found/not-found.component'
import {LogoutComponent} from './logout/logout.component'
import {MatchComponent} from './match/match.component'
import {NotSupportedComponent} from './not-supported/not-supported.component'

const routes: Routes = [
    {
        path: '',
        component: NavigatorComponent
    }, {
        path: 'home',
        component: HomeComponent
    }, {
        path: 'matches/:id',
        // canActivate: [SessionGuard],
        resolve: [
            // AccountService,
            MatchService,
        ],
        component: MatchComponent
    }, {
        path: 'logout',
        component: LogoutComponent
    }, {
        path: '404',
        component: NotFoundComponent
    }, {
        path: 'not-supported',
        component: NotSupportedComponent,
    }, {
        path: '**',
        redirectTo: '/404',
        pathMatch: 'full'
    }
]

export const routing: ModuleWithProviders = RouterModule.forRoot(routes)
