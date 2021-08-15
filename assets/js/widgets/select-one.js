// A global variable which stores all the colors used in this theme
let selectOneThemeColors

const runSelectOneWidget = ({container, numbers, options}) => {
    const getThemeColors = (theme) => {
        // Edit these colors to change the 
        // colors that are dependent on the theme

        const themes = {
            "light": {
                numberColors: {normal: "#f28a8a", hoverAndClick: "#f28a8a"},
                optionColors: {normal: "#FFF", hoverAndClick: "#efb1b1"},
                spotColors: [175, 175],
                backgroundColor: "#f5f7fa",
                textColor: "#000",
                borderColor: "#000"
            },
            "dark": {
                numberColors: {normal: "#f28a8a", hoverAndClick: "#f28a8a"},
                optionColors: {normal: "#000", hoverAndClick: "#efb1b1"},
                spotColors: [75, 75],
                backgroundColor: "#1D2126",
                textColor: "#fff",
                borderColor: "#fff"
            }
        }

        return themes[theme]
    }

    const defaultTheme = "light"

    const setThemeColors = (theme) => {
        selectOneThemeColors = getThemeColors(theme)
    }

    setThemeColors(defaultTheme)

    // Change the theme colors when the document theme is changed
    document.addEventListener("themeset", (event) => {
        setThemeColors(event.detail.newTheme)
    })

    const node = document.getElementById(container)

    const answerHiddenInput = document.createElement("input")

    // Configure the hidden input
    answerHiddenInput.type = "hidden"
    answerHiddenInput.name = "answers[]"

    // Insert the hidden input into the html
    node.append(answerHiddenInput)

    const heightToWidthRatio = 7/8

    const getHeightOfCanvas = () => {
        const windowHeight = window.innerHeight|| document.documentElement.clientHeight|| 
document.body.clientHeight
        const maxHeight = windowHeight * (5.5/10)

        let height = node.clientWidth * heightToWidthRatio

        if(height > maxHeight) {
            height = maxHeight
        } 

        return height
    }
    
    let dims = {
        w: node.clientWidth, 
        h: getHeightOfCanvas()
    }

    answerHiddenInput.value = ""

    const updateHiddenInputs = (output) => {
        answerHiddenInput.value = encodeURIComponent(JSON.stringify([output]))
    }

    let selectOne
        
    // Define the p5 sketch methods
    const sketch = p => {
        p.setup = () => {
            p.createCanvas(dims.w, dims.h)

            selectOne = new SelectOne(numbers, options, p, updateHiddenInputs)          
        }

        p.draw = () => {
            p.background(selectOneThemeColors.backgroundColor)

            if(p.mouseIsPressed) selectOne.pressed()
            if(!p.mouseIsPressed) selectOne.released()

            selectOne.draw()
        }

        p.windowResized = () => {
            p.resizeCanvas(0, 0)

            dims = {
                w: node.clientWidth, 
                h: getHeightOfCanvas()
            }

            p.resizeCanvas(dims.w, dims.h)

            // Resize widgets
            selectOne.resize()
        }

        p.touchMoved = (e) => {
            if(!e.cancelable) return

            if(selectOne.otherCardIsBeingDragged()) return false
        }
    }

    // Create the canvas and run the sketch in the html node.
    new p5(sketch, node)
}

class SelectOne {
    constructor(array, options, p, updateHiddenInputs) {
        this.p = p // Reference to p5 sketch

        this.updateHiddenInputs = updateHiddenInputs
        
        this.array = array // Numbers passed from the server
        this.options = options // Options passed from the server
      
        this.optionsLength = 3
        this.arrayLength = 2

        if(array.length != this.arrayLength) throw "Error: There are not 2 numbers being passed in"
        if(options.length != this.optionsLength) throw "Error: There are not 3 options being passed in"

        this.output = null
        
        this.cards = []
        this.spots = []
        
        // Responsively calculate the dimensions of the cards
        this.cardDims = {
            width: this.p.height * 0.225,
            height: this.p.height * 0.35,
            radius: 0.15 * (this.p.height * 0.2),
            gap: this.p.height * 0.075
        }
        
        this.cardStart = this.p.createVector(
            this.p.width / 2 - (options.length * this.cardDims.width + (options.length - 1) * this.cardDims.gap) / 2,
            this.p.height / 2 - this.cardDims.gap / 2 - this.cardDims.height
        )
        
        // Create all the spots on the screen row by row
        for(let j = 0; j < 2; j++) {
            for(let i = 0; i < options.length; i++) {
                this.spots.push(this.makeSpot(i, j))
            }
        }

        // Create all of the cards representing the options
        for(let i = 0; i < options.length; i++) {
            this.cards.push(this.makeCard({i, colors: "optionColors"}))
        }
        
        // Create all of the cards representing the numbers
        this.cards.push(this.makeCard({i: 0, j: 1, source: this.array, colors: "numberColors", draggable: false}))
        this.cards.push(this.makeCard({i: 2, dataI: 1, j: 1, source: this.array, colors: "numberColors", draggable: false}))
    }

