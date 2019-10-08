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

## Configuration file:
```json 
{
    "username": "email@example.com",
    "api_key": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "project_name": "Project",
    "project_description": "An example mdconfig.json",
    "project_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    "language_code": "en_US",
    "branch_name": "Development",
    "revision_number": -1,
    "modules": [
        "Emails",
        "Reports",
        "Users"
    ],
    "saveProjectDataAsJson" : true,
    "rootOutputFolder" : "./docs"
}
```
- **Username**: Your Mendix account username.
- **API Key**: A Mendix API key for your profile. Info: https://docs.mendix.com/developerportal/mendix-profile/#api-key
- **Project Name**: The name of the project you wish to generate docs for.
- **Project Description**: A description of the project, this is used for the docs homepage only.
- **Project ID**: The Mendix generated ID for the project, this can be found on Apps/<Your App>/Settings on Sprintr.
- **Language Code**: The language code to use when getting labels and enumerations, must match a language code within the project.
- **Branch Name**: The name of the branch to generate docs for, set to 'null' for main line.
- **Revision Number**: The revision of the branch to generate docs for, set to '-1' for latest.
- **Modules**: An array of modules to generate docs for, any module not in this array will be ignored.