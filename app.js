const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs-promise-native");

const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");

const render = require("./lib/htmlRenderer");

const commonPrompt = [
    {
        type: "input",
        name: "name",
        message: "What is the employees name?"
    },
    {
        type: "input",
        name: "id",
        message: "What is the employees id?"
    },
    {
        type: "input",
        name: "email",
        message: "What is the employees email?"
    }
];

const additionalPrompt = {
    Engineer: [
        {
            type: "input",
            name: "github",
            message: "What is the employees github?"
        }
    ],
    Intern: [
        {
            type: "input",
            name: "school",
            message: "What is the employees school?"
        }
    ],
    Manager: [
        {
            type: "input",
            name: "officeNumber",
            message: "What is the employees office number?"
        }
    ],
}

const constructors = { Engineer, Intern, Manager }

/** Creates an instance with a constructor and the given argument array. */
function createInstance(constructor, argArray) {
    const args = [null, ...argArray]
    const factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
}

async function createEmployee(kind) {
    const prompt = [ ...commonPrompt, ...additionalPrompt[kind] ];
    const data = await inquirer.prompt(prompt);
    
    const constructor = constructors[kind];
    const args = [];
    for (let key in data) {
        args[args.length] = data[key];
    }
    return createInstance(constructor, args);
}

async function main() {
    const employees = [];
    while (true) {
        let data = await inquirer.prompt([
            {
                type: "list",
                message: "What kind of employee do you want to create?",
                name: "kind",
                choices: [ "Engineer", "Intern", "Manager", "Done"],
            }
        ]);
        
        if(data.kind === "Done") {
            break;
        }

        employees[employees.length] = await createEmployee(data.kind);
    }

    const html = (render(employees));
    try { await fs.mkdir("./output");} catch (err) {}

    await fs.writeFile("./output/team.html", html);
    
}


main()


// Write code to use inquirer to gather information about the development team members,
// and to create objects for each team member (using the correct classes as blueprints!)

// After the user has input all employees desired, call the `render` function (required
// above) and pass in an array containing all employee objects; the `render` function will
// generate and return a block of HTML including templated divs for each employee!

// After you have your html, you're now ready to create an HTML file using the HTML
// returned from the `render` function. Now write it to a file named `team.html` in the
// `output` folder. You can use the variable `outputPath` above target this location.
// Hint: you may need to check if the `output` folder exists and create it if it
// does not.

// HINT: each employee type (manager, engineer, or intern) has slightly different
// information; write your code to ask different questions via inquirer depending on
// employee type.

// HINT: make sure to build out your classes first! Remember that your Manager, Engineer,
// and Intern classes should all extend from a class named Employee; see the directions
// for further information. Be sure to test out each class and verify it generates an
// object with the correct structure and methods. This structure will be crucial in order
// for the provided `render` function to work! ```
