import {ProjectData} from './app/namespaces'
import {default as mdconfig} from './mdconfig';
import fs from 'fs';

async function main(){
    const config = mdconfig();

    const pdProject : ProjectData.Project = await config.getProjectData(config.projectConfig);
    if(config.projectConfig.saveProjectDataAsJson){
        fs.writeFileSync(`./projectData.json`, JSON.stringify(pdProject));
    }
    config.generateDocumentation(config.projectConfig, pdProject);
}

main();