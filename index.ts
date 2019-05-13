import { MendixSdkClient, Project, Revision, Branch, OnlineWorkingCopy } from 'mendixplatformsdk';
import { domainmodels, IStructure, projects, microflows, datatypes, codeactions, texts } from 'mendixmodelsdk'
import fs from 'fs';

/******* HELPER FUNCTIONS *******/
function getModule(element: IStructure): projects.Module|null {
    let current = element.unit;
    while (current) {
        if (current instanceof projects.Module) {
            return current;
        }
        current = current.container;
    }
    return null;
}

function getTypeFromAttributeType(type: domainmodels.AttributeType): String {
    let result = "";

    if (type instanceof domainmodels.AutoNumberAttributeType) {
        result = "AutoNumber";
    } else if (type instanceof domainmodels.BinaryAttributeType) {
        result = "Binary";
    } else if (type instanceof domainmodels.BooleanAttributeType) {
        result = "Boolean";
    } else if (type instanceof domainmodels.CurrencyAttributeType) {
        result = "Currency";
    } else if (type instanceof domainmodels.DateTimeAttributeType) {
        result = "DateTime";
    }  else if (type instanceof domainmodels.DecimalAttributeType) {
        result = "Decimal";
    } else if (type instanceof domainmodels.EnumerationAttributeType) {
        const module = type.enumerationQualifiedName.split(".")[0];
        const enumeration = type.enumerationQualifiedName.split(".")[1];
        result = `Enumeration&lt;<a href=../module/${module}.html>${module}</a>.<a href=../enumeration/${enumeration}.html>${enumeration}</a>&gt;`;
    } else if (type instanceof domainmodels.FloatAttributeType) {
        result = "Float";
    } else if (type instanceof domainmodels.HashedStringAttributeType) {
        result = "HashedString";
    } else if (type instanceof domainmodels.IntegerAttributeType) {
        result = "Integer";
    } else if (type instanceof domainmodels.LongAttributeType) {
        result = "Long";
    } else if (type instanceof domainmodels.StringAttributeType) {
        result = "String";
    }

    return (result);
}

function getTypeFromDataType(type: datatypes.DataType): String {
    let result = null;

    if (type instanceof datatypes.BinaryType) {
        result = "Binary";
    } else if (type instanceof datatypes.ListType) {
        const module = type.entityQualifiedName.split(".")[0];
        const entity = type.entityQualifiedName.split(".")[1];
        if (modules.includes(module)) {
            result = `List&lt;<a href=../module/${module}.html>${module}</a>.<a href=../entity/${entity}.html>${entity}</a>&gt;`;
        } else {
            result = `List&lt;${module}.${entity}&gt;`;
        }
    } else if (type instanceof datatypes.BooleanType) {
        result = "Boolean";
    } else if (type instanceof datatypes.DateTimeType) {
        result = "DateTime";
    } else if (type instanceof datatypes.DecimalType) {
        result = "Decimal";
    } else if (type instanceof datatypes.EmptyType) {
        result = "Empty";
    } else if (type instanceof datatypes.ObjectType) {
        let inner_type = <datatypes.EntityType>(type);
        if (inner_type.entityQualifiedName != null) {
            const module = type.entityQualifiedName.split(".")[0];
            const entity = type.entityQualifiedName.split(".")[1];
            result = `<a href=../module/${module}.html>${module}</a>.<a href=../entity/${entity}.html>${entity}</a>`
        }
    } else if (type instanceof datatypes.EnumerationType) {
        const module = type.enumerationQualifiedName.split(".")[0];
        const enumeration = type.enumerationQualifiedName.split(".")[1];
        result = `Enumeration&lt;<a href=../module/${module}.html>${module}</a>.<a href=../enumeration/${enumeration}.html>${enumeration}</a>&gt;`;
    } else if (type instanceof datatypes.FloatType) {
        result = "Float";
    } else if (type instanceof datatypes.IntegerType) {
        result = "Integer";
    }  else if (type instanceof datatypes.StringType) {
        result = "String";
    } else if (type instanceof datatypes.UnknownType) {
        result = "Unknown";
    } else if (type instanceof datatypes.VoidType) {
        result = "-";
    }

    if (result === null) {
        result = type.constructor.name;
    }

    return (result);
}

