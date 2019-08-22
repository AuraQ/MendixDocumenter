import {ProjectData} from '../namespaces';
import { action } from 'mobx';

export function getModuleEntityLinkFromString(value : string, modules : string[]) : string {
    const module = value.split(".")[0];
    const entity = value.split(".")[1];

    if (modules.includes(module)) {
        return `[${module}](/module/${module}.md).[${entity}](/entity/${module}_${entity}.md)`;
    } else {
        return value;
    }
}

export function getModuleMicroflowLinkFromString(value : string, modules : string[]) : string {
    const module = value.split(".")[0];
    const microflow = value.split(".")[1];

    if (modules.includes(module)) {
        return `[${module}](/microflow/${module}.md).[${microflow}](/microflow/${module}_${microflow}.md)`;
    } else {
        return value;
    }
}

export function getModuleEnumerationLinkFromString(value : string, modules : string[]) : string {
    const module = value.split(".")[0];
    const enumeration = value.split(".")[1];

    if (modules.includes(module)) {
        return `[${module}](/enumeration/${module}.md).[${enumeration}](/enumeration/${module}_${enumeration}.md)`;
    } else {
        return value;
    }
}

export function getAttributeTypeAsString(attributeType : ProjectData.AttributeType, modules : string[]) : string {
    if(attributeType.name === 'Enumeration' && attributeType.enumeration){
        return `Enumeration (${getModuleEnumerationLinkFromString(attributeType.enumeration, modules)})`;
    }

    return attributeType.name;
}

export function getActionTypeAsString(actionType : ProjectData.ActionType, modules : string[]) : string {
    let module = "";
    let entity = "";
    let enumeration = "";

    switch(actionType.name){
        case "List":
        case "Entity":
            if(!actionType.entity){                
                if(actionType.typeParameter){
                    return `${actionType.name} (Type parameter '${actionType.typeParameter}')`;
                }
                
                return actionType.name;
            }
            module = actionType.entity.split(".")[0];
            entity = actionType.entity.split(".")[1];
            if (modules.includes(module)) {
                return `${actionType.name} ((${getModuleEntityLinkFromString(actionType.entity, modules)}))`;
            } else {
                return `${actionType.name} (${module}.${entity})`;
            }
        case "Enumeration":
            if(!actionType.enumeration){
                return actionType.name;
            }
            module = actionType.enumeration.split(".")[0];
            enumeration = actionType.enumeration.split(".")[1];
            if (modules.includes(module)) {
                return `${actionType.name} (${getModuleEnumerationLinkFromString(actionType.enumeration, modules)})`;
            } else {
                return `${actionType.name} (${module}.${enumeration})`;
            }
        default:
            return actionType.name;
    }
}

export function getDataTypeAsString(dataType : ProjectData.DataType, modules : string[]) : string {
    let module = "";
    let entity = "";
    let enumeration = "";

    switch(dataType.name){
        case "List":
        case "Object":
            if(dataType.entity){
                module = dataType.entity.split(".")[0];
                entity = dataType.entity.split(".")[1];
                if (modules.includes(module)) {
                    return `${dataType.name} (${getModuleEntityLinkFromString(dataType.entity, modules)})`;
                } else {
                    return `${dataType.name} (${module}.${entity})`;
                }
            }

            return dataType.name;
            
        case "Enumeration":
            if(dataType.enumeration){
                module = dataType.enumeration.split(".")[0];
                enumeration = dataType.enumeration.split(".")[1];
                if (modules.includes(module)) {
                    return `Enumeration (${getModuleEnumerationLinkFromString(dataType.enumeration, modules)})`;
                } else {
                    return dataType.name;
                }
            }

            return dataType.name;
        default:
            return dataType.name;
    }
}