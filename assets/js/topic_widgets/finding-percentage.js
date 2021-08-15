
// The things you need to change are labelled with *******************************


// CHANGE THIS TO run(WidgetName)Widget ***************************************
const runFindingPercentageWidget = ({ 
	container, 
	inputType, 
	// CHANGE THESE TO THE VARIABLES YOU WILL USE FOR THE WIDGET *******************************
	expression = null
}) => {
	
	// Create a reference to the container that this widget is inside of
	const node = document.getElementById(container)

	// Create an element to contain the widget 
	const { containerElement } = createWidgetContainer(node, {classes: "topic-widget-main-div"})
	
	// Adjust the theme colors when the theme switches between light and dark mode
	listenToThemeChanges(containerElement)

	//////// VARIABLES ////////
	// Random Mode 
	const generateRandomVariables = () => {
        // CHANGE THESE TO THE VARIABLES YOU REQUIRE ********************************************
		// Define a method to generate random numbers
        const randomNumber = () => Math.floor(Math.random() * 100) + 1

        // First value
        const value1 = randomNumber();

        // Second value
        const value2 = randomNumber();
        expression = value1 + '% of ' + value2;
        return {value1, value2}
    };
	
	// Fixed Mode
	const getFixedVariables = () => {
        // CHANGE THESE TO THE VARIABLES YOU REQUIRE ********************************************
		// First fraction
		if ((expression.indexOf('%') != -1) && (expression.split('%')[1].indexOf(' of ') != -1))
		{
			value1 = Number(expression.split('%')[0]);
			value2 = Number(expression.split(' of ')[1]);
		}
        return {value1, value2}
    }
	
	//////// STEPS ////////
	// Perform steps using provided variables from above
	const returnSteps = ({ value1, value2 }) => {
        // RETURN THE STEPS FOR THE WIDGET *****************************************************
		// Create the strings for each step
        const steps = [
			// WE USE MATHJAX, SEE BOTTOM OF THIS FILE FOR FORMATTING ***************************************
			`\\( ${value1}  \\)% of \\(  ${value2}\\)`, 
			`\\( ${value1} \\)% is the same as \n \\(\\frac{${value1}}{100} \\times  ${value2}\\) <br>To find \\(${value1}\\)% of \\(${value2}\\), multiply \\(\\frac{${value1}}{100}\\) by \\(${value2}\\):`, 
			`\\( = \\frac{${value1}}{100} \\times \\frac{${value2}}{1} \\)`, 
			`\\( = \\frac{${value1} \\times ${value2}} {{100} \\times {1}} \\)`, 
			`\\( = \\frac{${value1 * value2}}{${100 * 1}} \\)`, 
			`\\( = ${(value1 * value2) / (100 * 1)} \\)`
        ];
		return steps;
	}
	//////// HTML ELEMENTS ////////
	// Create methods that generate steps for either the fixed input or for random problems
	const fixedSteps = () => returnSteps(getFixedVariables())
	const generateRandomProblem = () => returnSteps(generateRandomVariables())

	// Contains either fixed steps or a function to generate random problems
	const config = inputType == "fixed" ? { steps: fixedSteps() } : { generateRandomProblem }

	// Create the widget (e.g. creating arrows or rendering mathjax)
	createWidgetElements(containerElement, config);	
}
/*
MATHJAX FORMATTING 
	Powers 								x^{2n}
	Fractions 							\\frac{1}{6}
	Mixed number fraction 		7\\frac{1}{6}
	Column Vector 					\\binom{1}{2}
	Coordinate 							(1,1)
	Square root 						\\sqrt{16}
	Recurring decimal 				0.2\\dot{2}1\\dot{9}
	Standard form 					1.01\\times10^{-1}
	Inequality symbols 				\\leq, <, \\geq, >
	Pi 										\\pi
*/