    updateOutput() {
        // The second to last spot is the empty one between the numbers
        const outputSpot = this.spots.length - 2

        // Set the output to be the value of the card in the output spot, or null if it's empty
        this.output = this.spots[outputSpot].card != null ? this.spots[outputSpot].card.n : null
    }

    makeCard({i, dataI, j = 0, source = this.options, colors = {normal: "#FFF", hoverAndClick: "#CCC"}, draggable = true}) {
        return new Card(
            this.cardStart.x + (this.cardDims.gap + this.cardDims.width) * i, // Card x position
            this.cardStart.y  + (this.cardDims.height + this.cardDims.gap) * j,// Card y position
            this.cardDims.width,                                              // Card width
            this.cardDims.height,                                             // Card height
            this.cardDims.radius,                                             // Card corner radius
            source[dataI != null && dataI != undefined ? dataI : i],          // Card number
            this.spots[i + this.spots.length/2 * j],                          // The starting spot of this card
            this.spots,                                                       // All of the spots on the screen
            () => this.otherCardIsBeingDragged(),                             // Checks if another cards is being dragged
            this.p,                                                            // Reference to the p5 sketch
            colors,                                                            // The color pallete for this card
            draggable                                                          // Whether or not this card is draggable
        )
    }

    makeSpot(i, j) {
        return new Spot(
            this.cardStart.x + (this.cardDims.gap + this.cardDims.width) * i, // Spot x position
            this.cardStart.y + (this.cardDims.height + this.cardDims.gap) * j,// Spot y position
            this.cardDims.width,                                              // Spot width
            this.cardDims.height,                                             // Spot height
            this.cardDims.radius,                                             // Card corner radius
            this.p,                                                           // Reference to the p5 sketch
            selectOneThemeColors.spotColors[j]
        )
    }

    getSmallestTextPosition() {
        return this.p.createVector(
            this.cardStart.x + this.cardDims.width / 40,
            this.cardStart.y + this.cardDims.height * 2 + this.cardDims.gap * 1.75
        )
    }

    getLargestTextPosition() {
        return this.p.createVector(
            this.cardStart.x + this.cardDims.width / 11 + (this.cardDims.gap + this.cardDims.width) * (this.array.length - 1),
            this.cardStart.y + this.cardDims.height * 2 + this.cardDims.gap * 1.75
        )
    }

    resize() {
        // Responsively calculate the dimensions of the cards
        this.cardDims = {
            width: this.p.height * 0.225,
            height: this.p.height * 0.35,
            radius: 0.15 * (this.p.height * 0.2),
            gap: this.p.height * 0.075
        }

        this.cardStart = this.p.createVector(
            this.p.width / 2 - (this.options.length * this.cardDims.width + (this.options.length - 1) * this.cardDims.gap) / 2,
            this.p.height / 2 - this.cardDims.gap / 2 - this.cardDims.height
        )

        for(let j = 0; j < 2; j++) {
            for(let i = 0; i < this.options.length; i++) {
                this.spots[i + (this.options.length)*j].resize(
                    this.cardStart.x + (this.cardDims.gap + this.cardDims.width) * i, // Spot x position
                    this.cardStart.y + (this.cardDims.height + this.cardDims.gap) * j,// Spot y position
                    this.cardDims.width,
                    this.cardDims.height,
                    this.cardDims.radius
                )
            }
        }

        this.cards.forEach((card, i) => {
            card.resize(
                card.spot.x, 
                card.spot.y,
                this.cardDims.width,
                this.cardDims.height,
                this.cardDims.radius
            )
        })
    }

    draw() {
        this.p.cursor("default")

        this.spots.forEach(spot => spot.over())
        this.spots.forEach(spot => spot.show())
        
        this.cards.forEach(card => card.over())
        this.cards.forEach(card => card.update())
        this.cards.forEach(card => card.show())

        const draggedCards = this.cards.filter(card => card.dragging)

        // Show the card being dragged on top of everthing else
        if(draggedCards.length > 0) draggedCards[0].show()

        this.updateOutput()
        this.updateHiddenInputs(this.output)
    }

    pressed() {
        this.cards.forEach(card => card.pressed())
    }

