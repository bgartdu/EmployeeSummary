// Libraries required
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs-promise-native");

// Local files required
const render = require("./lib/htmlRenderer");
const commonPrompt = require("./data/commonPrompt");
const additionalPrompt = require("./data/additionalPrompt");

// Primary constants - ALL_CAPS_PLUS_UNDERSCORES implies DO NOT CHANGE.
const OUTPUT_DIR = path.resolve(__dirname, "output");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "team.html");
const MODULE_DIR = path.resolve(__dirname, "lib");
const MODULES = [ "Engineer", "Intern", "Manager" ];

// Dynamic constants - normal variable names imply contained objects/arrays are mutable.
// the field is still `const` since it should not be reassigned
const constuctors = { };	// { TypeName: TypeName.constructor }
const choices = [ ];		// [ TypeName ]
// Loop over MODULES constant defined above
for (let i in MODULES) {
	// Pull out module name 
	const module = MODULES[i];
	// Add it as a choice
	choices[choices.length] = module;
	// Dynamically import that module
	constuctors[module] = require(path.join(MODULE_DIR, module));
}
// Add a choice for "Done"
choices[choices.length] = "Done";

/** Creates an instance with a constructor and the given argument array. */
function createInstance(constructor, argArray) {
	// Args to call bind with...
	const args = [ null, ...argArray ]
	// all functions have a `.bind` function that 
	// returns a new version of the function with the 'this' changed...
	// and all functions (including `.bind`!) have an apply method that invokes the method,
	// optionally overriding the 'this', and passing in args as if they were in the parameters list...
	// eg,  
	// `Math.max.apply(null, [1,2,3,4,5,6]);`
	// 		is the same as 
	// `Math.max(1,2,3,4,5,6);`
	// This invokes the constructors' bind on itself (which doesn't change it), but does prepare 
	const factory = constructor.bind.apply(constructor, args);
	// Then, we invoke the created factory to instantiate the object with the given type...
	return new factory();
	// whew, we avoided having a lot of `if...elseif...elseif...elseif`!
}
/** Creates an employee of a given kind, prompting the user for any needed information. */
async function createEmployee(kind) {
	// Construct prompt array out of the prompts common to all employees,
	// appended with the additional prompts for that kind of employee...
	// the `...` operator copies all of the elements from the thing to its right,
	// so, given `a = [ 1, 2, 3 ]; b = [ 4, 5, 6 ];`:
	// c = [ ...a, ...b ]
	// is 
	// [ 1, 2, 3, 4, 5, 6 ];
	const prompt = [ ...commonPrompt, ...additionalPrompt[kind] ];
	// Pass the prompts off to inquirer and let it do all the stuff 
	const data = await inquirer.prompt(prompt);
	// Find the constructor for the thing
	const constructor = constuctors[kind];
	// Fill an args array with all information from user
	const args = [];
	for (let key in data) {
		args[args.length] = data[key];
	}
	// Pass off to `createInstance()`
	return createInstance(constructor, args);
	
	// Long version, we don't want this, it's hard to maintain and painful to look at:
	// if (kind === "Engineer") {
	// 	return new Engineer(data.name, data.id, data.email, data.github);
	// } else if (kind === "Intern") {
	// 	return new Intern(data.name, data.id, data.email, data.school);
	// } else if (kind === "Manager") {
	// 	return new Intern(data.name, data.id, data.email, data.officeNumber);
	// }
	// } else if (...) {
	// 	return new .....;	
	// }
}

// Main is async cause we want to make use of modern javascript keyword, `await`
async function main() {
	// Collect employees made by user in an array
	const employees = [];
	// Loop until user chooses to stop (using break)
	while (true) {
		// Ask user what kind of employee to make
		let data = await inquirer.prompt([
			{
				type: "list",
				message: "What kind of employee do you want to create?",
				name: "kind",
				choices, // Dynamic choices as made available above...
			}
		]);
		
		// End loop if user did not select an employee type, we're done
		if (data.kind === "Done") { 
			break;
		}
		
		// Otherwise wait for user to enter data for that employee
		employees[employees.length] = await createEmployee(data.kind);
	}
	
	// Pass employees off to html renderer
	const html = (render(employees));
	// Ensure output directory exists
	try { await fs.mkdir(OUTPUT_DIR); } catch (err) {}
	
	// Then write file
	await fs.writeFile(OUTPUT_PATH, html);
}
// Invoke main 
main();