import {ProjectData} from '../namespaces';
import {getModuleEntityLinkFromString} from './utils';

export default (pdModule : ProjectData.Module, configuredModules : string[]) => 
`# ${pdModule.name} [*Module*]

${pdModule.documentation}

## Entities
${pdModule.entities.map(
    (e)=>`[${e.name}](/entity/${pdModule.name}_${e.name}.md)`
).join('  \r\n')}
## Associations
${pdModule.associations.map(
    (a)=>
`**${a.name}**
> ${a.documentation}
| Owner | Parent | Child |
| --- | --- | --- |
| ${a.owner} | ${getModuleEntityLinkFromString(a.parent, configuredModules)} | ${getModuleEntityLinkFromString(a.child, configuredModules)} |

---`).join('\r\n')}
## Enumerations
${pdModule.enumerations.map(
    (e)=>`[${e.name}](/enumeration/${pdModule.name}_${e.name}.md)`
).join('  \r\n')}
## Microflows
${pdModule.microflows.map(
    (m)=>`[${m.name}](/microflow/${pdModule.name}_${m.name}.md)`
).join('  \r\n')}
## Java Actions
${pdModule.javaActions.map(
    (j)=>`[${j.name}](/java_action/${pdModule.name}_${j.name}.md)`
).join('  \r\n')}
## Pages
${pdModule.pages.map(
    (p)=>`[${p.name}](/page/${pdModule.name}_${p.name}.md)`
).join('  \r\n')}
`;