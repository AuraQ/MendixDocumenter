export namespace ProjectData{
    export interface Project {
        name : string,
        description : string,
        modules : Module[]
    }

    export interface Module {
        name : string,
        documentation : string
        entities : Entity[],
        associations : Association[],
        enumerations : Enumeration[],
        microflows : Microflow[],
        javaActions : JavaAction[],
        pages : Page[]
    }

    export interface Entity {        
        name : string,
        documentation : string,
        generalization? : string,
        attributes : Attribute[],
        eventHandlers : EventHandler[]
    }

    export interface Attribute {
        name : string,
        type : AttributeType,
        documentation : string
    }

    export interface EventHandler {
        moment : string,
        event : string,
        microflow : string,
        raisesError : boolean
    }

    export interface Association {
        name : string,
        owner : string,
        parent : string,
        child : string,
        documentation : string
    }

    export interface Enumeration {      
        name : string,
        documentation : string,
        items : EnumerationItem[]
    }

    export interface EnumerationItem {
        caption : string,
        name : string
    }

    export interface Microflow {           
        name : string,
        documentation : string,
        returnType : DataType,
        parameters : MicroflowParameter[]
    }

    export interface MicroflowParameter {           
        name : string,
        documentation : string,
        type : DataType
    }

    export interface JavaAction {         
        name : string,
        documentation : string,
        returnType : ActionType,
        parameters : JavaActionParameter[]
    }

    export interface JavaActionParameter {           
        name : string,
        description : string,
        type : ActionType
    }

    export interface Page {          
        name : string,
        documentation : string,
        title : string,
        url : string,
        class : string,
        layout : string | null
    }

    export interface AttributeType {
        name : string
        enumeration? : string
    }

    export interface DataType {
        name : string,
        entity? : string,
        enumeration? : string
    }

    export interface ActionType {
        name : string,
        entity? : string,
        enumeration? : string,
        typeParameter? : string
    }
}

export namespace ProjectConfig{
    export interface Config {
        auth : Auth,
        project : Project,
        app : App
    }

    export interface Auth{
        username : string,
        apikey : string
    }

    export interface Project{
        id : string,
        name : string,
        description : string,
        branch : string,
        revision : number
    }

    export interface App{
        language_code : string,
        modules : string[],
        saveProjectDataAsJson : boolean,
        rootOutputFolder : string
    }
}