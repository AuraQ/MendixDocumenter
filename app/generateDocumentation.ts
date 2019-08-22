import { ProjectData, ProjectConfig } from "./namespaces";
import fs from 'fs';
import {indexHtmlTemplate, projectTemplate, moduleTemplate, 
    entityTemplate, enumerationTemplate,javaActionTemplate,
    microflowTemplate, pageTemplate} from './templates';

export default (projectConfig : ProjectConfig.Config, pdProject : ProjectData.Project) => {
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
    fs.writeFileSync(`./docs/index.html`, indexHtmlTemplate(pdProject));
    fs.writeFileSync(`./docs/.nojekyll`, '');

    // create main page
    let content = projectTemplate(pdProject);    
    fs.writeFileSync(`./docs/${pdProject.name}.md`, content);

    // generate pages for modules and related objects
    pdProject.modules.forEach((m)=>{
        generateDocumentationForModule(m, projectConfig.modules);

        m.entities.forEach((e)=>{
            generateDocumentationForEntity(m, e, projectConfig.modules);
        });

        m.enumerations.forEach((e)=>{
            generateDocumentationForEnumeration(m, e);
        });

        m.javaActions.forEach((j)=>{
            generateDocumentationForJavaAction(m, j, projectConfig.modules);
        });

        m.microflows.forEach((mf)=>{
            generateDocumentationForMicroflow(m, mf, projectConfig.modules);
        });

        m.pages.forEach((p)=>{
            generateDocumentationForPage(m, p);
        });
    });
}

function generateDocumentationForModule(pdModule : ProjectData.Module, configuredModules : string[]){
    let content = moduleTemplate(pdModule,configuredModules);        

    fs.writeFileSync(`docs/module/${pdModule.name}.md`, content);
}

function generateDocumentationForEntity(pdModule : ProjectData.Module, pdEntity : ProjectData.Entity, configuredModules : string[]){
    let content = entityTemplate(pdEntity,configuredModules);        

    fs.writeFileSync(`docs/entity/${pdModule.name}_${pdEntity.name}.md`, content);
}

function generateDocumentationForEnumeration(pdModule : ProjectData.Module, pdEnumeration : ProjectData.Enumeration){
    let content = enumerationTemplate(pdEnumeration);        

    fs.writeFileSync(`docs/enumeration/${pdModule.name}_${pdEnumeration.name}.md`, content);
}

function generateDocumentationForJavaAction(pdModule : ProjectData.Module, pdJavaAction : ProjectData.JavaAction, configuredModules : string[]){
    let content = javaActionTemplate(pdJavaAction, configuredModules);        

    fs.writeFileSync(`docs/java_action/${pdModule.name}_${pdJavaAction.name}.md`, content);
}

function generateDocumentationForMicroflow(pdModule : ProjectData.Module, pdMicroflow : ProjectData.Microflow, configuredModules : string[]){
    let content = microflowTemplate(pdMicroflow, configuredModules);        

    fs.writeFileSync(`docs/microflow/${pdModule.name}_${pdMicroflow.name}.md`, content);
}

function generateDocumentationForPage(pdModule : ProjectData.Module, pdPage : ProjectData.Page){
    let content = pageTemplate(pdPage);        

    fs.writeFileSync(`docs/page/${pdModule.name}_${pdPage.name}.md`, content);
}