import { ConfigfileService, ModuleConfiguration } from './configfile.service'

// type for Field Value
export enum FieldValueDataType {
    STRING = <any>'string',
    NUMBER = <any>'number',
    BIGINT = <any>'bigint',
    BOOLEAN = <any>'boolean',
    SYMBOL = <any>'symbol',
    OBJECT = <any>'object',
    FUNCTION = <any>'function',
    UNDEFINED = <any>'undefined',
    ARRAY = <any>'array',
}
export namespace FieldValueDataType {
    export function reverseLookup(value: string): FieldValueDataType {
        return FieldValueDataType[<string>FieldValueDataType[value]]
    }
}
export function toFieldValueDataType(field: any): FieldValueDataType {
    if (typeof field === 'object') {
        if (field instanceof Array) return FieldValueDataType.ARRAY
        return FieldValueDataType.OBJECT
    }
    return FieldValueDataType.reverseLookup(typeof field)
}

// PickList for Field values
export interface FieldValuePickList {
    choices: string[]
}
// Complete Specification for FieldValue
export type FieldValueSpecification = FieldValueDataType | ConfigurationSpecification | FieldValuePickList | FieldValueSpecificationArray

// Complete Specification for Field
export interface FieldSpecification {
    name: string    // name of field
    specification: FieldValueSpecification // Specification for field's value
    description?: string // help/description for field (if any)
}

export interface ConfigurationSpecification {
    [key: string]: FieldSpecification
}
/**
 * Discern the ConfigurationSpecification from an actual configured module.
 * @param configuration custom configuration from MM config.js module config
 */
export function discernConfigurationSpecification(actualConfiguration: Object): ConfigurationSpecification {
    const result = {}
    Object.keys(actualConfiguration).forEach(key => {
        result[key] = {
            name: key,
            specification: discernFieldValueSpecification(actualConfiguration[key])
        }
    })
    return result
}
/**
 * load a module's configuration specification from the module's directory.
 * @param specification module provided specification for custom configuration
 */
export function loadConfigurationSpecification(configurationSpecification: Object): ConfigurationSpecification {
    console.log('loadConfigurationSpecification', configurationSpecification)
    const result = {}
    Object.keys(configurationSpecification).forEach(key => {
        const { name: fieldName, type: fieldType } = toFieldNameSpecType(key)
        if (typeof(result[fieldName]) === 'undefined') {
            result[fieldName] = {}
            result[fieldName]['name'] = fieldName
        }
        switch(fieldType) {
            case FieldSpecType.PICKLIST_FIELD:
                const enumeration: FieldValuePickList = {
                    choices: configurationSpecification[key]
                }
                result[fieldName]['specification'] = enumeration
                break
            case FieldSpecType.DESCRIPTION_FIELD:
                result[fieldName]['description'] = configurationSpecification[key]
                break
            default:
                result[fieldName]['specification'] = loadFieldValueSpecification(configurationSpecification[key])
                break
        }
    })
    return result
}

