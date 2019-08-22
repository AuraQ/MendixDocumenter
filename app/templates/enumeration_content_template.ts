import {ProjectData} from '../namespaces';

export default (pdEnumeration : ProjectData.Enumeration) => 
`# ${pdEnumeration.name} [*Enumeration*]

${pdEnumeration.documentation}

## Items
| Caption | Name |
| --- | --- |
${pdEnumeration.items.map((i)=>
`| ${i.caption} | ${i.name} |`).join('\r\n')}
`;