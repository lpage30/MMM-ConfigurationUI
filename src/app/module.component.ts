import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ConfigfileService, ModuleConfiguration } from './configfile.service'
import {
  ConfigurationSpecification, FieldSpecification, FieldValueSpecification,
  isConfigurationSpecification, isFunction, isPickList, isScalar, toFieldValueDataType,
} from './mmm-configuration-specification'

export interface RenderableFields {
  path: string[]
  name: string
  specification?: FieldValueSpecification
  renderableFields?: RenderableFields[]
  description?: string
  value: any
  isPicklist: boolean
  isFunction: boolean
  isScalar: boolean
  isObject: boolean
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
    const field: FieldSpecification = object[key]
    const newPath = [...path, field.name]
    const isObject = isConfigurationSpecification(field.specification)
    const renderableField: RenderableFields = {
      path: newPath,
      name: key,
      description: field.description,
      value: getValue(newPath, config),
      isPicklist: isPickList(field.specification),
      isFunction: isFunction(field.specification),
      isScalar:  isScalar(field.specification),
      isObject,
    }
    if (isObject) {
      renderableField['renderableFields'] = createRenderableFields(newPath, field.specification as ConfigurationSpecification, config)
    } else {
      renderableField['specification'] = field.specification
    }
    if (renderableField.isScalar) {
      renderableField['scalartype'] = toFieldValueDataType(field.specification).toString()
    } 
    result.push(renderableField)
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
  private renderableFields: RenderableFields[]
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
  getLongestName(renderableFields: RenderableFields[], name: string): string {
    let result = ''
    renderableFields.forEach(field => {
      if (field.name.length > result.length) {
        result = field.name
      }
    })
    return result
  }
  getLongestValue(renderableFields: RenderableFields[], name: string): string {
    let result = ''
    renderableFields.forEach(field => {
      const value = field.isObject ?
      `${this.getLongestName(field.renderableFields, field.name)} ${this.getLongestValue(field.renderableFields, field.name)}` : (field.value || '')
      if (value.length > result.length) {
        result = value
      }
    })
    return result
  }
  getFields(): RenderableFields[] {
    return this.renderableFields || []
  }
  onReset(): void {
    const fields = createRenderableFields([], this.moduleSpec, this.moduleConfig)
    this.renderableFields = fields
    console.log('FIELDS', this.renderableFields)
  }
  onSave(): void {
    this.renderableFields.forEach(field => {
      setValue(field.path, this.moduleConfig, field.value)
    })
    this.configfileService.putModule(this.moduleConfig).subscribe()
  }
}
