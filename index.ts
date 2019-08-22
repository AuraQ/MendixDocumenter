import { MendixSdkClient, Project, Revision, Branch, OnlineWorkingCopy } from 'mendixplatformsdk';
import { domainmodels, IStructure, projects, microflows, datatypes, codeactions, texts } from 'mendixmodelsdk'
import fs from 'fs';
import {index_html_template, main_content_template, module_content_template, 
    entity_content_template, enumeration_content_template,java_action_content_template,
    microflow_content_template, page_content_template} from './app/templates';
import {ProjectData} from './app/namespaces'
import {getModule, getTypeFromAttributeType, getTypeFromDataType, getTypeFromActionType, getStringFromText} from './app/utils';

/****** DATA RETRIEVAL FUNCTIONS ******/
async function getEntitiesForModule(domain_model: domainmodels.IDomainModel,
    module: projects.IModule) :Promise<ProjectData.Entity[]> {
    let entities : ProjectData.Entity[] = [];

    for (let j = 0; j < domain_model.entities.length; ++j) {
        const entity = await domain_model.entities[j].load();
        console.log("  -Entity: " + entity.name);

        const entityName = entity.name;
        const entityDocumentation = entity.documentation;

        let entityGeneralization : string | undefined = undefined;

        if (entity.generalization instanceof domainmodels.Generalization) {
            const generalization_module = (await entity.generalization.load()).generalizationQualifiedName.split(".")[0];
            const generalization_entity = entity.generalization.generalizationQualifiedName.split(".")[1];
            
            entityGeneralization = `${generalization_module}.${generalization_entity}`;
        }

        let attributes : ProjectData.Attribute[] = [];

        for (let k = 0; k < entity.attributes.length; ++k) {
            
            const attribute = await entity.attributes[k].load();
            console.log("    -Attribute: " + attribute.name);
        
            attributes.push({
                name : attribute.name,
                documentation : attribute.documentation,
                type : getTypeFromAttributeType(attribute.type)
            });
        }

        let eventHandlers : ProjectData.EventHandler[] = [];

        for (let k = 0; k < entity.eventHandlers.length; ++k) {
            const event_handler = await entity.eventHandlers[k].load();
            console.log("    -Event: " + event_handler.moment.name + " " + event_handler.event.name);

            const microflow_module = (event_handler.microflowQualifiedName != null) ? event_handler.microflowQualifiedName.split(".")[0] : "";
            const microflow_name = (event_handler.microflow != null) ? event_handler.microflow.name : "";

            const microflow = `${microflow_module}.${microflow_name}`;
            eventHandlers.push({
                moment : event_handler.moment.name,
                event : event_handler.event.name,
                microflow : microflow,
                raisesError : event_handler.raiseErrorOnFalse
            });
        }

        entities.push({
            name : entityName,
            documentation : entityDocumentation,
            generalization : entityGeneralization,
            attributes,
            eventHandlers
        });
    }

    return (Promise.resolve(entities));
}

async function getAssociationsForDomainModel(domain_model: domainmodels.IDomainModel) :Promise<ProjectData.Association[]> {
    let associations : ProjectData.Association[] = [];

    for (let j = 0; j < domain_model.associations.length; ++j) {
        const association = await domain_model.associations[j].load();

        const parent = await association.parent.load();
        const child = await association.child.load();

        const parent_module = (parent.qualifiedName != null) ? parent.qualifiedName.split(".")[0] : "";
        const child_module = (child.qualifiedName != null) ? child.qualifiedName.split(".")[0] : "";

        const parentName = `${parent_module}.${association.parent.name}`;
        const childName = `${child_module}.${association.child.name}`;

        associations.push({
            name : association.name,
            owner : association.owner.name,
            parent : parentName,
            child : childName,
            documentation : association.documentation
        });
    }

    return (Promise.resolve(associations));
}

