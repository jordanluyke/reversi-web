import {Injectable} from '@angular/core'
import {TimeUnit} from '../util/index'

/**
 * @author Jordan Luyke
 */

@Injectable({
    providedIn: "root"
})
export class CookieService {

    public get(name: string): string | null {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null
    }

    public remove(name: string): void {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    }

    public put(key: string, value: string, options: any = {}): void {
        options.path = options.path || "/"
        options.secure = location.protocol == "https:"
        options.expires = options.expires || "" + (TimeUnit.DAYS.toMillis(7) + new Date().getTime())
        let cookie = key + "=" + value
        for(let property in options)
            cookie += ";" + property + options[property]
        document.cookie = cookie
    }
}