    released() {
        this.cards.forEach(card => card.released())
    }

    otherCardIsBeingDragged() {
      // Return whether or not a card is actively being dragged
        return this.cards.filter(card => card.dragging).length > 0
    }
}

class Card {
    constructor(x, y, w, h, r, n, spot, spots, otherCardIsBeingDragged, p, colors, draggable) {
        this.p = p // Reference to the p5 sketch
      
        this.draggable = draggable

        this.dragging = false
        this.mouseOver = false

        this.otherCardIsBeingDragged = otherCardIsBeingDragged
        
        this.originalSpot = spot
      
        this.setSpot(spot)
        
        this.spots = spots
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.r = r
        this.n = n
        this.xChange = 0
        this.yChange = 0
      
        this.colors = colors

        // The coordinates of the corners of this card
        this.corners = [
            this.p.createVector(this.x, this.y),                                        // Top left
            this.p.createVector(this.x + this.w - this.r, this.y),                      // Top right
            this.p.createVector(this.x, this.y + this.h - this.r),                      // Bottom left
            this.p.createVector(this.x + this.w - this.r, this.y + this.h - this.r),    // Bottom right
        ]

        // The interior points of the corners of this card
        this.cornerCenters = [
            this.p.createVector(this.x + this.r, this.y + this.r),                      // Top left
            this.p.createVector(this.x + this.w - this.r, this.y + this.r),             // Top right
            this.p.createVector(this.x + this.r, this.y + this.h - this.r),             // Bottom left
            this.p.createVector(this.x + this.w - this.r, this.y + this.h - this.r),    // Bottom right
        ]
    }

    over() {
        if (this.checkEdges({left: this.x, right: this.x + this.w, top: this.y, bottom: this.y + this.h}) && 
            this.checkCorners() && 
            !this.otherCardIsBeingDragged() && this.draggable) {

            this.mouseOver = true
        } else {
            this.mouseOver = false
        }
    }

    checkEdges({left, right, top, bottom}) { // Left edge, etc.
        // Return if the mouse in within the edges of the card
        return this.p.mouseX > left && this.p.mouseX < right && this.p.mouseY > top && this.p.mouseY < bottom
    }

    checkCorners() {
        const mousePos = this.p.createVector(this.p.mouseX, this.p.mouseY)

        // Check each corner to see if the mouse is outside of the card
        for(const [i, corner] of this.corners.entries()) {
            // Check if the mouse is in this corner
            if(this.checkEdges({left: corner.x, right: corner.x + this.r, top: corner.y, bottom: corner.y + this.r})) {
                // Return false if the mouse is not within the corner
                if(this.cornerCenters[i].dist(mousePos) > this.r) return false
            }
        }

        return true
    }

    update() {
        if (this.dragging) {
            this.p.cursor("grab")
            this.x = this.p.mouseX + this.xChange
            this.y = this.p.mouseY + this.yChange
        }
    }

    show() {
        this.p.stroke(selectOneThemeColors.borderColor)
      
        // Depending on the state of the card, fill it with the correct color
        if (this.dragging) {
            this.p.fill(selectOneThemeColors[this.colors].hoverAndClick)
        } else if (this.mouseOver) {
            this.p.fill(selectOneThemeColors[this.colors].hoverAndClick)
        } else {
            this.p.fill(selectOneThemeColors[this.colors].normal)
        }
      
        this.p.rect(this.x, this.y, this.w, this.h, this.r)

        // Draw this card's number
        showNumber({n: this.n, 
                    x: this.x + this.w/2, 
                    y: this.y + this.h/2, 
                    w: this.w,
                    h: this.h,
                    p: this.p, 
                    fontSize: this.h/3})
    }

    pressed() {      
        if (this.checkEdges({left: this.x, right: this.x + this.w, top: this.y, bottom: this.y + this.h}) && 
            this.checkCorners() && 
            !this.otherCardIsBeingDragged() && this.draggable) {
          
            this.dragging = true
          
            // Keep track of the displacement from the mouse to this card
            this.xChange = this.x - this.p.mouseX
            this.yChange = this.y - this.p.mouseY
        }
    }

    setSpot(spot) {
        // Remove this card from its current spot
        if(this.spot != undefined) this.spot.card = null
        
        // Remember the new spot that this card is now at
        this.spot = spot
      
        // Tell the new spot that this card is now there
        this.spot.card = this
    }