export interface RenderableField {
    id: string
    path: string[]
    name: string
    specification: FieldValueSpecification
    renderableFields?: RenderableField[]
    description?: string
    value: any
    isPicklist: boolean
    isFunction: boolean
    isScalar: boolean
    isArray: boolean
    isObject: boolean
    scalartype?: string
}
const emptyValue = (specification: FieldValueSpecification): any => {
    if (isArray(specification)) {
        return []
    }
    if (isConfigurationSpecification(specification)) {
        const result = {}
        Object.keys(specification).forEach(key => {
            result[key] = emptyValue(specification[key].specification)
        })
        return result
    }
    switch(toFieldValueDataType(specification)) {
        case FieldValueDataType.NUMBER:
        case FieldValueDataType.BIGINT:
            return 0
        case FieldValueDataType.BOOLEAN:
            return false
        default:
            return ''
    }
}
export function resetIdentifiers(fields: RenderableField[], path: string[]): void {
    fields.forEach((field, index) => {
        field.name = isNaN(Number(field.name)) ? field.name : index.toString()
        field.path =  [...path, field.name]
        field.id = field.path.join('.')
        if (field.renderableFields) {
            resetIdentifiers(field.renderableFields, field.path)
        }

    })

}
export function getLongestName(renderableFields: RenderableField[]): string {
    let result = '';
    (renderableFields || []).forEach(field => {
        if (field.name.length > result.length) {
        result = field.name
        }
    })
    return result
}
export function getLongestValue(renderableFields: RenderableField[]): string {
    let result = '';
    (renderableFields || []).forEach(field => {
      const value = field.isObject ?
      `${getLongestName(field.renderableFields)} ${getLongestValue(field.renderableFields)}` : (field.value || '')
      if (value.length > result.length) {
        result = value
      }
    })
    return result
}
export function createRenderableField(
    path: string[], name: string,
    specification: FieldValueSpecification,
    config?: ModuleConfiguration,
    description?: string,
): RenderableField {
    const newPath = [...path, name]
    const isObject = isConfigurationSpecification(specification)
    const result: RenderableField = {
        id: [...newPath, name].join('.'),
        path: newPath,
        name,
        description,
        specification,
        value: getValue(newPath, specification, config),
        isPicklist: isPickList(specification),
        isFunction: isFunction(specification),
        isScalar:  isScalar(specification),
        isArray: false,
        isObject,
        renderableFields: undefined,
        scalartype: undefined
    }
    if (isObject) {
        result.renderableFields = createRenderableFields(newPath, specification as ConfigurationSpecification, config)
    }
    if (result.isScalar) {
        const scalarType = toFieldValueDataType(specification)
        if (scalarType === FieldValueDataType.ARRAY) {
            result.isScalar = false
            result.isArray = true
            result.renderableFields = createRenderableArray(newPath, specification as FieldValueSpecificationArray, config)
        } else {
            result.scalartype = scalarType.toString()
        }
    }
    return result  
}

export function createRenderableFields(
    path: string[],
    object: ConfigurationSpecification,
    config?: ModuleConfiguration,
): RenderableField[] {
    let result: RenderableField[] = []
    Object.keys(object).forEach(key => {
        const field: FieldSpecification = object[key]       
        result.push(createRenderableField(path, field.name, field.specification, config, field.description))
    })
    return result
}

export function setValue(path: string[], config: ModuleConfiguration, value: any): void {
    let parent: any = config
    const childField = isNaN(Number(path[path.length - 1])) ? path[path.length - 1] : Number(path[path.length - 1])
    path.forEach((field, index) => {
        if ((index + 1) < path.length) {
            const isArray = !isNaN(Number(path[index + 1]))
            const parentField = isNaN(Number(field)) ? field : Number(field)
            if(!parent[parentField]) {
                if (typeof parentField === 'number') {
                    for(let i = 0; i <= parentField; i++) {
                        if (parent[i]) continue
                        parent.push(null)
                    }
                }
                else {
                    parent[field] = isArray ? [] : { }
                }
            }
            parent = parent[field]
        }
    })
    if (typeof childField === 'number') {
        for(let i = 0; i <= childField; i++) {
            if (parent[i]) continue
            parent.push(null)
        }
    }
    parent[childField] = value
}
export interface RenderableModule {
    canRender: boolean
    name: string
    fields: RenderableField[]
    config: ModuleConfiguration
    spec: ConfigurationSpecification
}
export async function createRenderableModule(moduleName: string, configfileService: ConfigfileService): Promise<RenderableModule> {
    const result = {
        canRender: true,
        name: moduleName,
        config: await configfileService.getModule(moduleName).toPromise(),
        spec: await configfileService.getModuleSpecification('magicmirror', { module: '' }).toPromise(),
        fields: [],
    }
    const moduleSpec = await configfileService.getModuleSpecification(result.config.module, result.config).toPromise()
    result.spec.config.specification = moduleSpec.config.specification
    result.fields = createRenderableFields([], result.spec, result.config)
    return result
}
export async function saveRenderableModule(module: RenderableModule, configfileService: ConfigfileService) {
    const setValues = (fields: RenderableField[]) => {
        fields.forEach(field => {
          if (field.renderableFields) {
            setValues(field.renderableFields)
          } else {
            setValue(field.path, module.config, field.value)
          }
        })
    }
    setValues(module.fields)
    console.log('saving', module.config)
    await configfileService.putModule(module.config).toPromise()
}
// Type of Field being specified
enum FieldSpecType {
    DATATYPE_FIELD = '', // value identifies FieldValueDataType of field
    PICKLIST_FIELD = '_picklist', // value is pick-list for field
    DESCRIPTION_FIELD = '_description' // value is description string for field
}
interface FieldNameSpecType {
    name: string
    type: FieldSpecType
}
function toFieldNameSpecType(fieldSpecName: string): FieldNameSpecType {
    const type = (fieldSpecName.endsWith(FieldSpecType.PICKLIST_FIELD) ? 
    FieldSpecType.PICKLIST_FIELD : 
    (fieldSpecName.endsWith(FieldSpecType.DESCRIPTION_FIELD) ? 
        FieldSpecType.DESCRIPTION_FIELD : FieldSpecType.DATATYPE_FIELD))
    const name = fieldSpecName.substring(0, fieldSpecName.length - type.length)
    return {
        name, type
    }
}