async function getEnumerationsForModule(working_copy: OnlineWorkingCopy,
                                            domain_model: domainmodels.IDomainModel,
                                            module: projects.IModule) :Promise<ProjectData.Enumeration[]> {
    let enumerations : ProjectData.Enumeration[] = [];

    const d_mod = getModule(domain_model);
    let module_enum = working_copy.model().allEnumerations().filter(enumeration => {
        const m_mod = getModule(enumeration);
        
        if (m_mod == null || d_mod == null) {
            return (false);
        } else {
            return (m_mod.name === d_mod.name);
        }
    });

    if (module_enum.length <=0) {
        return (Promise.resolve(enumerations));
    }

    module_enum = module_enum.sort((one, two) => (one.name > two.name ? 1 : -1));

    for (let j = 0; j < module_enum.length; ++j) {
        const enumeration = await module_enum[j].load();
        console.log("  -Enumeration: " + enumeration.name);
                
        let enumerationItems : ProjectData.EnumerationItem[] = [];

        for (let k = 0; k < enumeration.values.length; ++k) {
            const pair = await enumeration.values[k].load();

            const caption = getStringFromText(pair.caption, language_code);
            console.log("    -Caption: " + caption);

            enumerationItems.push({
                caption,
                name : pair.name
            });
        }

        enumerations.push({
            name : enumeration.name,
            documentation : enumeration.documentation,
            items : enumerationItems
        });
    }

    return (Promise.resolve(enumerations));
}

async function getMicroflowsForModule(working_copy: OnlineWorkingCopy, 
                                          domain_model: domainmodels.IDomainModel,
                                          module: projects.IModule) :Promise<ProjectData.Microflow[]> {
    let pdMicroflows : ProjectData.Microflow[] = [];

    const d_mod = getModule(domain_model);
    let module_mf = working_copy.model().allMicroflows().filter(microflow => {
        const m_mod = getModule(microflow);
        
        if (m_mod == null || d_mod == null) {
            return (false);
        } else {
            return (m_mod.name === d_mod.name);
        }
    });

    module_mf = module_mf.sort((one, two) => (one.name > two.name ? 1 : -1));

    for (let j = 0; j < module_mf.length; ++j) {
        const microflow = await module_mf[j].load();
        console.log("  -Microflow: " + microflow.name);

        let return_type = getTypeFromDataType(await (microflow.microflowReturnType.load()));

        let pdMicroflowParameters : ProjectData.MicroflowParameter[] = [];

        const parameters = microflow.objectCollection.objects.filter(function(obj) {
            if (obj instanceof microflows.MicroflowParameterObject) {
                return (<microflows.MicroflowParameterObject>obj);
            }
        });
        
        for (let k = 0; k < parameters.length; ++k) {
            let param = <microflows.MicroflowParameterObject>(await parameters[k].load());
            console.log("    -Parameter: " + param.name);

            let type = getTypeFromDataType(await (param.variableType.load()));
            
            pdMicroflowParameters.push({
                name : param.name,
                documentation : param.documentation,
                type
            });
        }

        pdMicroflows.push({
            name : microflow.name,
            documentation : microflow.documentation,
            returnType : return_type,
            parameters : pdMicroflowParameters
        });
    }

    return (Promise.resolve(pdMicroflows));
}

async function getJavaActionsForModule(working_copy: OnlineWorkingCopy,
                                           domain_model: domainmodels.IDomainModel,
                                           module: projects.IModule) :Promise<ProjectData.JavaAction[]> {
    let pdJavaActions : ProjectData.JavaAction[] = [];

    const d_mod = getModule(domain_model);
    let module_ja = working_copy.model().allJavaActions().filter(java_action => {
        const m_mod = getModule(java_action);
        
        if (m_mod == null || d_mod == null) {
            return (false);
        } else {
            return (m_mod.name === d_mod.name);
        }
    });

    module_ja = module_ja.sort((one, two) => (one.name > two.name ? 1 : -1));

    for (let j = 0; j < module_ja.length; ++j) {
        const java_action = await module_ja[j].load();
        console.log("  -Java Action: " + java_action.name);

        let return_type = getTypeFromActionType(await (java_action.actionReturnType.load()));
    
        let pdJavaActionParameters : ProjectData.JavaActionParameter[] = [];

        for (let k = 0; k < java_action.actionParameters.length; ++k) {
            let param = await java_action.actionParameters[k].load();
            console.log("    -Parameter: " + param.name);

            let type = getTypeFromActionType((await (<codeactions.BasicParameterType>param.actionParameterType).load()).type);

            pdJavaActionParameters.push({
                name : param.name,
                description : param.description,
                type
            });
        }

        pdJavaActions.push({
            name : java_action.name,
            documentation : java_action.documentation,
            returnType : return_type,
            parameters : pdJavaActionParameters
        });
    }

    return (Promise.resolve(pdJavaActions));
}

