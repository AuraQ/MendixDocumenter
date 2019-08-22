
import fs from 'fs';
import {ProjectConfig} from './app/namespaces';
import {default as getProjectData} from './app/getProjectData';
import {default as generateDocumentation} from './app/generateDocumentation';

export default () => {
    const projectConfig : ProjectConfig.Config = JSON.parse(fs.readFileSync("mdconfig.json", "utf8"));

    return {        
        projectConfig,
        getProjectData,
        generateDocumentation
    }
};