const isObject = (specification: any): boolean  => FieldValueDataType.OBJECT === toFieldValueDataType(specification)

const isFunction = (specification: any): boolean => FieldValueDataType.FUNCTION === toFieldValueDataType(specification)

const isArray = (specification: any): boolean => FieldValueDataType.ARRAY === toFieldValueDataType(specification)

const isScalar = (specification: any): specification is FieldValueDataType => ![
        FieldValueDataType.OBJECT, FieldValueDataType.FUNCTION, FieldValueDataType.UNDEFINED,
    ].includes(toFieldValueDataType(specification))

const isPickList= (specification: any): specification is FieldValuePickList => isObject(specification) &&
    FieldValueDataType.ARRAY == toFieldValueDataType(specification.choices)
type FieldValueSpecificationArray = FieldValueDataType[] | ConfigurationSpecification[] | FieldValuePickList[]

const isFieldValueSpecification = (specification: any): specification is FieldValueSpecification => isPickList(specification) ||
    isFunction(specification) ||
    isArray(specification) ||
    isScalar(specification) ||
    isConfigurationSpecification(specification)

const isFieldSpecification = (value: any): value is FieldSpecification => isObject(value) &&
    typeof(value.name) === 'string' &&
    isFieldValueSpecification(value.specification) &&
    ['undefined', 'string'].includes(typeof(value.description))

const isConfigurationSpecification = (specification: any): specification is ConfigurationSpecification => isObject(specification) &&
    Object.keys(specification)
    .filter(key => isFieldSpecification(specification[key])).length === Object.keys(specification).length

function discernFieldValueSpecification(value: any): FieldValueSpecification {
    const type = toFieldValueDataType(value)
    switch(type) {
        case FieldValueDataType.OBJECT:
            return discernConfigurationSpecification(value)
        case FieldValueDataType.ARRAY:
            const array = []
            value.forEach(value => {
                array.push(discernFieldValueSpecification(value))
            })
            return array
        default:
            return type
    }
}

function loadFieldValueSpecification(value: any): FieldValueSpecification {
    const type = toFieldValueDataType(value)
    switch(type) {
        case FieldValueDataType.OBJECT:
            return loadConfigurationSpecification(value)
        case FieldValueDataType.ARRAY:
            const array = []
            value.forEach(value => {
                array.push(loadFieldValueSpecification(value))
            })
            return array
        case FieldValueDataType.STRING:
            const namedDataType = FieldValueDataType.reverseLookup(value)
            if (namedDataType) {
                return namedDataType
            } // otherwise fall through to default
        default:
            return type
    }
}

function getValue(path: string[], specification: FieldValueSpecification, config?: ModuleConfiguration): any {
    if (config) {
        let result: any = config
        path.forEach(key => {
            result = result[isNaN(Number(key)) ? key : Number(key)]
        })
        return result
    }
    return emptyValue(specification)
}

function createRenderableArray(
        path: string[],
        array: FieldValueSpecificationArray,
        config?: ModuleConfiguration,
): RenderableField[] {
    let result: RenderableField[] = []
    array.forEach((arrayItem, index) => {
        result.push(createRenderableField(path, index.toString(), arrayItem, config))
    })
    return result
}
