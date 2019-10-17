# Mendix Documenter
A command-line NodeJS tool to generate a Javadoc-like website for any Mendix project using the Mendix platform and model SDK. 

## To install:
- Ensure you have the latest version of node, npm and typescript installed
- Run 'npm i docsify-cli -g' to install docsify-cli globally
- Download the repository or clone using 'git clone https://github.com/AuraQ/MendixDocumenter'
- In a terminal navigate to the root folder of the project
- Run 'npm install' to download the node modules
- Create an mdconfig.json file and fill out all the fields using your Mendix details
- Back in the terminal run 'npm start'
- The documentation should generate output to the /docs/ folder, browse http://localhost:3000 to view

## Configuration

In the root folder, create a file named mdconfig.json (see mdconfig.json.example for a sample).

### auth

```
{
    "auth" : {
        "username":"",
        "apikey":""
    }
    ...
}
```

**auth.username**: Your Mendix login (i.e. your email address)

**auth.apikey**: An api key that you have generated for your Mendix login (not a project api key)

### project
```
{
    ...
    "project":{
        "id":"",
        "name":"",
        "description":"",
        "branch": "",
        "revision": -1
    }
    ...
}
```

**project.id**: The id of your project

**project.name**: The name of your project

**project.description**: A description for your project to be displayed on the documentation home screen. Supports Markdown

**project.branch**: The name of the branch you want to use (or empty string for the main line)

**project.revision**: The revision number to generate documentation for (use -1 for latest)

### app
```
{
    ...
    "app":{
		"language_code": "en_US",
        "modules": [
			"MyFirstModule"
		],
		"saveProjectDataAsJson" : true,
		"rootOutputFolder" : "./docs"
    }
}
```

**app.language_code**: The language code to use when getting labels and enumerations, must match a language code within the project.

**app.modules**: An array of modules to generate docs for, any module not in this array will be ignored.

**app.saveProjectDataAsJson**: A boolean indicating whether the project data retrieved over the SDK should be saved as a json file to the root of the project.

**app.rootOutputFolder**: The root output folder for the generated documentation.
