let treeDiagramContainer

// A global variable which stores all the colors used in this theme
let treeDiagramThemeColors

const runTreeDiagramWidget = ({container, labels, values}) => {
    treeDiagramContainer = document.getElementById(container)

    let treeDiagram

    const getThemeColors = (theme) => {
        // Edit these colors to change the 
        // colors that are dependent on the theme
    
        const themes = {
            "light": {
                backgroundColor: "#f5f7fa",
                lineColor: "#d8416c",
                textColor: "#000000"
            },
            "dark": {
                backgroundColor: "#1D2126",
                lineColor: "#d8416c",
                textColor: "#ffffff"
            }
        }
    
        return themes[theme]
    }
    
    const defaultTheme = "light"
    
    const setThemeColors = (theme) => {
        treeDiagramThemeColors = getThemeColors(theme)
    
        // Switch the css class of the widget container when the theme changes
        const newThemeClass = `widget-container-${theme}`
    
        // Switch the theme of the widget
        treeDiagramContainer.classList = ""
        treeDiagramContainer.classList.add(newThemeClass)
    
        // Rerender the tree diagram to update its colors
        if(treeDiagram != null) treeDiagram.resize()
    }
    
    setThemeColors(defaultTheme)
    
    // Change the theme colors when the document theme is changed
    document.addEventListener("themeset", (event) => {
        setThemeColors(event.detail.newTheme)
    })
    
    // Contains all of the answers from the inputs
    let answers = []
    
    // Remembers which answer values correspond to which inputs
    // Note: this is for when the html inputs are regenerated and the values need to persist
    let valueToAnswer = {}
    
    // const answersHiddenInput = document.getElementById("answers")
    const answersHiddenInput = document.createElement("input")

    // Configure the hidden input
    answersHiddenInput.type = "hidden"
    answersHiddenInput.name = "answers[]"

    // Insert the hidden input into the html
    treeDiagramContainer.append(answersHiddenInput)
    
    const createAnswerContainer = (initalValue, index) => {
        // Connects the input to its old value, unless this 
        // is the first time this input has been created,
        // in which case, add a new answer to `answers` and connect it
        if (!(index in valueToAnswer)) {
            answers.push(initalValue)
    
            valueToAnswer[index] = answers.length - 1
    
            index = answers.length - 1
        } else {
            index = valueToAnswer[index]
        }
    
        // Do an initial update of the hidden input
        answersHiddenInput.value = encodeURIComponent(JSON.stringify(answers))
    
        const getValue = () => answers[index]
    
        const setValue = (value) => {
            answers[index] = value
    
            answersHiddenInput.value = encodeURIComponent(JSON.stringify(answers))
        }
    
        return { getValue, setValue }
    }

    const heightToWidthRatio = 5/8

    const getHeightOfCanvas = () => {
        const windowHeight = window.innerHeight|| document.documentElement.clientHeight|| 
document.body.clientHeight
        const maxHeight = windowHeight * (5.5/10)

        let height = treeDiagramContainer.clientWidth * heightToWidthRatio

        // Make sure that the widget doesn't take up too much of the screen
        if(height > maxHeight) {
            height = maxHeight
        } 

        return height
    }
    
    let dims = {
        w: treeDiagramContainer.clientWidth, 
        h: getHeightOfCanvas()
    }

    let lastDims = dims
        
    // Define the p5 sketch methods
    const sketch = p => {
        p.setup = () => {
            p.createCanvas(dims.w, dims.h)

            treeDiagram = new TreeDiagram(p, createAnswerContainer, labels, values)          
        }

        p.draw = () => {
            p.background(treeDiagramThemeColors.backgroundColor)

            treeDiagram.draw()

            // Only run draw once
            p.noLoop()
        }

        p.windowResized = () => {
            dims = {
                w: treeDiagramContainer.clientWidth, 
                h: getHeightOfCanvas()
            }

            // Make sure that the window actually resized
            // Note: this is to address a problem on android
            if(dims.w == lastDims.w) return

            lastDims = dims

            // Resize the canvas to its new dimensions
            p.resizeCanvas(0, 0)
            p.resizeCanvas(dims.w, dims.h)

            // Resize widgets
            treeDiagram.resize()
        }
    }

    // Create the canvas and run the sketch in the html widget container.
    new p5(sketch, treeDiagramContainer)
}

class TreeDiagram {
    constructor(p, createAnswerContainer, labels, values) {
        this.p = p

        this.labels = labels
        this.values = values

        // A method to connect an input to the answers hidden input
        this.createAnswerContainer = createAnswerContainer

        // Stores the html inputs and mathjax text
        this.htmlElements = []

        this.calculateDimensions()
    }
    