function getTypeFromActionType(type: codeactions.Type): String {
    let result = "";

    if (type instanceof codeactions.BooleanType) {
        result = "Boolean";
    } else if (type instanceof codeactions.ListType) {
        const module = (<codeactions.ConcreteEntityType>type.parameter).entityQualifiedName.split(".")[0];
        const entity = (<codeactions.ConcreteEntityType>type.parameter).entityQualifiedName.split(".")[1];
        if (modules.includes(module)) {
            result = `List&lt;<a href=../module/${module}.html>${module}</a>.<a href=../entity/${entity}.html>${entity}</a>&gt;`;
        } else {
            result = `List&lt;${module}.${entity}&gt;`;
        }
    } else if (type instanceof codeactions.EntityType) {
        const module = (<codeactions.ConcreteEntityType>type).entityQualifiedName.split(".")[0];
        const entity = (<codeactions.ConcreteEntityType>type).entityQualifiedName.split(".")[1];
        if (modules.includes(module)) {
            result = `<a href=../module/${module}.html>${module}</a>.<a href=../entity/${entity}.html>${entity}</a>`;
        } else {
            result = `${module}.${entity}`;
        }
    } else if (type instanceof codeactions.DateTimeType) {
        result = "DateTime";
    }  else if (type instanceof codeactions.DecimalType) {
        result = "Decimal";
    } else if (type instanceof codeactions.EnumerationType) {
        const module = type.enumerationQualifiedName.split(".")[0];
        const enumeration = type.enumerationQualifiedName.split(".")[1];
        result = `Enumeration&lt;<a href=../module/${module}.html>${module}</a>.<a href=../enumeration/${enumeration}.html>${enumeration}</a>&gt;`;
    } else if (type instanceof codeactions.FloatType) {
        result = "Float";
    } else if (type instanceof codeactions.IntegerType) {
        result = "Integer";
    } else if (type instanceof codeactions.StringType) {
        result = "String";
    }

    return (result);
}

function getStringFromText(text: texts.Text): String {
    const result = text.translations.filter(tl => {
        return (tl.languageCode === language_code);
    })[0];

    return (result.text);
}
/*******************************/

/****** PROCESS FUNCTIONS ******/
async function processEntitiesForModule(domain_model: domainmodels.IDomainModel,
                                        module: projects.IModule) :Promise<String> {
    let module_content = "";

    for (let j = 0; j < domain_model.entities.length; ++j) {
        const entity = await domain_model.entities[j].load();
        console.log("  -Entity: " + entity.name);

        let entity_content = 
            `<html>
                <head>
                <title>${entity.name}::Entity</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                </head>
                <body style="background-color:#f4f4f4;">
                <div style="width:80%; margin:auto; background-color:#ffffff; padding:3em;-webkit-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);">
                    <a href="../${project_name}.html">Home</a>/<a href="../module/${module.name}.html">${module.name}</a>/<a href="../entity/${entity.name}.html">${entity.name}</a>
                    <br />
                    <h1 style="display:inline">${entity.name}</h1>
                    <h4 style="display:inline">::Entity</h4>`

        if (entity.generalization instanceof domainmodels.Generalization) {
            const generalization_module = (await entity.generalization.load()).generalizationQualifiedName.split(".")[0];
            const generalization_entity = entity.generalization.generalizationQualifiedName.split(".")[1];
            const generalization = modules.includes(generalization_module)
                ? `<a href="../module/${generalization_module}.html">${generalization_module}.</a><a href="../entity/${generalization_entity}.html">${generalization_entity}</a>`
                : `${generalization_module}.${generalization_entity}`;
            entity_content += 
                `<br/><p style="display:inline"><b>Generalization</b>: ${generalization}</p>`;
        }

        entity_content += 
            `<p>${entity.documentation}</p>
            <h3>Attributes</h3>
            <table class="table_entity_attributes table">
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Description</th>
                </tr>`

        for (let k = 0; k < entity.attributes.length; ++k) {
            const attribute = await entity.attributes[k].load();
            console.log("    -Attribute: " + attribute.name);

            let attribute_content = 
                `<tr>
                    <td>${attribute.name}</td>
                    <td>${getTypeFromAttributeType(attribute.type)}</td>
                    <td>${attribute.documentation}</td>
                </tr>`;

            entity_content += attribute_content;
        }

        entity_content += 
            `</table>
            <h3>Event Handlers</h3>
            <table class="table_entity_events table">
            <tr>
                <th>Moment</th>
                <th>Event</th>
                <th>Microflow</th>
                <th>Raises Error</th>
            </tr>`;

        for (let k = 0; k < entity.eventHandlers.length; ++k) {
            const event_handler = await entity.eventHandlers[k].load();
            console.log("    -Event: " + event_handler.moment.name + " " + event_handler.event.name);

            const microflow_module = (event_handler.microflowQualifiedName != null) ? event_handler.microflowQualifiedName.split(".")[0] : "";
            const microflow_name = (event_handler.microflow != null) ? event_handler.microflow.name : "";
            
            let event_content = 
                `<tr>
                    <td>${event_handler.moment.name}</td>
                    <td>${event_handler.event.name}</td>
                    <td><a href="../module/${microflow_module}.html">${microflow_module}.</a><a href="../microflow/${microflow_name}.html">${microflow_name}</a></td>
                    <td>${event_handler.raiseErrorOnFalse}</td>
                </tr>`;
            entity_content += event_content;
        }

        entity_content += `</table></div></body></html>`
        fs.writeFileSync(`out/entity/${entity.name}.html`, entity_content);

        module_content += `<a href="../entity/${entity.name}.html">${entity.name}</a><br />`;
    }

    return (Promise.resolve(module_content));
}

