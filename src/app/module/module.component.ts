import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ConfigfileService, ModuleConfiguration } from '../configfile.service'
import {
  ConfigurationSpecification, createRenderableFields, getLongestName, getLongestValue, 
  RenderableField, setValue,
} from '../mmm-configuration-specification'
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.scss'],
  providers: [ConfigfileService]
})
export class ModuleComponent implements OnInit {
  title: string
  private moduleConfig: ModuleConfiguration
  private moduleSpec: ConfigurationSpecification
  private fieldSubject$: BehaviorSubject<RenderableField[]>
  fields$: Observable<RenderableField[]>
  constructor(private configfileService: ConfigfileService, private route: ActivatedRoute) { 
    this.fieldSubject$ = new BehaviorSubject<RenderableField[]>([])
    this.fields$ = this.fieldSubject$.asObservable()
  }

  ngOnInit(): void {
    this.route.paramMap
    .pipe(
      switchMap(params => {
        const name = params.get('name')
        this.title = name
        return this.configfileService.getModule(name)
      }),
      switchMap((moduleConfig: ModuleConfiguration) => {
          this.moduleConfig = moduleConfig
          return this.configfileService.getModuleSpecification('magicmirror', { module: '' })
      }),
      switchMap((magicMirrorSpec: ConfigurationSpecification) => {
        this.moduleSpec = magicMirrorSpec
        return this.configfileService.getModuleSpecification(this.moduleConfig.module, this.moduleConfig)
      }),
    ).subscribe((moduleSpec: ConfigurationSpecification) => {
      this.moduleSpec.config.specification = moduleSpec.config.specification
      this.reset()
    })
  }
  getLongestName(renderableFields: RenderableField[]): string {
    return getLongestName(renderableFields)
  }
  getLongestValue(renderableFields: RenderableField[]): string {
    return getLongestValue(renderableFields)
  }

  reset(): void {
    const fields = createRenderableFields([], this.moduleSpec, this.moduleConfig)
    console.log('Reset', fields)
    this.fieldSubject$.next(fields)
  }
  submit(): void {
    console.log('submit', this.moduleConfig)
    this.fields$.subscribe(fields => {
      fields.forEach(field =>setValue(field.path, this.moduleConfig, field.value))
      this.configfileService.putModule(this.moduleConfig).subscribe()
    })
  }
}
