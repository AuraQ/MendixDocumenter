
import { MendixSdkClient, Project, Revision, Branch, OnlineWorkingCopy } from 'mendixplatformsdk';
import { domainmodels, projects, microflows, codeactions } from 'mendixmodelsdk'
import {getModule, getTypeFromAttributeType, getTypeFromDataType, getTypeFromActionType, getStringFromText} from './utils';
import {ProjectData, ProjectConfig} from './namespaces'

export default async (projectConfig : ProjectConfig.Config) : Promise<ProjectData.Project> => {
    const client = new MendixSdkClient(projectConfig.auth.username, projectConfig.auth.apikey);
    const project = new Project(client, projectConfig.project.id, projectConfig.project.name);

    let pdProject : ProjectData.Project | null = null;
    const working_copy = await client.platform().createOnlineWorkingCopy(project, new Revision(
        projectConfig.project.revision, new Branch(project, (projectConfig.project.branch === "") ? null : projectConfig.project.branch)));

    // LOAD DATA
    let loaded_modules = working_copy.model().root.modules.filter(function(md) {
        return projectConfig.app.modules.includes(md.name);
    });

    let pdModules : ProjectData.Module[] = [];

    for (let i = 0; i < loaded_modules.length; ++i) {
        const module = loaded_modules[i];
        const domain_model = await module.domainModel.load();
        
        if (!projectConfig.app.modules.includes(domain_model.containerAsModule.name)) {
            continue;
        }

        const entities : ProjectData.Entity[] = await getEntitiesForModule(domain_model, module);
        const associations : ProjectData.Association[] = await getAssociationsForDomainModel(domain_model); 
        const enumerations : ProjectData.Enumeration[] = await getEnumerationsForModule(working_copy, domain_model, module,projectConfig.app.language_code);
        const microflows : ProjectData.Microflow[] = await getMicroflowsForModule(working_copy, domain_model, module);
        const javaActions : ProjectData.JavaAction[] = await getJavaActionsForModule(working_copy, domain_model, module);
        const pages : ProjectData.Page[] = await getPagesForModule(working_copy, domain_model, module, projectConfig.app.language_code);

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
        name : projectConfig.project.name,
        description : projectConfig.project.description,
        modules : pdModules
    }

    return pdProject;
}

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
                                            module: projects.IModule, language_code : string) :Promise<ProjectData.Enumeration[]> {
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
                                     module: projects.IModule, language_code : string) :Promise<ProjectData.Page[]> {
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