async function processAssociationsForDomainModel(domain_model: domainmodels.IDomainModel) :Promise<String> {
    let module_content = `
    <table class="table_association table">
    <tr>
        <th>Name</th>
        <th>Owner</th>
        <th>Parent</th>
        <th>Child</th>
        <th>Description</th>
    </tr>`

    for (let j = 0; j < domain_model.associations.length; ++j) {
        const association = await domain_model.associations[j].load();

        const parent = await association.parent.load();
        const child = await association.child.load();

        const parent_module = (parent.qualifiedName != null) ? parent.qualifiedName.split(".")[0] : "";
        const child_module = (child.qualifiedName != null) ? child.qualifiedName.split(".")[0] : "";

        module_content += 
            `<tr>
                <td>${association.name}</td>
                <td>${association.owner.name}</td>
                <td><a href="../module/${parent_module}.html">${parent_module}</a>.<a href="../entity/${association.parent.name}.html">${association.parent.name}</a></td>
                <td><a href="../module/${child_module}.html">${child_module}</a>.<a href="../entity/${association.child.name}.html">${association.child.name}</a></td>
                <td>${association.documentation}</td>
            </tr>`;
    }
    module_content += `</table>`

    return (Promise.resolve(module_content));
}

async function processEnumerationsForModule(working_copy: OnlineWorkingCopy,
                                            domain_model: domainmodels.IDomainModel,
                                            module: projects.IModule) :Promise<String> {
    let module_content = ""

    const d_mod = getModule(domain_model);
    let module_enum = working_copy.model().allEnumerations().filter(enumeration => {
        const m_mod = getModule(enumeration);
        
        if (m_mod == null || d_mod == null) {
            return (false);
        } else {
            return (m_mod.name === d_mod.name);
        }
    });

    if (module_enum.length <=0) {
        return (Promise.resolve(module_content));
    }

    module_enum = module_enum.sort((one, two) => (one.name > two.name ? 1 : -1));

    for (let j = 0; j < module_enum.length; ++j) {
        const enumeration = await module_enum[j].load();
        console.log("  -Enumeration: " + enumeration.name);
        module_content += `<a href="../enumeration/${enumeration.name}.html">${enumeration.name}</a><br />`

        let enumeration_content = 
            `<html>
                <head>
                <title>${enumeration.name}::Enumeration</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                </head>
                <body style="background-color:#f4f4f4;">
                <div style="width:80%; margin:auto; background-color:#ffffff; padding:3em;-webkit-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);">
                    <a href="../${project_name}.html">Home</a>/<a href="../module/${module.name}.html">${module.name}</a>/<a href="../enumeration/${enumeration.name}.html">${enumeration.name}</a>
                    <br />
                    <h1 style="display:inline">${enumeration.name}</h1>
                    <h4 style="display:inline">::Enumeration</h4>
                    <p>${enumeration.documentation}</p>
                    <table class="table_enumeration_values table">
                        <tr>
                            <th>Caption</th>
                            <th>Name</th>
                        </tr>`;

        for (let k = 0; k < enumeration.values.length; ++k) {
            const pair = await enumeration.values[k].load();

            const caption = getStringFromText(pair.caption);
            console.log("    -Caption: " + caption);

            enumeration_content +=
                `<tr>
                    <td>${caption}</td>
                    <td>${pair.name}</td>
                </tr>`;
        }

        enumeration_content += `</table></div></body></html>`
        fs.writeFileSync(`out/enumeration/${enumeration.name}.html`, enumeration_content);
    }

    return (Promise.resolve(module_content));
}

