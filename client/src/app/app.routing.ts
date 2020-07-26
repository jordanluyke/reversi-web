import {ModuleWithProviders} from '@angular/core'
import {Routes, RouterModule} from '@angular/router'
import {MatchService, LobbyService} from '../shared/index'
import {HomeComponent} from './home/home.component'
import {NavigatorComponent} from './navigator/navigator.component'
import {NotFoundComponent} from './not-found/not-found.component'
import {LogoutComponent} from './logout/logout.component'
import {MatchComponent} from './match/match.component'
import {NotSupportedComponent} from './not-supported/not-supported.component'
import {LobbyComponent} from './lobby/lobby.component'
import {LobbiesComponent} from './lobbies/lobbies.component'

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
        path: 'lobbies',
        component: LobbiesComponent
    }, {
        path: 'lobbies/:id',
        resolve: [
            LobbyService,
        ],
        component: LobbyComponent
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

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forRoot(routes)
