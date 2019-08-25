import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { of, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators';
import { AppSettingsService } from './app.settings.service'
export interface ModuleConfiguration {
  module: string
  [key: string]: any
}


@Injectable({
  providedIn: 'root',
})
export class ConfigfileService {
  private configurationURI: string
  constructor(private http: HttpClient, private settings: AppSettingsService) { }
  getModules(): Observable<ModuleConfiguration[]> {
    return this.getConfigurationURI().pipe(switchMap(configURI => this.http
      .get<{ modules: ModuleConfiguration[] }>(configURI)
          .pipe(map(value => {
            console.log('RECEIVED', value)
            return value.modules
          }))))
  }

  putModules(modules: ModuleConfiguration[]): Observable<void> {
    return this.getConfigurationURI()
    .pipe(switchMap(configURI => this.http
      .put<void>(configURI, { modules })))
  }
  private getConfigurationURI(): Observable<string> {
    if (this.configurationURI) {
      return of(this.configurationURI)
    } else {
      return this.settings.getSettings()
        .pipe(map(settings => {
          this.configurationURI = `${settings.configModuleURI}/configuration`
          return this.configurationURI
        }))
    }
  }

}