import {NgModule} from '@angular/core'
import {AppComponent} from './app.component'
import {SharedModule} from '../shared/shared.module'
import {routing} from './app.routing'
import {
    NavigatorComponent,
    HomeComponent,
    NotFoundComponent,
} from './index'

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
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
