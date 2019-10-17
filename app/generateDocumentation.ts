import { ProjectData, ProjectConfig } from "./namespaces";
import fs from 'fs';
import {indexHtmlTemplate, projectTemplate, moduleTemplate, 
    entityTemplate, enumerationTemplate,javaActionTemplate,
    microflowTemplate, pageTemplate} from './templates';

export default (projectConfig : ProjectConfig.Config, pdProject : ProjectData.Project) => {
    // set up output folders
    const {rootOutputFolder, modules} = projectConfig.app;
    if (!fs.existsSync(rootOutputFolder)) {
        fs.mkdirSync(rootOutputFolder);
    }
    if (!fs.existsSync(`${rootOutputFolder}/entity`)) {
        fs.mkdirSync(`${rootOutputFolder}/entity`);
    }
    if (!fs.existsSync(`${rootOutputFolder}/microflow`)) {
        fs.mkdirSync(`${rootOutputFolder}/microflow`);
    }   
    if (!fs.existsSync(`${rootOutputFolder}/module`)) {
        fs.mkdirSync(`${rootOutputFolder}/module`);
    }
    if (!fs.existsSync(`${rootOutputFolder}/enumeration`)) {
        fs.mkdirSync(`${rootOutputFolder}/enumeration`);
    }
    if (!fs.existsSync(`${rootOutputFolder}/java_action`)) {
        fs.mkdirSync(`${rootOutputFolder}/java_action`);
    }
    if (!fs.existsSync(`${rootOutputFolder}/page`)) {
        fs.mkdirSync(`${rootOutputFolder}/page`);
    }

    // initialise docsify
    fs.writeFileSync(`${rootOutputFolder}/index.html`, indexHtmlTemplate(pdProject));
    fs.writeFileSync(`${rootOutputFolder}/.nojekyll`, '');

    // create main page
    let content = projectTemplate(pdProject);    
    fs.writeFileSync(`${rootOutputFolder}/${pdProject.name}.md`, content);

    // generate pages for modules and related objects
    pdProject.modules.forEach((m)=>{
        generateDocumentationForModule(m, modules, rootOutputFolder);

        m.entities.forEach((e)=>{
            generateDocumentationForEntity(m, e, modules, rootOutputFolder);
        });

        m.enumerations.forEach((e)=>{
            generateDocumentationForEnumeration(m, e, rootOutputFolder);
        });

        m.javaActions.forEach((j)=>{
            generateDocumentationForJavaAction(m, j, modules, rootOutputFolder);
        });

        m.microflows.forEach((mf)=>{
            generateDocumentationForMicroflow(m, mf, modules, rootOutputFolder);
        });

        m.pages.forEach((p)=>{
            generateDocumentationForPage(m, p, rootOutputFolder);
        });
    });
}

function generateDocumentationForModule(pdModule : ProjectData.Module, 
    configuredModules : string[], rootOutputFolder : string){
    let content = moduleTemplate(pdModule,configuredModules);        

    fs.writeFileSync(`${rootOutputFolder}/module/${pdModule.name}.md`, content);
}

function generateDocumentationForEntity(pdModule : ProjectData.Module, pdEntity : ProjectData.Entity, 
    configuredModules : string[], rootOutputFolder : string){
    let content = entityTemplate(pdEntity,configuredModules);        

    fs.writeFileSync(`${rootOutputFolder}/entity/${pdModule.name}_${pdEntity.name}.md`, content);
}

function generateDocumentationForEnumeration(pdModule : ProjectData.Module, 
    pdEnumeration : ProjectData.Enumeration, rootOutputFolder : string){
    let content = enumerationTemplate(pdEnumeration);        

    fs.writeFileSync(`${rootOutputFolder}/enumeration/${pdModule.name}_${pdEnumeration.name}.md`, content);
}

function generateDocumentationForJavaAction(pdModule : ProjectData.Module, pdJavaAction : ProjectData.JavaAction, 
    configuredModules : string[], rootOutputFolder : string){
    let content = javaActionTemplate(pdJavaAction, configuredModules);        

    fs.writeFileSync(`${rootOutputFolder}/java_action/${pdModule.name}_${pdJavaAction.name}.md`, content);
}

function generateDocumentationForMicroflow(pdModule : ProjectData.Module, pdMicroflow : ProjectData.Microflow, 
    configuredModules : string[], rootOutputFolder : string){
    let content = microflowTemplate(pdMicroflow, configuredModules);        

    fs.writeFileSync(`${rootOutputFolder}/microflow/${pdModule.name}_${pdMicroflow.name}.md`, content);
}

function generateDocumentationForPage(pdModule : ProjectData.Module, 
    pdPage : ProjectData.Page, rootOutputFolder : string){
    let content = pageTemplate(pdPage);        

    fs.writeFileSync(`${rootOutputFolder}/page/${pdModule.name}_${pdPage.name}.md`, content);
}