async function processMicroflowsForModule(working_copy: OnlineWorkingCopy, 
                                          domain_model: domainmodels.IDomainModel,
                                          module: projects.IModule) :Promise<String> {
    let module_content = "";

    const d_mod = getModule(domain_model);
    let module_mf = working_copy.model().allMicroflows().filter(microflow => {
        const m_mod = getModule(microflow);
        
        if (m_mod == null || d_mod == null) {
            return (false);
        } else {
            return (m_mod.name === d_mod.name);
        }
    });

    module_mf = module_mf.sort((one, two) => (one.name > two.name ? 1 : -1));

    for (let j = 0; j < module_mf.length; ++j) {
        const microflow = await module_mf[j].load();
        console.log("  -Microflow: " + microflow.name);
        module_content += `<a href="../microflow/${microflow.name}.html">${microflow.name}</a><br />`

        let return_type = getTypeFromDataType(await (microflow.microflowReturnType.load()));

        let microflow_content = 
            `<html>
                <head>
                <title>${microflow.name}::Microflow</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                </head>
                <body style="background-color:#f4f4f4;">
                <div style="width:80%; margin:auto; background-color:#ffffff; padding:3em;-webkit-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);">
                    <a href="../${project_name}.html">Home</a>/<a href="../module/${module.name}.html">${module.name}</a>/<a href="../microflow/${microflow.name}.html">${microflow.name}</a>
                    <br />
                    <h1 style="display:inline">${microflow.name}</h1>
                    <h4 style="display:inline">::Microflow</h4>
                    <p>${microflow.documentation}</p>
                    <p><b>Returns:<b /> ${return_type}</p>
                    <h3>Parameters</h3>
                    <table class="table_microflow_parameters table">
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Description</th>
                        </tr>`

        const parameters = microflow.objectCollection.objects.filter(function(obj) {
            if (obj instanceof microflows.MicroflowParameterObject) {
                return (<microflows.MicroflowParameterObject>obj);
            }
        });
        
        for (let k = 0; k < parameters.length; ++k) {
            let param = <microflows.MicroflowParameterObject>(await parameters[k].load());
            console.log("    -Parameter: " + param.name);

            let type = getTypeFromDataType(await (param.variableType.load()));

            microflow_content += 
                `<tr>
                    <td>${param.name}</th>
                    <td>${type}</th>
                    <td>${param.documentation}</th>
                </tr>`
        }

        microflow_content += `</table></div></body></html>`
        fs.writeFileSync(`out/microflow/${microflow.name}.html`, microflow_content);
    }

    return (Promise.resolve(module_content));
}

