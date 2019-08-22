import {ProjectData} from '../namespaces';

export default (pdProject : ProjectData.Project) => 
`# ${pdProject.name}

${pdProject.description}

## Modules

${pdProject.modules.map(
    (m)=>`[${m.name}](/module/${m.name}.md)`
).join('\r\n\r\n')}`
;