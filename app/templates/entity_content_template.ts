import {ProjectData} from '../namespaces';
import {getModuleEntityLinkFromString, getModuleMicroflowLinkFromString, getAttributeTypeAsString} from './utils';

export default (pdEntity : ProjectData.Entity, configuredModules : string[]) => 
`# ${pdEntity.name} [*Entity*]
${pdEntity.generalization ? `**Generalization:** ${getModuleEntityLinkFromString(pdEntity.generalization, configuredModules)}`: ""}

${pdEntity.documentation}

## Attributes
| Name | Type | Documentation |
| --- | --- | --- |
${pdEntity.attributes.map((a)=>
`| ${a.name} | ${getAttributeTypeAsString(a.type, configuredModules)} | ${a.documentation} |`).join('\r\n')}

## Event Handlers
| Moment | Event | Microflow | Raises Error |
| --- | --- | --- | --- |
${pdEntity.eventHandlers.map((e)=>
`| ${e.moment} | ${e.event} | ${getModuleMicroflowLinkFromString(e.microflow, configuredModules)} | ${e.raisesError} |`).join('\r\n')}
`;