
// The things you need to change are labelled with *******************************


// CHANGE THIS TO run(WidgetName)Widget ***************************************
const runMultiplierMethodWidget = ({ 
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

        expression = 'Calculate the interest on borrowing £' + value1 + ' for 3 years if the compound interest rate is ' + value2 + '% per year.';
        return {value1, value2}
    };
	// Fixed Mode
	const getFixedVariables = () => {
		value1 = '';
		value2 = '';
        for (var i = (expression.toLowerCase().indexOf('£') + 1); i < expression.length; i++)
		{
			if (expression.toLowerCase()[i] != ' ')
			{
				value1 += expression[i];
			}
			else
			{
				i = expression.length;
			}
		}
		value1 = Number(value1);
		for (var i = (expression.toLowerCase().indexOf('rate is ') + 8); i < expression.length; i++)
		{
			if (expression[i] != '%')
			{
				value2 += expression[i];
			}
			else
			{
				i = expression.length;
			}
		}
		value2 = Number(value2);
		return {value1, value2}
    };
	//////// STEPS ////////
	// Perform steps using provided variables from above 
	const returnSteps = ({ value1, value2 }) => {
		value1Modified_0 = value1 + (value1 * (value2 / 100));
		value1Modified_1 = value1Modified_0 + (value1Modified_0 * (value2 / 100));
		value1Modified_2 = value1Modified_1 + (value1Modified_1 * (value2 / 100));
		
		const steps = [
			expression, 
			`This calculation can be made more concise by using powers.<br><br>\\(${value1} \\times ${(1 + (value2 / 100)).toFixed(2)} \\times ${(1 + (value2 / 100)).toFixed(2)} \\times ${(1 + (value2 / 100)).toFixed(2)}\\)`, 
			`\\( = £${(value1 * Math.pow((1 + (value2 / 100)), 3)).toFixed(2)}\\)`, 

			`\\(${value1} \\times ${(1 + (value2 / 100)).toFixed(2)}^{3}\\)`, 
			`\\( = £${(value1 * Math.pow((1 + (value2 / 100)), 3)).toFixed(2)}\\)`, 
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