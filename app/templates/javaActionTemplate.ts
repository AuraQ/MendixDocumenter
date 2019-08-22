import {ProjectData} from '../namespaces';
import {getActionTypeAsString} from './utils';

export default (pdJavaAction : ProjectData.JavaAction, configuredModules : string[]) => 
`# ${pdJavaAction.name} [*Java Action*]

${pdJavaAction.documentation}

**Returns:** ${getActionTypeAsString(pdJavaAction.returnType, configuredModules)}

## Items
| Name | Type | Description |
| --- | --- | --- |
${pdJavaAction.parameters.map((p)=>
`| ${p.name} | ${getActionTypeAsString(p.type, configuredModules)} | ${p.description} |`).join('\r\n')}
`;