import {ProjectData} from '../namespaces';
import {getDataTypeAsString} from './utils';

export default (pdMicroflow : ProjectData.Microflow, configuredModules : string[]) => 
`# ${pdMicroflow.name} [*Microflow*]

${pdMicroflow.documentation}

**Returns:** ${getDataTypeAsString(pdMicroflow.returnType, configuredModules)}

## Parameters
| Name | Type | Documentation |
| --- | --- | --- |
${pdMicroflow.parameters.map((p)=>
`| ${p.name} | ${getDataTypeAsString(p.type, configuredModules)} | ${p.documentation} |`).join('\r\n')}
`;