async function processJavaActionsForModule(working_copy: OnlineWorkingCopy,
                                           domain_model: domainmodels.IDomainModel,
                                           module: projects.IModule) :Promise<String> {
    let module_content = "";

    const d_mod = getModule(domain_model);
    let module_ja = working_copy.model().allJavaActions().filter(java_action => {
        const m_mod = getModule(java_action);
        
        if (m_mod == null || d_mod == null) {
            return (false);
        } else {
            return (m_mod.name === d_mod.name);
        }
    });

    module_ja = module_ja.sort((one, two) => (one.name > two.name ? 1 : -1));

    for (let j = 0; j < module_ja.length; ++j) {
        const java_action = await module_ja[j].load();
        console.log("  -Java Action: " + java_action.name);
        module_content += `<a href="../java_action/${java_action.name}.html">${java_action.name}</a><br />`

        let return_type = getTypeFromActionType(await (java_action.actionReturnType.load()));

        let java_action_content = 
            `<html>
                <head>
                <title>${java_action.name}::Java Action</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                </head>
                <body style="background-color:#f4f4f4;">
                <div style="width:80%; margin:auto; background-color:#ffffff; padding:3em;-webkit-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);">
                    <a href="../${project_name}.html">Home</a>/<a href="../module/${module.name}.html">${module.name}</a>/<a href="../java_action/${java_action.name}.html">${java_action.name}</a>
                    <br />
                    <h1 style="display:inline">${java_action.name}</h1>
                    <h4 style="display:inline">::Java Action</h4>
                    <p>${java_action.documentation}</p>
                    <p><b>Returns:</b> ${return_type}</p>
                    <h3>Parameters</h3>
                    <table class="table_java_action_parameters table">
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Description</th>
                        </tr>`
    
        for (let k = 0; k < java_action.actionParameters.length; ++k) {
            let param = await java_action.actionParameters[k].load();
            console.log("    -Parameter: " + param.name);

            let type = getTypeFromActionType((await (<codeactions.BasicParameterType>param.actionParameterType).load()).type);

            java_action_content += 
                `<tr>
                    <td>${param.name}</th>
                    <td>${type}</th>
                    <td>${param.description}</th>
                </tr>`
        }

        java_action_content += `</table></div></body></html>`
        fs.writeFileSync(`out/java_action/${java_action.name}.html`, java_action_content);
    }

    return (Promise.resolve(module_content));
}

async function processPagesForModule(working_copy: OnlineWorkingCopy,
                                     domain_model: domainmodels.IDomainModel,
                                     module: projects.IModule) :Promise<String> {
    let module_content = "";

    const d_mod = getModule(domain_model);
    let module_pages = working_copy.model().allPages().filter(page => {
        const m_mod = getModule(page);

        if (m_mod == null || d_mod == null) {
            return (false);
        } else {
            return (m_mod.name === d_mod.name);
        }
    });

    module_pages = module_pages.sort((one, two) => one.name > two.name ? 1 : -1);

    for (let j = 0; j < module_pages.length; ++j) {
        const page = await module_pages[j].load();

        console.log("  -Page: " + page.name);
        module_content += `<a href="../page/${page.name}.html">${page.name}</a><br />`;

        //let context_type = page.
        let page_content = 
            `<html>
                <head>
                    <title>${page.name}::Page</title>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                </head>
                <body style="background-color:#f4f4f4;">
                    <div style="width:80%; margin:auto; background-color:#ffffff; padding:3em;-webkit-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);">
                        <a href="../${project_name}.html">Home</a>/<a href="../module/${module.name}.html">${module.name}</a>/<a href="../page/${page.name}.html">${page.name}</a>
                        <br />
                        <h1 style="display:inline">${page.name}</h1>
                        <h4 style="display:inline">::Page</h4>
                        <p>${page.documentation}</p>
                        <p><b>Title:</b> ${getStringFromText(page.title)}</p>
                        <p><b>URL:</b> ${page.url}</p>
                        <p><b>Class:</b> ${page.class}</p>
                        <p><b>Layout:</b> ${page.layoutCall.layoutQualifiedName}</p>
                    </div>
                </body>
            </html>`

        fs.writeFileSync(`out/page/${page.name}.html`, page_content);
    }

    return (module_content);
}
/*******************************/

let raw_config = fs.readFileSync("mdconfig.json", "utf8");
let config = JSON.parse(raw_config);

const username = config["username"];
const api_key = config["api_key"];
const project_name = config["project_name"];
const project_description = config["project_description"]
const project_id = config["project_id"];

const language_code = config["language_code"];

