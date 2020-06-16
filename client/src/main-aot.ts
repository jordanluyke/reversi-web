import '@angular/localize/init'
import {platformBrowser} from '@angular/platform-browser'
import {AppModule} from './app/app.module'
import {enableProdMode} from '@angular/core'

enableProdMode()
platformBrowser().bootstrapModule(AppModule)