    released() {  
        const clickThresholdDistance = 10
      
        if(this.dragging) {
            // Find if this card is on a new spot
            const nextSpot = this.spots.filter(spot => spot.mouseOver && spot.card == null)
            
            // Return to the original spot if this card was clicked
            if(this.p.abs(this.spot.x - this.x) < clickThresholdDistance && 
               this.p.abs(this.spot.y - this.y) < clickThresholdDistance)  {
                this.setSpot(this.originalSpot)
            }
          
            // Drop this card into its new spot if it is on a new spot
            if(nextSpot.length > 0) this.setSpot(nextSpot[0])
          
            // Move this card to its spot
            this.x = this.spot.x
            this.y = this.spot.y
        }
        
        this.dragging = false
    }

    resize(x, y, w, h, r) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.r = r
    }
}


const showNumber = ({n, x, y, w, h, p, fontSize}) => {
    // Determine which type of number is being passed in
    const testNumberCase = (n) => {
        if(n.includes("\\times")) return "standard"
        if(n.includes("^")) return "exponent"
        if(n.includes("\\frac")) return "fraction"
        if(n.includes(".")) return "decimal"
        
        return "integer"
    }

    // Find the largest font size that will fit the given text into the given width
    const setRightFontSize = (num, maxw) => {
        let size = fontSize

        p.textSize(size)

        // Decrement the font size until it fits in the width
        while(p.textWidth(num) >= maxw) p.textSize(size--)
      
        return size
    }

    const numberCase = testNumberCase(n)

    const maxWidthOfText = w * 0.8

    switch(numberCase) {
        case "integer": {
            p.noStroke()
            p.fill(selectOneThemeColors.textColor)
            p.textAlign(p.CENTER, p.CENTER)
            p.textStyle(p.NORMAL)
            
            // Scale the number until it fits into the card
            setRightFontSize(n, maxWidthOfText)
            
            p.text(n, x, y)
            break
        }
        case "decimal": {
            p.noStroke()
            p.fill(selectOneThemeColors.textColor)
            p.textAlign(p.CENTER, p.CENTER)
            p.textStyle(p.NORMAL)

            const numString = parseFloat(n)
            
            // Scale the number until it fits into the card
            setRightFontSize(numString, maxWidthOfText)

            p.text(numString, x, y)
            break
        }
        case "fraction": {
            const maxWidthOfText = w * 0.5

            // Draw the line between numbers
            p.stroke(selectOneThemeColors.textColor)
            p.line(x - maxWidthOfText/2, y, x + maxWidthOfText/2, y)

            p.noStroke()
            p.fill(selectOneThemeColors.textColor)
            p.textStyle(p.NORMAL)

            // Separate the fraction into a list of two numbers [numerator, denominator]
            // const numbers = n.split("/")
            const numbers = n.slice(6, n.length - 1).split("}{")

            // Draw the top number (numerator)
            p.textAlign(p.CENTER, p.BASELINE)
          
            // Scale down the numerator until it fits within the top area of the fraction
            const topFontSize = p.min(setRightFontSize(numbers[0], maxWidthOfText), fontSize * 2/3)
            
            p.textSize(topFontSize)
          
            p.text(numbers[0], x, y - p.textSize()/3)
          
            // Draw the bottom number (denominator)
            p.textAlign(p.CENTER, p.TOP)
          
            // Scale down the denominator until it fits within the top area of the fraction
            const bottomFontSize = p.min(setRightFontSize(numbers[1], maxWidthOfText), fontSize * 2/3)
            
            p.textSize(bottomFontSize)
          
            p.text(numbers[1], x, y + p.textSize()/3)
            break
        }
        case "standard": {
            const maxWidthOfText = w * 0.7
            
            // Separate the standard form number into its first and second numbers
            const numbers = n.split('\\times10^')
            numbers[1] = numbers[1].replace("{", "")
            numbers[1] = numbers[1].replace("}", "")

            p.noStroke()
            p.fill(selectOneThemeColors.textColor)
            p.textAlign(p.LEFT, p.CENTER)
            p.textStyle(p.NORMAL)

            const mainExpression = `${numbers[0]}x10`

            // Scale down the main expression text to fit into the card
            const mainExpressionFontSize =setRightFontSize(`${mainExpression}`, maxWidthOfText)
            
            const exponentFontSize = mainExpressionFontSize / 2
            
            p.textSize(exponentFontSize)
          
            const exponentWidth = p.textWidth(`${numbers[1]}`)
            
            p.textSize(mainExpressionFontSize)

            const mainExpressionWidth = p.textWidth(mainExpression)
            
            const totalWidth = mainExpressionWidth + exponentWidth

            const ascentScalar = 0.8
            
            // Find the top of the main expression
            const ascent = p.textAscent() * ascentScalar
            
            const leftStart = x - (totalWidth/2)

            // Draw the main expression (e.g. 5.2x10)
            p.text(mainExpression, leftStart, y)

            p.textAlign(p.LEFT, p.BOTTOM)
            p.textSize(p.textSize()/2)
          
            // Draw the exponent
            p.text(numbers[1], leftStart + mainExpressionWidth, y - ascent/2)
            break
        }
        case "exponent": {
            // Split the number into base and exponent [base, exponent]
            const numbers = n.split('^')
            
            // Remove brackets if there are any
            numbers[1] = numbers[1].replace("{", "")
            numbers[1] = numbers[1].replace("}", "")

            p.noStroke()
            p.fill(selectOneThemeColors.textColor)
            p.textAlign(p.CENTER, p.CENTER)
            p.textStyle(p.NORMAL)

            // Scale down the base number to fit within the card
            const mainNumberFontSize = setRightFontSize(`${numbers[0]}`, maxWidthOfText)
            
            const exponentFontSize = mainNumberFontSize / 2

            p.textSize(exponentFontSize)
          
            const exponentWidth = p.textWidth(`${numbers[1]}`)
            
            p.textSize(mainNumberFontSize)

            const mainNumberWidth = p.textWidth(numbers[0])
            
            const totalWidth = mainNumberWidth + exponentWidth

            const ascentScalar = 0.8
            
            // Find the top of the base number
            const ascent = p.textAscent() * ascentScalar
                      
            const leftStart = x - (totalWidth/2)
            const bottomStart = y
            
            p.textAlign(p.LEFT, p.CENTER)
            
            // Draw the base
            p.text(numbers[0], leftStart, bottomStart)

            p.textAlign(p.LEFT, p.BASELINE)

            p.textSize(exponentFontSize)
          
            // Draw the exponent
            p.text(numbers[1], leftStart + mainNumberWidth, bottomStart - ascent/2)
            break
        }
    }
}