const branch_name = (config["branch_name"] === "") ? null : config["branch_name"];
const revision_number = config["revision_number"];

const modules: string[] = [];

for (let m in config["modules"]) {
    modules.push(config["modules"][m]);
}

const client = new MendixSdkClient(username, api_key);
const project = new Project(client, project_id, project_name);

async function main() {
    const working_copy = await client.platform().createOnlineWorkingCopy(project, new Revision(
        revision_number, new Branch(project, branch_name)));

    if (!fs.existsSync("./out")) {
        fs.mkdirSync("./out");
    }
    if (!fs.existsSync("./out/entity")) {
        fs.mkdirSync("./out/entity");
    }
    if (!fs.existsSync("./out/microflow")) {
        fs.mkdirSync("./out/microflow");
    }
    if (!fs.existsSync("./out/module")) {
        fs.mkdirSync("./out/module");
    }
    if (!fs.existsSync("./out/enumeration")) {
        fs.mkdirSync("./out/enumeration");
    }
    if (!fs.existsSync("./out/java_action")) {
        fs.mkdirSync("./out/java_action");
    }
    if (!fs.existsSync("./out/page")) {
        fs.mkdirSync("./out/page");
    }

    let main_content = 
        `<html>
            <head>
            <title>${project_name}</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
            </head>
            <body style="background-color:#f4f4f4;">
            <div style="width:80%; margin:auto; background-color:#ffffff; padding:3em;-webkit-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);">
                <a href="${project_name}.html">Home</a>
                <br />
                <h1 style="display:inline">${project_name}</h1>
                <p>${project_description}</p>
                <h3>Modules</h3>`

    let loaded_modules = working_copy.model().root.modules.filter(function(md) {
        return modules.includes(md.name);
    });

    loaded_modules = loaded_modules.sort((one, two) => one.name < two.name ? -1 : 1);
    
    for (let i = 0; i < loaded_modules.length; ++i) {
        const module = loaded_modules[i];
        const domain_model = await module.domainModel.load();
        
        if (!modules.includes(domain_model.containerAsModule.name)) {
            continue;
        }
        console.log("Module: " + module.name);
        const module_doc = domain_model.documentation;

        let module_content = 
        `<html>
            <head>
            <title>${module.name}::Module</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
            </head>
            <body style="background-color:#f4f4f4;">
            <div style="width:80%; margin:auto; background-color:#ffffff; padding:3em;-webkit-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);-moz-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.75);">
                <a href="../${project_name}.html">Home</a>/<a href="../module/${module.name}.html">${module.name}</a>
                <br />
                <h1 style="display:inline">${module.name}</h1>
                <h4 style="display:inline">::Module</h4>
                <p>${module_doc}</p>
                <h3>Entities</h3>
                ${(await processEntitiesForModule(domain_model, module))}
                <br /><h3>Associations</h3>
                ${(await processAssociationsForDomainModel(domain_model))}
                <div class="document_container">
                    <div class="row">
                        <div class="col-sm-3">
                            <h3>Enumerations</h3>
                        </div>
                        <div class="col-sm-3">
                            <h3>Microflows</h3>
                        </div>
                        <div class="col-sm-3">
                            <h3>Java Actions</h3>
                        </div>
                        <div class="col-sm-3">
                            <h3>Pages</h3>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-3" style="align:center">
                            ${(await processEnumerationsForModule(working_copy, domain_model, module))}
                        </div>
                        <div class="col-sm-3">
                            ${(await processMicroflowsForModule(working_copy, domain_model, module))}
                        </div>
                        <div class="col-sm-3">
                            ${(await processJavaActionsForModule(working_copy, domain_model, module))}
                        </div>
                        <div class="col-sm-3">
                            ${(await processPagesForModule(working_copy, domain_model, module))}
                        </div>
                    </div>
                </div>
            </div>
            </body>
        </html>`

        fs.writeFileSync(`out/module/${module.name}.html`, module_content);

        main_content += `<a href="module/${module.name}.html">${module.name}</a><br />`;
    };
    
    main_content += `</div></body></html>`
    fs.writeFileSync(`out/${project_name}.html`, main_content);
}

main();