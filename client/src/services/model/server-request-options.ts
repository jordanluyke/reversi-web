import {HttpParams, HttpHeaders} from '@angular/common/http'

export interface ServerRequestOptions {
    headers?: HttpHeaders
    params?: HttpParams
    body?: any
}
