import {ModuleWithProviders} from '@angular/core'
import {Routes, RouterModule} from '@angular/router'
import {
    NavigatorComponent,
    HomeComponent,
    NotFoundComponent,
} from './index'

const routes: Routes = [
    {
        path: '',
        component: NavigatorComponent
    }, {
        path: 'home',
        component: HomeComponent,
    }, {
        path: '404',
        component: NotFoundComponent
    }, {
        path: '**',
        redirectTo: '/404',
        pathMatch: 'full'
    }
]

export const routing: ModuleWithProviders = RouterModule.forRoot(routes)
