// A global variable which stores all the colors used in this theme
let numberMachineThemeColors

const runNumberMachineWidget = ({container, labels, arrowDirection}) => {
    const getThemeColors = (theme) => {
        // Edit these colors to change the 
        // colors that are dependent on the theme
        const themes = {
            "light": {
                backgroundColor: "#f5f7fa",
                labelColor: "#000000",
                boxBorderColor: "#ed0b4c",
                boxInnerColor: "#FFFFFF",
                arrowColor: "#ed0b4c"
            },
            "dark": {
                backgroundColor: "#1D2126",
                labelColor: "#FFFFFF",
                boxBorderColor: "#ed0b4c",
                boxInnerColor: "#3d3d3d",
                arrowColor: "#ed0b4c"
            }
        }
    
        return themes[theme]
    }
    
    const defaultTheme = "light"
    
    const setThemeColors = (theme) => {
        numberMachineThemeColors = getThemeColors(theme)
    }
    
    setThemeColors(defaultTheme)
    
    // Change the theme colors when the document theme is changed
    document.addEventListener("themeset", (event) => {
        setThemeColors(event.detail.newTheme)
    })

    const node = document.getElementById(container)
    const heightToWidthRatio = 2.5/8

    const getWidthOfCanvas = () => {
        const maxWidth = 800

        let width = node.clientWidth

        if(width > maxWidth) {
            width = maxWidth
        } 

        return width
    }

    let width = getWidthOfCanvas()

    let dims = {
        w: node.clientWidth,
        h: width * heightToWidthRatio
    }

    let numberMachine

    // Define the p5 sketch methods
    const sketch = p => {
        p.setup = () => {
            p.createCanvas(dims.w, dims.h)

            numberMachine = new NumberMachine(labels, p, width, arrowDirection)
        }

        p.draw = () => {
            p.background(numberMachineThemeColors.backgroundColor)

            // Center the widget
            const leftOffset = (p.width - width) / 2
            p.translate(leftOffset, 0)

            numberMachine.draw()
        }

        p.windowResized = () => {
            p.resizeCanvas(0, 0)

            width = getWidthOfCanvas()

            dims = {
                w: node.clientWidth,
                h: width * heightToWidthRatio
            }

            p.resizeCanvas(dims.w, dims.h)

            // Resize widgets
            numberMachine.resize(width)
        }
    }

    // Create the canvas and run the sketch in the html node.
    new p5(sketch, node)
}

class NumberMachine {
    constructor(labels, p, width, arrowDirection) {
        this.p = p // Reference to p5 sketch
        
        this.labels = labels // Labels passed from the server

        this.arrowDirection = arrowDirection

        if(labels.length != 4) throw "Error: There are not four labels. This widget requires exactly four labels."
        
        // A list that stores which labels have boxes around them
        this.hasBox = [false, true, true, false]

        // Define where the the input and output text will go
        switch(this.arrowDirection) {
            case "right": {
                this.inputTextIndex = 0
                this.outputTextIndex = this.labels.length - 1
                break
            }
            case "left": {
                this.inputTextIndex = this.labels.length - 1
                this.outputTextIndex = 0
                break
            }
        }
        

        // Responsively calculate the positions dimensions of the labels and boxes
        this.calculateDimensions(width)
    }

    calculateDimensions(width) {
        // Calculate the positions of the labels on the canvas
        this.labelPositions = this.labels.map((_, i) => {
            return this.p.createVector(
                (4.5 * i + 1)/(4 * this.labels.length) * width, 
                this.p.height / 2
            )
        })
    
        this.arrowWidth = this.p.height / 14

        // Default font size
        this.fontSize = 16

        // Use breakpoints to determine the correct font size
        if(this.p.width >= 700) this.fontSize = 20

        this.labelBoxWidth = width / 6
        this.labelBoxHeight = this.p.min(this.p.height / 2, this.fontSize * 5)
    }

    resize(width) {
        this.calculateDimensions(width)
    }

    draw() {
        // Draw boxes and labels
        this.labels.forEach((label, i) => {
            // Draw a box if this label has a box
            if(this.hasBox[i]) this.drawBox(i)

            this.drawLabel(label, i)

            // Draw the input and output text
            if(i == this.inputTextIndex) this.drawLabelText("Input", i)
            if(i == this.outputTextIndex) this.drawLabelText("Output", i)

            // Draw the arrow unless this is the last label
            if(i >= this.labels.length - 1) return

            const leftEdge = this.calculateEdgesForIndex(i).right
            const rightEdge = this.calculateEdgesForIndex(i + 1).left

            this.drawArrow(leftEdge, rightEdge)
        })
    }

