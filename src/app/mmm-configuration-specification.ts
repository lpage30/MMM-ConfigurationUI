// Type of Field being specified
enum FieldSpecType {
    DATATYPE_FIELD = '', // value identifies FieldValueDataType of field
    PICKLIST_FIELD = '_picklist', // value is pick-list for field
    DESCRIPTION_FIELD = '_desciption' // value is description string for field
}
interface FieldNameSpecType {
    name: string
    type: FieldSpecType
}
namespace FieldSpecType {
    export function toFieldNameSpecType(fieldSpecName: string): FieldNameSpecType {
        const type = (fieldSpecName.endsWith(FieldSpecType.PICKLIST_FIELD) ? 
        FieldSpecType.PICKLIST_FIELD : 
        (fieldSpecName.endsWith(FieldSpecType.DESCRIPTION_FIELD) ? 
            FieldSpecType.DESCRIPTION_FIELD : FieldSpecType.DATATYPE_FIELD))
        const name = fieldSpecName.substring(0, fieldSpecName.length - type.length)
        return {
            name, type
        }
    }
}
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
export type FieldValueSpecification = FieldValueDataType | ConfigurationSpecification | FieldValuePickList |
FieldValueDataType[] | ConfigurationSpecification[] | FieldValuePickList[]

// Complete Specification for Field
export interface FieldSpecification {
    name: string    // name of field
    specification: FieldValueSpecification // Specification for field's value
    description?: string // help/description for field (if any)
}

export interface ConfigurationSpecification {
    [key: string]: FieldSpecification
}

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
/**
 * Discern the ConfigurationSpecification from an actual configured module.
 * @param configuration custom configuration from MM config.js module config
 */
export function discernConfigurationSpecification(actualConfiguration: Object): ConfigurationSpecification {
    const result = {}
    Object.keys(actualConfiguration).forEach(key => {
        result[key] = {
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
    const result = {}
    Object.keys(configurationSpecification).forEach(key => {
        const { name: fieldName, type: fieldType } = FieldSpecType.toFieldNameSpecType(key)
        if (result[fieldName]) {
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
                result[key]['specification'] = loadFieldValueSpecification(configurationSpecification[key])
                break
        }
    })
    return result

}