async function getPagesForModule(working_copy: OnlineWorkingCopy,
                                     domain_model: domainmodels.IDomainModel,
                                     module: projects.IModule) :Promise<ProjectData.Page[]> {
    let pdPages : ProjectData.Page[] = [];

    const d_mod = getModule(domain_model);
    let module_pages = working_copy.model().allPages().filter(page => {
        const m_mod = getModule(page);

        if (m_mod == null || d_mod == null) {
            return (false);
        } else {
            return (m_mod.name === d_mod.name);
        }
    });

    module_pages = module_pages.sort((one, two) => one.name > two.name ? 1 : -1);

    for (let j = 0; j < module_pages.length; ++j) {
        const page = await module_pages[j].load();

        console.log("  -Page: " + page.name);
        
        pdPages.push({
            name : page.name,
            documentation : page.documentation,
            title : getStringFromText(page.title, language_code),
            url : page.url,
            class : page.class,
            layout : page.layoutCall.layoutQualifiedName
        });
    }

    return (pdPages);
}


/*******************************/

/****** GENERATE DOCUMENTATION FUNCTIONS ******/
function generateDocumentationForProject(pdProject : ProjectData.Project){
    // set up output folders
    if (!fs.existsSync("./docs")) {
    fs.mkdirSync("./docs");
    }
    if (!fs.existsSync("./docs/entity")) {
    fs.mkdirSync("./docs/entity");
    }
    if (!fs.existsSync("./docs/microflow")) {
    fs.mkdirSync("./docs/microflow");
    }   
    if (!fs.existsSync("./docs/module")) {
    fs.mkdirSync("./docs/module");
    }
    if (!fs.existsSync("./docs/enumeration")) {
    fs.mkdirSync("./docs/enumeration");
    }
    if (!fs.existsSync("./docs/java_action")) {
    fs.mkdirSync("./docs/java_action");
    }
    if (!fs.existsSync("./docs/page")) {
    fs.mkdirSync("./docs/page");
    }

    // initialise docsify
    fs.writeFileSync(`./docs/index.html`, index_html_template(pdProject));
    fs.writeFileSync(`./docs/.nojekyll`, '');

    let main_content = main_content_template(pdProject);
    
    fs.writeFileSync(`./docs/${pdProject.name}.md`, main_content);

    pdProject.modules.forEach((m)=>{
        generateDocumentationForModule(m);

        m.entities.forEach((e)=>{
            generateDocumentationForEntity(m, e);
        });

        m.enumerations.forEach((e)=>{
            generateDocumentationForEnumeration(m, e);
        });

        m.javaActions.forEach((j)=>{
            generateDocumentationForJavaAction(m, j);
        });

        m.microflows.forEach((mf)=>{
            generateDocumentationForMicroflow(m, mf);
        });

        m.pages.forEach((p)=>{
            generateDocumentationForPage(m, p);
        });
    });
}

function generateDocumentationForModule(pdModule : ProjectData.Module){
    let content = module_content_template(pdModule,modules);        

    fs.writeFileSync(`docs/module/${pdModule.name}.md`, content);
}