    calculateDimensions() {
        // Delete the html elements from the document
        this.htmlElements.forEach(element => {
            element.remove()
        })

        // Make sure that the html elements list is now empty
        this.htmlElements = []

        // Calculate the font sizes for mathjax text and labels on the widget
        // this.fontSize = this.p.width / 28
        this.fontSize = this.p.max(this.p.height / 17, 17)

        this.valueFontSize = this.fontSize * 7/8

        // Calculate the dimensions of the text inputs
        this.inputWidth = this.p.height / 6
        this.inputHeight = this.valueFontSize * 1.3

        // Update the css properties for the inputs and the mathjax text
        treeDiagramContainer.style.setProperty("--font-size", this.valueFontSize + "px")
        treeDiagramContainer.style.setProperty("--input-width", this.inputWidth + "px")
        treeDiagramContainer.style.setProperty("--input-height", this.inputHeight + "px")

        // Determine how much padding to add between the branches of the tree and the text
        this.textBoxPadding = this.p.width / 24

        // Calculate the size of text boxes for the labels and values
        this.maxTextBoxWidth = this.p.width / 8
        this.textBoxWidth = this.calculateTextBoxWidth()
        this.textBoxHeight = this.textBoxWidth

        // Calculate the initial dimensions of the branches of the tree (as boxes)
        this.lineWidth = this.p.width / 4
        this.lineHeight = this.p.height * (2/4)

        // Sets the thickness of the lines in the tree
        this.lineThickness = 2

        // Center of the vertical axis of the sketch
        this.verticalCenter = this.p.height / 2

        // Calculate how many layers the will be in the tree (e.g. the following tree has 1 layer)
        //  1
        // / 
        // \ 
        //  2
        this.layersInTree = this.calculateLayersInTree()

        // Calculate the total amount of horizontal space the tree will take up
        const totalWidth = this.layersInTree * this.lineWidth + this.layersInTree * this.textBoxWidth 

        // Calculate where the tree should be placed along the x axis
        this.leftStartX = (this.p.width - totalWidth) / 2 - (this.textBoxWidth / 2)

        // Store the positions of all of the points on the tree
        this.positions = [
            [this.p.createVector(this.leftStartX, this.verticalCenter), this.lineWidth, this.lineHeight]
        ]

        // Calculate the positions of all of the points on the tree
        this.addAllPositionsToTree()
    }

    /**
     * Performs a breadth-first tree traversal to find all of the points of the tree
     */
    addAllPositionsToTree() {
        // Create a queue for the positions of vertices in the tree
        const queue = [this.positions[0]]

        let node

        // Add all of the child branches to the tree
        for(let i = 1; i <= this.labels.length - 1; i++) {
            // Remove the next node in the queue
            node = queue.pop()

            // Get the information from the current node
            const [pos, lw, lh] = node

            const _pos = pos.copy()

            // Move the following points to make space for the text at this position
            _pos.x += this.textBoxWidth

            // Create variables to represent the potential children of this vertex
            let up, down

            // Add a child up and to the right of this vertex, if there is a label for it
            if((i - 1) * 2 < this.labels.length) {
                up = this.calculatePosition(lh, lw, _pos, -1)
                queue.unshift(up)
            }

            // Add a child down and to the right of this vertex, if there is a label for it
            if((i - 1) * 2 + 1 < this.labels.length) {
                down = this.calculatePosition(lh, lw, _pos, 1)
                queue.unshift(down)
            }

            // Add `up` and `down` to `this.positions` if they exist
            if(up != null) this.positions.push(up)
            if(down != null) this.positions.push(down)
        }
    }

    calculateLayersInTree() {
        let nodes = this.labels.length

        let power = 0

        // Calculate the previous greatest power of 2 before the number of labels
        // E.g. Labels: "1", "2" : Power of 2: 2^1 (for two labels) : returns 1 
        while(Math.pow(2, power + 1) <= nodes) {
            power++
            nodes -= Math.pow(2, power)
        }

        return power
    }

    calculateTextBoxWidth() {
        this.p.textSize(this.fontSize)

        let max = this.p.textWidth(this.labels[0])

        // Find the maximum width of any of the labels
        for(const label of this.labels) {
            const width = this.p.textWidth(label)

            if(width > max) max = width
        }

        // Return the width of the largest label as long as it is less than the maximum allowed width,
        // Otherwise return the maximum allowed width
        return Math.min(max + this.textBoxPadding, this.maxTextBoxWidth)
    } 

