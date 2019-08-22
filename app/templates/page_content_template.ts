import {ProjectData} from '../namespaces';

export default (pdPage : ProjectData.Page) => 
`# ${pdPage.name} [*Page*]

${pdPage.documentation}

**Title:** ${pdPage.title}  
**URL:** ${pdPage.url}  
**Class:** ${pdPage.class}  
**Layout:** ${pdPage.layout}  
`;