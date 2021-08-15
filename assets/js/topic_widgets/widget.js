/**
 * @param {HTMLElement} parentElement The element in the html this widget is inside of (aka `container`).
 * @param {Object} config Specify classes or an id for the element
 * @returns The element that contains the widget
 */
const createWidgetContainer = (
	parentElement,
	{ classes = null, id = null }
) => {
	const containerElement = document.createElement("div")

	if (classes != null) containerElement.className = classes
	if (id != null) containerElement.id = id

	parentElement.append(containerElement)

	return { containerElement }
}

/**
 * @param {string} defaultTheme "light" or "dark"
 */
const listenToThemeChanges = (containerElement, defaultTheme = "light") => {
	const setThemeColors = (theme) => {
		const themes = {
			light: {
				backgroundColor: "#ffffff",
				textColor: "#000000",
			},
			dark: {
				backgroundColor: "#000000",
				textColor: "#ffffff",
			},
		}

		containerElement.style.backgroundColor = themes[theme].backgroundColor
		containerElement.style.color = themes[theme].textColor
	}

	// Create a named function so the event listener can be removed
	const themeSetCallback = (event) => {
		const theme = event.detail.newTheme

		setThemeColors(theme)
	}

	// Set the theme to start as the default theme specified above
	setThemeColors(defaultTheme)

	// Update the color theme when the theme is changed
	document.addEventListener("themeset", themeSetCallback)
}

/**
 * Creates the arrows and text from a series of provided steps
 * @param {HTMLElement} containerElement The widget container
 * @param {Array} steps Optional if in random mode; The steps that encapsulate the given problem
 * @param {Function} generateRandomProblem Optional if in fixed mode; used to generate new problems in random mode
 */
const createWidgetElements = (
	containerElement,
	{ steps = null, generateRandomProblem = null }
) => {
	// Create a list to store the html elements corresponding to each step
	let stepsElements = []

	// Create a variable to track the current step in the process
	let step = 0

	const hideElement = (element) => (element.style.visibility = "hidden")
	const showElement = (element) => (element.style.visibility = "visible")

	const isFirstStep = () => step == 0
	const isLastStep = () => step == stepsElements.length - 1

	const updateArrows = (leftArrow, rightArrow) => {
		if (isFirstStep()){	
			leftArrow.style.backgroundColor = "#dddddd";	
			leftArrow.style.cursor = "default";	
		} else {	
			leftArrow.style.backgroundColor = "rgb(178, 228, 189)";	
			leftArrow.style.cursor = "pointer";	
		}	
		if (isLastStep()){	
			rightArrow.style.backgroundColor = "#dddddd";	
			rightArrow.style.cursor = "default";	
		} else {	
			rightArrow.style.backgroundColor = "rgb(178, 228, 189)";	
			rightArrow.style.cursor = "pointer";	
		}
	}

	// Shows the next step
	const nextStep = (leftArrow, rightArrow) => {
		if (isLastStep()) return

		// Move to the next step
		step++

		updateArrows(leftArrow, rightArrow)

		// Show the element for the next step
		showElement(stepsElements[step])
	}

	// Go to the previous step
	const previousStep = (leftArrow, rightArrow) => {
		if (isFirstStep()) return

		// Move to the previous step
		step--

		updateArrows(leftArrow, rightArrow)

		// Show the element for the next step
		hideElement(stepsElements[step + 1])
	}

	const createStepElements = () => {
		const createStepElement = (html, isExpression = false) => {
			const element = document.createElement("div")

			element.className = "calculation-step"
			element.style.visibility = isExpression ? "visible" : "hidden"

			const isString = typeof html === 'string' || html instanceof String

			// Insert the string into the div, or insert the html element into the div
			if(isString) element.innerHTML = html
			else element.append(html)

			return element
		}

		if (steps == null && generateRandomProblem == null)
			console.error(
				"Steps not provided and problem generation method not provided. Please provide one of the two."
			)

		if (steps == null) steps = generateRandomProblem()

		steps.forEach((stepString, index) => {
			const html = stepString
			const isExpression = index == 0

			const element = createStepElement(html, isExpression)

			// Insert the element into the webpage
			containerElement.append(element)

			stepsElements.push(element)
		})

		const removeStepElements = () => {
			stepsElements.forEach((element) => element.remove())

			stepsElements = []
		}

		return removeStepElements
	}

	let removeStepElements = createStepElements()

	const createArrowsAndButton = () => {
		// Create an arrow to hide the result of the expression
		const leftArrow = document.createElement("a")
		leftArrow.className = "topic-widget-arrow topic-widget-arrow-left"
		leftArrow.innerHTML = "<p>\u003C</p>"
		containerElement.append(leftArrow)

		// Create an arrow to show the result of the expression
		const rightArrow = document.createElement("a")
		rightArrow.className = "topic-widget-arrow topic-widget-arrow-right"
		rightArrow.innerHTML = "<p>\u003E</p>"
		containerElement.append(rightArrow)

		// Handle when the arrows are clicked
		leftArrow.addEventListener("click", () =>
			previousStep(leftArrow, rightArrow)
		)
		rightArrow.addEventListener("click", () =>
			nextStep(leftArrow, rightArrow)
		)

		// Skip the rest if there is no random method
		if (generateRandomProblem == null) return

		// Create a button to generate more examples if the widget is in random mode
		const randomButton = document.createElement("a")

		randomButton.innerHTML = "Another example"
		randomButton.className = "topic-widget-random-button"

		// Generate a new example when this button is clicked
		randomButton.addEventListener("click", () => {
			// Remove the old steps from the widget
			removeStepElements()

			// Reset the step counter
			step = 0

			// Reset the arrows
			updateArrows(leftArrow, rightArrow)

			// Generate new values for the widget
			steps = generateRandomProblem()

			// Recreate the step elements
			removeStepElements = createStepElements()

			// Tell MathJax to re-check for math
			MathJax.typeset()
		})

		containerElement.append(randomButton)
	}

	createArrowsAndButton()
}

/**
 * Adds an image to the given element
 * @param {HTMLDivElement} containerElement The parent element to the image  
 * @param {String} imagePath The path to the image
 * @param {String} imageWidth CSS property (e.g. 80%)
 * @param {String} maxImageHeight CSS property (e.g. 50vh)
 * @param {String} topMargin CSS property (e.g. 1rem)
 * @param {String} bottomMargin CSS property (e.g. 1rem)
 * @returns {Function} A function that removes the image from the widget
 */
const imageStep = ({
	imagePath,
	imageWidth = "80%",
	maxImageHeight = "50vh",
	topMargin = "0rem",
	bottomMargin = "0rem",
}) => {
	// Create the image
	const imageElement = document.createElement("img")

	imageElement.src = imagePath
	imageElement.style.maxWidth = imageWidth
	imageElement.style.display = "block"
	imageElement.style.marginLeft = "auto"
	imageElement.style.marginRight = "auto"
	imageElement.style.marginTop = topMargin
	imageElement.style.marginBottom = bottomMargin
	imageElement.style.maxHeight = maxImageHeight
	imageElement.style.height = "auto"

	return imageElement
}
