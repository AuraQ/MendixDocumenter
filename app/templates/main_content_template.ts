import {ProjectData} from '../namespaces';

const main_content_template = (pdProject : ProjectData.Project) => 
`# ${pdProject.name}

${pdProject.description}

## Modules

${pdProject.modules.map(
    (m)=>`[${m.name}](/module/${m.name}.md)`
).join('\r\n\r\n')}`
;

export default main_content_template;