
// The things you need to change are labelled with *******************************


// CHANGE THIS TO run(WidgetName)Widget ***************************************
const runPercentageChangeWidget = ({ 
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

        expression = 'You have ' + value1 + ' pens and receive ' + value2 + ' pens from your friend. What is the percentage increase in the number of pens you have?';
        return {value1, value2}
    };
	// Fixed Mode
	const getFixedVariables = () => {
		value1 = '';
		value2 = '';
        if (expression.toLowerCase().indexOf('you have ') != -1)
		{
			for (var i = (expression.indexOf('you have ') + 10); i < expression.length; i++)
			{
				if (expression[i] != ' ')
				{
					value1 += expression[i];
				}
				else
				{
					i = expression.length;
				}
			}
		}
		value1 = Number(value1);
		for (var i = (expression.toLowerCase().indexOf(' and receive ') + 13); i < expression.length; i++)
		{
			if (expression[i] != ' ')
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
		const steps = [
			expression, 
			`Divide the number of pens received by the original number.<br><br>\\(\\frac{${value2}}{${value1}}\\)`, 
			`\\( = ${((value2 / value1) * 100).toFixed(1)}\\)%`
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