class Spot {
    constructor(x, y, w, h, r, p, color) {
        this.p = p // Reference to the p5 sketch

        this.mouseOver = false
        this.x = x 
        this.y = y
        this.w = w // Width
        this.h = h // Height
        this.r = r // Radius of the corners
        this.card = null // A reference to the card within this spot

        // The coordinates of the corners of this spot
        this.corners = [
            this.p.createVector(this.x, this.y),                                        // Top left
            this.p.createVector(this.x + this.w - this.r, this.y),                      // Top right
            this.p.createVector(this.x, this.y + this.h - this.r),                      // Bottom left
            this.p.createVector(this.x + this.w - this.r, this.y + this.h - this.r),    // Bottom right
        ]

        // The interior points of the corners of this spot
        this.cornerCenters = [
            this.p.createVector(this.x + this.r, this.y + this.r),                      // Top left
            this.p.createVector(this.x + this.w - this.r, this.y + this.r),             // Top right
            this.p.createVector(this.x + this.r, this.y + this.h - this.r),             // Bottom left
            this.p.createVector(this.x + this.w - this.r, this.y + this.h - this.r),    // Bottom right
        ]
      
        this.backgroundColor = color
    }

    show() {
        this.p.fill(this.backgroundColor)
        // Draw a rounded rectangle
        this.p.rect(this.x, this.y, this.w, this.h, this.r)
    }

    over() {
        // Check if the mouse is within the edges of the rectangle,
        // and if so, check to make sure it isn't on the outside of one of the rounded corners
        if (this.checkEdges({left: this.x, right: this.x + this.w, top: this.y, bottom: this.y + this.h}) && this.checkCorners()) {
          
            this.mouseOver = true
          
            // Set the cursor to pointer if this spot has a card in it
            if(this.card != null && this.card.draggable) this.p.cursor("pointer")
          
            return
        }
        
        this.mouseOver = false
    }

    checkEdges({left, right, top, bottom}) { // Left edge, etc.
        // Return if the mouse in within the edges of the spot
        return this.p.mouseX > left && this.p.mouseX < right && this.p.mouseY > top && this.p.mouseY < bottom
    }

    checkCorners() {
        const mousePos = this.p.createVector(this.p.mouseX, this.p.mouseY)

        // Check each corner to see if the mouse is outside of the spot
        for(const [i, corner] of this.corners.entries()) {
            // Check if the mouse is in this corner
            if(this.checkEdges({left: corner.x, right: corner.x + this.r, top: corner.y, bottom: corner.y + this.r})) {
                // Return false if the mouse is not within the corner
                if(this.cornerCenters[i].dist(mousePos) > this.r) return false
            }
        }

        return true
    }

    resize(x, y, w, h, r) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.r = r
    }
}