
// The things you need to change are labelled with *******************************


// CHANGE THIS TO run(WidgetName)Widget ***************************************
const runFractionMultiplicationWidget = ({ 
	container, 
	inputType, 
	// CHANGE THESE TO THE VARIABLES YOU WILL USE FOR THE WIDGET *******************************
	inputted_numerator_1, 
	inputted_denominator_1, 
	inputted_numerator_2, 
	inputted_denominator_2 
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
        const randomNumber = () => Math.floor(Math.random() * 10) + 1

        // First fraction
        const numerator_1 = randomNumber()
        const denominator_1 = randomNumber()

        // Second Fraction
        const numerator_2 = randomNumber()
        const denominator_2 = randomNumber()

        return { numerator_1, denominator_1, numerator_2, denominator_2}
    }
	
	// Fixed Mode
	const getFixedVariables = () => {
        // CHANGE THESE TO THE VARIABLES YOU REQUIRE ********************************************
		// First fraction
        const numerator_1 = inputted_numerator_1
        const denominator_1 = inputted_denominator_1

        // Second Fraction
        const numerator_2 = inputted_numerator_2
        const denominator_2 = inputted_denominator_2

        return { numerator_1, denominator_1, numerator_2, denominator_2}
    }
	
	
	
	
	
	//////// STEPS ////////
	// Perform steps using provided variables from above 
	const returnSteps = ({ numerator_1, denominator_1, numerator_2, denominator_2 }) => {
        // PERFORM ANY CALCULATIONS YOU REQUIRE **********************************************
		// Resulting Fraction
        const answer_numerator = numerator_1 * numerator_2
        const answer_denominator = denominator_1 * denominator_2
	
		// RETURN THE STEPS FOR THE WIDGET *****************************************************
		// Create the strings for each step
        const steps = [
			// WE USE MATHJAX, SEE BOTTOM OF THIS FILE FOR FORMATTING ***************************************
			`Multiply \\(  \\frac{${numerator_1}}{${denominator_1}}  \\) and \\(  \\frac{${numerator_2}}{${denominator_2}}  \\)`,
			`\\(  Multiply \\frac{${numerator_1}}{${denominator_1}}  and \\frac{${numerator_2}}{${denominator_2}}  \\)`,
            `\\(  = \\frac{${numerator_1}  \\times  ${numerator_2}} {${denominator_1}  \\times ${denominator_2}}  \\)`,
            `\\(  = \\frac{${answer_numerator}}  {${denominator_1}  \\times  ${denominator_2}}  \\), multiply the numerators`,
            `\\(  = \\frac{${answer_numerator}}  {${answer_denominator}}  \\), multiply the denominators`,
	
			// IMAGE 
			// imageStep({imagePath: "assets/images/1280_15ntkpxqt54y-sai-kiran-anagani.jpg", imageWidth: "60%"}), 
			
			// CUSTOM HTML 
			// Any custom classes add to assets/css/widgets/topic_widgets.css
			// `<strong class="myClass">5\\(\\times\\)6</strong>`
        ]

		return steps
	}
	
	
	


	//////// HTML ELEMENTS ////////
	// Create methods that generate steps for either the fixed input or for random problems
	const fixedSteps = () => returnSteps(getFixedVariables())
	const generateRandomProblem = () => returnSteps(generateRandomVariables())

	// Contains either fixed steps or a function to generate random problems
	const config = inputType == "fixed" ? { steps: fixedSteps() } : { generateRandomProblem }

	// Create the widget (e.g. creating arrows or rendering mathjax)
	createWidgetElements(containerElement, config)
	
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
