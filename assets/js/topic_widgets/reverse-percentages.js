
// The things you need to change are labelled with *******************************


// CHANGE THIS TO run(WidgetName)Widget ***************************************
const runReversePercentagesWidget = ({ 
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

        expression = 'A shop has a sale where ' + value1 + '% is taken off all prices. A top is now worth £' + value2 + '. What price was it originally?';
        return {value1, value2}
    };
	// Fixed Mode
	const getFixedVariables = () => {
		value1 = '';
		value2 = '';
        for (var i = (expression.toLowerCase().indexOf('where ') + 6); i < expression.length; i++)
		{
			if (expression.toLowerCase()[i] != '%')
			{
				value1 += expression[i];
			}
			else
			{
				i = expression.length;
			}
		}
		value1 = Number(value1);
		for (var i = (expression.toLowerCase().indexOf('£') + 1); i < expression.length; i++)
		{
			if (expression[i] != '.')
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
			`Calculating reverse percentages depends on knowing that before an increase or decrease in price, an item is always worth 100% of its value, no matter what that value is. This is because 100% represents the whole amount or the full price.<br>A common mistake is to work out \\(${value1}\\)% of £\\(${value2}\\) and add this on to £\\(${value2}\\). This will not work as \\(${value1}\\)% of £\\(${value2}\\) is not as much proportionally as \\(${value1}\\)% of the bigger, original amount.<br><br>100% - \\(${value1}\\)%\\( = ${100 - value1}\\)%`, 
			`\\(${100 - value1}\\)%\\( = ${value2}\\)`, 
			`To find the original price of the item, 100% has to be found. There are many ways to do this, but using a unitary method is a method that will always work.<br><br>1%\\( = ${value2}\\) / \\(${(100 - value1)}\\)`, 
			`\\( = ${(value2 / (100 - value1)).toFixed(2)}\\)`, 
			`100%\\( = ${(value2 / (100 - value1)).toFixed(2)} \\times 100\\)`, 
			`\\( = ${((value2 / (100 - value1)) * 100).toFixed(2)}\\)<br><br>100% of the value of the top is worth £\\(${((value2 / (100 - value1)) * 100).toFixed(2)}\\) which means before the sale of \\(${value1}\\)%, the top cost £\\(${((value2 / (100 - value1)) * 100).toFixed(2)}\\).`, 
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