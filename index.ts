import {ProjectData} from './app/namespaces'
import {default as mdconfig} from './mdconfig';


async function main(){
    const config = mdconfig();

    const pdProject : ProjectData.Project = await config.getProjectData(config.projectConfig);
    config.generateDocumentation(config.projectConfig, pdProject);
}

main();