    drawBox(index) {
        // Style the box
        this.p.fill(numberMachineThemeColors.boxInnerColor)
        this.p.stroke(numberMachineThemeColors.boxBorderColor)
        this.p.strokeWeight(1)
        this.p.rectMode(this.p.CENTER)

        const position = this.labelPositions[index]

        this.p.rect(position.x, position.y, this.labelBoxWidth, this.labelBoxHeight)
    }

    drawLabel(label, index) {
        // Style the label
        this.p.fill(numberMachineThemeColors.labelColor)
        this.p.noStroke()
        this.p.rectMode(this.p.CENTER)
        this.p.textAlign(this.p.CENTER, this.p.CENTER)
        this.p.textSize(this.fontSize)
        this.p.textStyle(this.p.NORMAL)

        const position = this.labelPositions[index]

        // Wrap the text if it is too wide
        if(this.p.textWidth(label) >= this.labelBoxWidth * 0.8) {
            this.p.text(label, position.x, position.y, this.labelBoxWidth * 0.8, this.labelBoxHeight)

            return
        }

        this.p.text(label, position.x, position.y)
    }

    /**
     * @param {Number} index An index of `this.labels` or `this.labelPositions` 
     * @returns {Object} An object containing the x positions of the left and right edges
     */
    calculateEdgesForIndex(index) {
        // Create a consistent gap around text and boxes
        const gap = ((this.labelBoxWidth * 1.2) - this.labelBoxWidth) / 2

        const position = this.labelPositions[index]

        let edges

        if(this.hasBox[index]) {
            // Only one half of the width is needed to calculate the edges for each side, so divide by 2
            const width = this.labelBoxWidth / 2

            // Store the left and right edges of the box, plus a gap on each side
            edges = {
                left: position.x - width - gap,
                right: position.x + width + gap
            }
        } else {
            this.p.textSize(this.fontSize)
            
            // Calculate the width of the label
            let width = this.p.textWidth(this.labels[index])

            // Account for text wrapping
            if(width >= this.labelBoxWidth * 0.8) width = this.labelBoxWidth * 0.8

            // Only one half of the width is needed to calculate the edges for each side, so divide by 2
            width /= 2

            // Store the left and right edges of the text, plus a gap on each side
            edges = {
                left: position.x - width - gap,
                right: position.x + width + gap
            }
        }

        return edges
    }

    /**
     * @param {Number} leftEdge The x value of the left edge this arrow connects to
     * @param {Number} rightEdge The x value of the right edge this arrow connects to
     */
    drawArrow(leftEdge, rightEdge) {
        this.p.fill(numberMachineThemeColors.arrowColor)
        this.p.stroke(numberMachineThemeColors.arrowColor)
        this.p.strokeWeight(2)

        const verticalCenter = this.p.height / 2

        const { line, triangle } = this.getArrowPositions(leftEdge, rightEdge)

        this.p.line(line[0], verticalCenter, line[1], verticalCenter)

        this.p.noStroke()

        
        this.p.triangle(triangle[0], verticalCenter, 
                        triangle[1], verticalCenter - this.arrowWidth / 2,
                        triangle[2], verticalCenter + this.arrowWidth / 2)
    }

    getArrowPositions(leftEdge, rightEdge) {
        const lineOffset = 2 // Shortens the line so it is not visible at the end of the triangle

        switch(this.arrowDirection) {
            case "right": {
                return {
                    line: [
                        leftEdge,
                        rightEdge - lineOffset
                    ],
                    triangle: [
                        rightEdge,
                        rightEdge - this.arrowWidth,
                        rightEdge - this.arrowWidth
                    ]
                }
            }
            case "left": {
                return {
                    line: [
                        rightEdge,
                        leftEdge + lineOffset
                    ],
                    triangle: [
                        leftEdge,
                        leftEdge + this.arrowWidth,
                        leftEdge + this.arrowWidth
                    ]
                }
            }
            default: {
                throw "Error: Invalid arrow direction (the options are 'left' or 'right')"
            }
        }
    }

    drawLabelText(text, index) {
        this.p.fill(numberMachineThemeColors.labelColor)
        this.p.textStyle(this.p.BOLD)
        this.p.noStroke()
        this.p.textAlign(this.p.CENTER, this.p.BASELINE)

        const position = this.labelPositions[index]

        this.p.text(text, position.x, position.y - this.labelBoxHeight / 2)
    }
}