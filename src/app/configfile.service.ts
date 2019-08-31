import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { of, Observable, throwError } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppSettingsService } from './app.settings.service'
import { 
  ConfigurationSpecification, discernConfigurationSpecification, loadConfigurationSpecification,
} from './mmm-configuration-specification'

export interface ModuleConfiguration {
  module: string
  [key: string]: any
}
interface RestResponse {
  success: boolean
  [key: string]: any
}
interface ErrorResponse extends RestResponse {
  error: Error
}
function isHttpError(arg: any): arg is HttpErrorResponse {
  return arg && arg.status && typeof(arg.status) == 'number';
}
interface ModuleResponse extends RestResponse {
  module: ModuleConfiguration
}
interface ModulesResponse extends RestResponse {
  modules: ModuleConfiguration[]
}
interface SpecResponse extends RestResponse {
  spec: Object
}

@Injectable({
  providedIn: 'root',
})
export class ConfigfileService {
  private baseURI: string
  constructor(private http: HttpClient, private settings: AppSettingsService) { }
  private get(path: string): Observable<RestResponse> {
    return this.getBaseURI()
      .pipe(switchMap(baseURI => this.http
        .get<RestResponse>(`${baseURI}/${path}`)
          .pipe(map(value => {
              console.log(`RECEIVED ${value.success}`, path)
              return value
          }),
          ),
        ),
        catchError((err: HttpErrorResponse) => {
          console.error('FAILED', path, err)
          return of({
            success: false,
            error: err
          } as RestResponse)
        }),
      )
  }
  getModules(): Observable<ModuleConfiguration[]> {
    return this.get('configurations')
     .pipe(map((value: RestResponse) => {
       if (value.success) return (value as ModulesResponse).modules
       throwError((value as ErrorResponse).error)
      }))
  }
  getModule(name: string): Observable<ModuleConfiguration> {
    return this.get(`configuration/${name}`)
      .pipe(map((value: RestResponse) => {
        if (value.success) return (value as ModuleResponse).module
        throwError((value as ErrorResponse).error)
      }))
  }
  getModuleSpecification(moduleName: string, configuration: ModuleConfiguration): Observable<ConfigurationSpecification> {
    return this.get(`specification/${moduleName}`)
      .pipe(map((value: RestResponse) => {
        if (value.success) {
          return loadConfigurationSpecification((value as SpecResponse).spec)
        } else {
          const error: ErrorResponse = value as ErrorResponse
          if (isHttpError(error.error) && error.error.status == 404) {
            return discernConfigurationSpecification(configuration)
          }
          throwError(error.error)
        }
      }))
  }
  putModules(modules: ModuleConfiguration[]): Observable<void> {
    return this.getBaseURI()
     .pipe(switchMap(baseURI => this.http
      .put<void>(`${baseURI}/configurations`, { modules })))
  }
  putModule(module: ModuleConfiguration): Observable<void> {
    return this.getBaseURI()
     .pipe(switchMap(baseURI => this.http
      .put<void>(`${baseURI}/configuration`, { module })))
  }
  private getBaseURI(): Observable<string> {
    if (this.baseURI) {
      return of(this.baseURI)
    } else {
      return this.settings.getSettings()
        .pipe(map(settings => {
          this.baseURI = settings.configModuleURI
          return this.baseURI
        }))
    }
  }

}