    calculatePosition(parentLineHeight, parentLineWidth, parentPosition, direction) {
        // Calculate the new dimensions for the line on the tree
        const lineWidth = parentLineWidth
        const lineHeight = parentLineHeight / 2

        // Calculate the position of this point
        const position = this.p.createVector(
            parentPosition.x + parentLineWidth,
            parentPosition.y + direction * lineHeight
        )

        return [position, lineWidth, lineHeight]
    }

    draw() {
        // Draw all of the inputs, values, lines, and labels
        for(let i = 1; i < this.positions.length; i++) {
            // Determine which point on the tree is the parent of this point
            const n = i + 1
            const parentIndex = n % 2 == 0 ? (n / 2) - 1 : ((n - 1) / 2) - 1
            
            const [parent, child] = this.getPositions(parentIndex, i)

            // Draw the label for this point
            this.drawLabel(this.labels[i - 1], child)

            let element

            if(this.values[i - 1].type != "input") { // Not an input
                // Calculate how far to move the value from the line
                const yPadding = this.valueFontSize * (parent.y < child.y ? -1 : 2)

                // Calculate where to place the value text
                const elementPosition = this.p.createVector(
                    (parent.x + child.x) / 2,
                    (parent.y + child.y) / 2 - yPadding
                )

                // Create a value text html element
                element = this.drawValue(this.values[i - 1], elementPosition)
            }
            else { // An input
                // Calculate how far to move the input from the line
                const yPadding = this.inputHeight * (parent.y < child.y ? -0.5 : 1.5)

                // Calculate where to place the input
                const elementPosition = this.p.createVector(
                    (parent.x + child.x) / 2 - (this.inputWidth / 3),
                    (parent.y + child.y) / 2 - yPadding
                )

                // Create a value input html element
                element = this.drawInput(this.values[i - 1], i - 1, elementPosition)
            } 

            // Add the value text or input to the list of html elements
            this.htmlElements.push(element)

            // Draw the line to connec this point to its parent
            this.drawLine(parent, child)
        }

        // Rerender the mathjax on the page
        MathJax.typeset()
    }

    getPositions(parentIndex, childIndex) {
        // Get the position of the parent point on the tree
        const parent = this.positions[parentIndex][0].copy()
        parent.x += this.textBoxWidth / 2

        // Get the position of the current point on the tree
        const child = this.positions[childIndex][0].copy()
        child.x -= this.textBoxWidth / 2

        return [parent, child]
    }

    drawValue(value, position) {
        // Create the html element for the value
        // Note: the `html` below tells mathjax to render this element as math
        const html = `\\(${value.data}\\)`
        const element = this.p.createP(html)

        element.class("value")
        element.position(position.x, position.y)

        return element
    }

    drawInput(value, index, position) {
        const element = this.p.createInput(value.data)

        element.class("value-input")
        element.position(position.x, position.y)

        // Connect this input to the answers hidden input
        const answerContainer = this.createAnswerContainer(value.data, index)

        // Set the value of this input to the value of the previous input for this position,
        // if one exists
        element.value(answerContainer.getValue())

        // Update the answer hidden input when the user types something in
        element.elt.addEventListener("input", (e) => {
            // Only include letters, numbers, and .'s from whatever is entered
            const regex = /[a-zA-Z0-9.]+/g
            const matched = e.target.value.match(regex)
            const value = matched != null ? matched.join() : ""

            // Update the value of input to only include valid characters
            element.value(value)

            answerContainer.setValue(value)
        })

        // Prevent form submission when the user presses enter
        element.elt.addEventListener("keydown", (e) => {
            if(e.key == "Enter") e.preventDefault()
        })

        return element
    }

    drawLabel(label, position) {
        // Style the label
        this.p.fill(treeDiagramThemeColors.textColor)
        this.p.noStroke()
        this.p.textAlign(this.p.CENTER, this.p.CENTER)
        this.p.rectMode(this.p.CENTER)
        this.p.textSize(this.fontSize)

        // Draw a text box (for text wrapping) if the label is too wide
        if(this.p.textWidth(label) > this.textBoxWidth) {
            this.p.text(label, position.x + this.textBoxWidth / 2, position.y, this.textBoxWidth, this.textBoxHeight)
        
            return
        }

        // Draw the label
        this.p.text(label, position.x + this.textBoxWidth / 2, position.y)
    }

    drawLine(parentPosition, childPosition) {
        // Style the line
        this.p.stroke(treeDiagramThemeColors.lineColor)
        this.p.strokeWeight(this.lineThickness)

        this.p.line(childPosition.x, childPosition.y, parentPosition.x, parentPosition.y)
    }

    resize() {
        this.calculateDimensions()

        // Run the draw function again
        this.p.redraw()
    }
}