function generateDocumentationForEntity(pdModule : ProjectData.Module, pdEntity : ProjectData.Entity){
    let content = entity_content_template(pdEntity,modules);        

    fs.writeFileSync(`docs/entity/${pdModule.name}_${pdEntity.name}.md`, content);
}

function generateDocumentationForEnumeration(pdModule : ProjectData.Module, pdEnumeration : ProjectData.Enumeration){
    let content = enumeration_content_template(pdEnumeration);        

    fs.writeFileSync(`docs/enumeration/${pdModule.name}_${pdEnumeration.name}.md`, content);
}

function generateDocumentationForJavaAction(pdModule : ProjectData.Module, pdJavaAction : ProjectData.JavaAction){
    let content = java_action_content_template(pdJavaAction, modules);        

    fs.writeFileSync(`docs/java_action/${pdModule.name}_${pdJavaAction.name}.md`, content);
}

function generateDocumentationForMicroflow(pdModule : ProjectData.Module, pdMicroflow : ProjectData.Microflow){
    let content = microflow_content_template(pdMicroflow, modules);        

    fs.writeFileSync(`docs/microflow/${pdModule.name}_${pdMicroflow.name}.md`, content);
}

function generateDocumentationForPage(pdModule : ProjectData.Module, pdPage : ProjectData.Page){
    let content = page_content_template(pdPage);        

    fs.writeFileSync(`docs/page/${pdModule.name}_${pdPage.name}.md`, content);
}
/*******************************/

let raw_config = fs.readFileSync("mdconfig.json", "utf8");
let config = JSON.parse(raw_config);

const username = config["username"];
const api_key = config["api_key"];
const project_name = config["project_name"];
const project_description = config["project_description"]
const project_id = config["project_id"];

const language_code = config["language_code"];

const branch_name = (config["branch_name"] === "") ? null : config["branch_name"];
const revision_number = config["revision_number"];

const modules: string[] = [];

for (let m in config["modules"]) {
    modules.push(config["modules"][m]);
}

const client = new MendixSdkClient(username, api_key);
const project = new Project(client, project_id, project_name);

const skipDataRetrieval : boolean = true;

async function main() {
    let pdProject : ProjectData.Project | null = null;
    if(!skipDataRetrieval){
        const working_copy = await client.platform().createOnlineWorkingCopy(project, new Revision(
            revision_number, new Branch(project, branch_name)));
    
        // LOAD DATA
        let loaded_modules = working_copy.model().root.modules.filter(function(md) {
            return modules.includes(md.name);
        });
    
        let pdModules : ProjectData.Module[] = [];
    
        for (let i = 0; i < loaded_modules.length; ++i) {
            const module = loaded_modules[i];
            const domain_model = await module.domainModel.load();
            
            if (!modules.includes(domain_model.containerAsModule.name)) {
                continue;
            }
    
            const entities : ProjectData.Entity[] = await getEntitiesForModule(domain_model, module);
            const associations : ProjectData.Association[] = await getAssociationsForDomainModel(domain_model); 
            const enumerations : ProjectData.Enumeration[] = await getEnumerationsForModule(working_copy, domain_model, module);
            const microflows : ProjectData.Microflow[] = await getMicroflowsForModule(working_copy, domain_model, module);
            const javaActions : ProjectData.JavaAction[] = await getJavaActionsForModule(working_copy, domain_model, module);
            const pages : ProjectData.Page[] = await getPagesForModule(working_copy, domain_model, module);
    
            pdModules.push({
                name : module.name,
                documentation : domain_model.documentation,
                entities,
                associations,
                enumerations,
                microflows,
                javaActions,
                pages
            });
        };
    
        pdProject = {
            name : project_name,
            description : project_description,
            modules : pdModules
        }
    
        fs.writeFileSync(`projectData.json`, JSON.stringify(pdProject));
    }

    if(!pdProject){
        // load from file
        let rawProjectData = fs.readFileSync("projectData.json", "utf8");
        pdProject = JSON.parse(rawProjectData);
    }
    
    //todo - generate documentation
    generateDocumentationForProject(pdProject as ProjectData.Project);
}

main();