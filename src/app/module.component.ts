import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ConfigfileService, ModuleConfiguration } from './configfile.service'
import {
  ConfigurationSpecification, FieldValueSpecification,
  isConfigurationSpecification, isFunction, isPickList, isScalar, toFieldValueDataType,
} from './mmm-configuration-specification'

export interface RenderableFields {
  path: string[]
  name: string
  specification: FieldValueSpecification
  description?: string
  value: any
  isPicklist: boolean
  isFunction: boolean
  isScalar: boolean
  scalartype?: string
}
function getValue(path: string[], config: ModuleConfiguration): any {
  let result: any = config
  path.forEach(key => {
    result = result[key]
  })
  return result
}
function setValue(path: string[], config: ModuleConfiguration, value: any): void {
  let parent: any = config
  path.forEach((field, index) => {
    if ((index + 1) < path.length) {
      if(!parent[field]) {
        parent[field] = {} // fill in as we go if its missing
      }
      parent = parent[field]
    }
  })
  parent[path[path.length - 1]] = value
}

function createRenderableFields(path: string[], object: ConfigurationSpecification, config: ModuleConfiguration): RenderableFields[] {
  let result: RenderableFields[] = []
  Object.keys(object).forEach(key => {
    if (isConfigurationSpecification(object[key].specification)) {
      result.push(...createRenderableFields([...path, key], <ConfigurationSpecification><any>object[key].specification, config))
    } else {
      const renderableField: RenderableFields = {
        path: [...path, key],
        name: key,
        specification: object[key].specification,
        description: object[key].description,
        value: getValue([...path, key], config),
        isPicklist: isPickList(object[key].specification),
        isFunction: isFunction(object[key].specification),
        isScalar:  isScalar(object[key].specification), 
      }
      if (renderableField.isScalar) {
        renderableField['scalartype'] = toFieldValueDataType(object[key].specification).toString()
      }
      result.push(renderableField)
    }
  })
  return result
}
@Component({
  selector: 'app-root',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.scss'],
  providers: [ConfigfileService]
})
export class ModuleComponent {
  title: string
  private moduleConfig: ModuleConfiguration
  private moduleSpec: ConfigurationSpecification
  fields: RenderableFields[]
  constructor(private configfileService: ConfigfileService, private route: ActivatedRoute) { }

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
      console.log('GOT HERE')
      this.onReset()
    })
  }
  onReset(): void {
    this.fields = createRenderableFields([], this.moduleSpec, this.moduleConfig)
  }
  onSave(): void {
    this.fields.forEach(field => {
      setValue(field.path, this.moduleConfig, field.value)
    })
    this.configfileService.putModule(this.moduleConfig).subscribe()
  }
}
