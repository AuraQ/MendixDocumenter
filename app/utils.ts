import { domainmodels, IStructure, projects, datatypes, codeactions, texts } from 'mendixmodelsdk'
import {ProjectData} from './namespaces';

export function getModule(element: IStructure): projects.Module|null {
    let current = element.unit;
    while (current) {
        if (current instanceof projects.Module) {
            return current;
        }
        current = current.container;
    }
    return null;
}

export function getTypeFromAttributeType(type: domainmodels.AttributeType): ProjectData.AttributeType {
    let returnData : any = {};

    if (type instanceof domainmodels.AutoNumberAttributeType) {
        returnData.name = "AutoNumber";
    } else if (type instanceof domainmodels.BinaryAttributeType) {
        returnData.name = "Binary";
    } else if (type instanceof domainmodels.BooleanAttributeType) {
        returnData.name = "Boolean";
    } else if (type instanceof domainmodels.CurrencyAttributeType) {
        returnData.name = "Currency";   
    } else if (type instanceof domainmodels.DateTimeAttributeType) {
        returnData.name = "DateTime";
    }  else if (type instanceof domainmodels.DecimalAttributeType) {
        returnData.name = "Decimal";
    } else if (type instanceof domainmodels.EnumerationAttributeType) {
        returnData.name = "Enumeration";
        const module = type.enumerationQualifiedName.split(".")[0];
        const enumeration = type.enumerationQualifiedName.split(".")[1];
        returnData.enumeration = `${module}.${enumeration}`;
    } else if (type instanceof domainmodels.FloatAttributeType) {
        returnData.name = "Float";
    } else if (type instanceof domainmodels.HashedStringAttributeType) {
        returnData.name = "HashedString";
    } else if (type instanceof domainmodels.IntegerAttributeType) {
        returnData.name = "Integer";
    } else if (type instanceof domainmodels.LongAttributeType) {
        returnData.name = "Long";
    } else if (type instanceof domainmodels.StringAttributeType) {
        returnData.name = "String";
    }

    return {
        name : returnData.name,
        enumeration : returnData.enumeration
    };
}

export function getTypeFromDataType(type: datatypes.DataType): ProjectData.DataType {
    let returnData : any = {};

    if (type instanceof datatypes.BinaryType) {
        returnData.name = "Binary";
    } else if (type instanceof datatypes.ListType) {
        returnData.name = "List"
        const module = type.entityQualifiedName.split(".")[0];
        const entity = type.entityQualifiedName.split(".")[1];
        returnData.entity = `${module}.${entity}`;
    } else if (type instanceof datatypes.BooleanType) {
        returnData.name = "Boolean";
    } else if (type instanceof datatypes.DateTimeType) {
        returnData.name = "DateTime";
    } else if (type instanceof datatypes.DecimalType) {
        returnData.name = "Decimal";
    } else if (type instanceof datatypes.EmptyType) {
        returnData.name = "Empty";
    } else if (type instanceof datatypes.ObjectType) {
        returnData.name = "Object"
        let inner_type = <datatypes.EntityType>(type);
        if (inner_type.entityQualifiedName != null) {
            const module = type.entityQualifiedName.split(".")[0];
            const entity = type.entityQualifiedName.split(".")[1];
            returnData.entity = `${module}.${entity}`;
        }
    } else if (type instanceof datatypes.EnumerationType) {        
        returnData.name = "Enumeration"
        const module = type.enumerationQualifiedName.split(".")[0];
        const enumeration = type.enumerationQualifiedName.split(".")[1];
        returnData.enumeration = `${module}.${enumeration}`;
    } else if (type instanceof datatypes.FloatType) {
        returnData.name = "Float";
    } else if (type instanceof datatypes.IntegerType) {
        returnData.name = "Integer";
    }  else if (type instanceof datatypes.StringType) {
        returnData.name = "String";
    } else if (type instanceof datatypes.UnknownType) {
        returnData.name = "Unknown";
    } else if (type instanceof datatypes.VoidType) {
        returnData.name = "-";
    }

    if (!returnData.name) {
        returnData.name = type.constructor.name;
    }

    return {
        name : returnData.name,
        entity : returnData.entity,
        enumeration : returnData.enumeration
    };
}

export function getTypeFromActionType(type: codeactions.Type): ProjectData.ActionType {
    let returnData : any = {};

    if (type instanceof codeactions.BooleanType) {
        returnData.name = "Boolean";
    } else if (type instanceof codeactions.ListType) {
        returnData.name = "List";
        if(type instanceof codeactions.ParameterizedEntityType){
            const typeParameterName = (<codeactions.ParameterizedEntityType>type).typeParameter.name;
            returnData.typeParameter = typeParameterName;
        }
        else{
            const module = (<codeactions.ConcreteEntityType>type.parameter).entityQualifiedName.split(".")[0];
            const entity = (<codeactions.ConcreteEntityType>type.parameter).entityQualifiedName.split(".")[1];
            returnData.entity = `${module}.${entity}`;
        }
    } else if (type instanceof codeactions.EntityType) {
        returnData.name = "Entity";
        if(type instanceof codeactions.ParameterizedEntityType){
            const typeParameterName = (<codeactions.ParameterizedEntityType>type).typeParameter.name;
            returnData.typeParameter = typeParameterName;
        }
        else{
            const module = (<codeactions.ConcreteEntityType>type).entityQualifiedName.split(".")[0];
            const entity = (<codeactions.ConcreteEntityType>type).entityQualifiedName.split(".")[1];
            returnData.entity = `${module}.${entity}`;
        }    
    } else if (type instanceof codeactions.DateTimeType) {
        returnData.name = "DateTime";
    }  else if (type instanceof codeactions.DecimalType) {
        returnData.name = "Decimal";
    } else if (type instanceof codeactions.EnumerationType) {
        returnData.name = "Enumeration";
        const module = type.enumerationQualifiedName.split(".")[0];
        const enumeration = type.enumerationQualifiedName.split(".")[1];
        returnData.enumeration = `${module}.${enumeration}`;
    } else if (type instanceof codeactions.FloatType) {
        returnData.name = "Float";
    } else if (type instanceof codeactions.IntegerType) {
        returnData.name = "Integer";
    } else if (type instanceof codeactions.StringType) {
        returnData.name = "String";
    }

    return {
        name : returnData.name,
        entity : returnData.entity,
        enumeration : returnData.enumeration,
        typeParameter : returnData.typeParameter
    };
}

export function getStringFromText(text: texts.Text, languageCode : string): string {
    const result = text.translations.filter(tl => {
        return (tl.languageCode === languageCode);
    })[0];

    return (result.text);
}