import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators';

const CONFIGURATION_URL = 'http://localhost:3001/configuration'

export interface AnyObject {
  [key: string]: any
}
export interface Module {
  module: string
  position: string
  config: AnyObject
}
@Injectable({
	providedIn: 'root'
})

export class ConfigfileService {
  constructor(private http: HttpClient) { }

  getModules(): Observable<Module[]> {
    return this.http.get<{ modules: Module[] }>(CONFIGURATION_URL)
      .pipe(map(value => value.modules))
  }

  putModules(modules: Module[]): Observable<void> {
    return this.http.put<void>(CONFIGURATION_URL, { modules })
  }
}