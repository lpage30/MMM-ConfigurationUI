import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators';
export interface ModuleConfiguration {
  module: string
  [key: string]: any
}

const CONFIGURATION_URL = 'http://localhost:8080/configuration'

@Injectable({
	providedIn: 'root'
})
export class ConfigfileService {
  constructor(private http: HttpClient) { }

  getModules(): Observable<ModuleConfiguration[]> {
    return this.http.get<{ modules: ModuleConfiguration[] }>(CONFIGURATION_URL)
      .pipe(map(value => {
        console.log('RECEIVED', value)
        return value.modules
      }))
  }

  putModules(modules: ModuleConfiguration[]): Observable<void> {
    return this.http.put<void>(CONFIGURATION_URL, { modules })
  }
}