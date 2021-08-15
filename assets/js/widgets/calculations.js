const runCalculationsWidget = ({container, nb1, nb2, operation}) => {
    const node = document.getElementById(container)

    ///////// PARAMETERS /////////

    const SHOW_GRID = true
    const BOLD_GRID_BORDER = false
    const SHOW_EXPONENTS = true
    const MAX_DECIMAL_PART_LENGTH = 5

    //////////////////////////////

    // A global variable which stores all the colors used in this theme
    let themeColors

    const getThemeColors = (theme) => {
        // Edit these colors to change the 
        // colors that are dependent on the theme

        const themes = {
            "light": {
                backgroundColor: "#ffffff",
                dividerColor: "#000000",
                textColor: "#000000",
                symbolColor: "#35b726",
                gridColor: "#000000",
                arrowFocusColor: "#000000",
                arrowUnfocusColor: "#8C8C8C",
                commaColor: "#000000"
            },
            "dark": {
                backgroundColor: "#000000",
                dividerColor: "#ffffff",
                textColor: "#ffffff",
                symbolColor: "#35b726",
                gridColor: "#ffffff",
                arrowFocusColor: "#ffffff",
                arrowUnfocusColor: "#8C8C8C",
                commaColor: "#ffffff"
            }
        }

        return themes[theme]
    }

    const defaultTheme = "light"

    const setThemeColors = (theme) => {
        themeColors = getThemeColors(theme)
    }

    setThemeColors(defaultTheme)

    // Change the theme colors when the document theme is changed
    document.addEventListener("themeset", (event) => {
        setThemeColors(event.detail.newTheme)
    })

    // Define the p5 sketch methods
    const sketch = p => {
        let grid = []
        const grid_size = 0.7
        const default_grid_width = 100 * grid_size
        const default_grid_height = 130  * grid_size
        const arrow_size = 20
        let text_ratio = 1
        let minified = false
        let result
        let grid_rows, grid_cols
        let grid_width, grid_height
        
        // Define a grid cell
        // Contains a value, an exponent, a "last exponent" variable
        // and an array of linked cells
        class Cell {
            constructor(value = '', last_exponent = '', exponent = '', linked = []) {
                // Special character handling
                this.value = ['', '+', 'x', '-', '﹣', '/', '=', '•'].includes(value) ? value : Number(value)
                if (Number.isNaN(this.value)) {
                    this.value = ''
                }
                this.last_exponent = last_exponent
                this.exponent = exponent
                this.linked = linked
            }

            // Is the cell in the animation sequence ?
            inSequence() {
                return sequence.indexOf(this)
            }

            // Is the cell linked with the cell in parameters ?
            linkedWith(cell) {
                if (cell && cell.linked) {
                    return cell.linked.indexOf(this) !== -1
                } else if (this.linked) {
                    return this.linked.indexOf(cell) !== -1 
                } else {
                    return false
                }
            }
        }

        // Define the grid containing all the cells
        class Figure {
            constructor(x, y, w, h) {
                this.init(x, y, w, h)
            }

            // Initialize helper coordinates
            init(x, y, w, h) {
                this.x = x
                this.y = y
                this.x1 = x - w/2
                this.x2 = x + w/2
                this.y1 = y - h/2
                this.y2 = y + h/2
                this.width = w
                this.height = h
            }

            // Draw the grid
            draw() {
                p.push()

                /// Draw the grid border ///
                p.stroke(0)
                if (BOLD_GRID_BORDER) p.strokeWeight(4)
                p.fill(themeColors.backgroundColor)
                p.rect(this.x, this.y, this.width, this.height)

                p.strokeWeight(1)
                p.noStroke()

                // Drawing of each individual grid cell
                for (let j = 0; j < grid_rows; j++) {
                    for (let i = 0; i < grid_cols; i++) {
                        const x = this.x1 + grid_width * (i+0.5)
                        const y = this.y1 + grid_height * (j+0.5)
                        let cell = grid[i][j]
                        let cellPosInSequence = cell.inSequence()

                        /// Draw the rectangle ///
                        p.noFill()
                        p.strokeWeight(1)
                        if (SHOW_GRID) p.stroke(themeColors.gridColor)
                        p.rect(x, y, grid_width, grid_height)

                        // If the cell is in the animated sequence and its index is
                        // greater than the current animation, don't draw it
                        if (cellPosInSequence !== -1 && cellPosInSequence > animation && animation !== -1) {
                            continue
                        }
                        if (cellPosInSequence !== -1 && animation === -1 && (y >= 2 && operation !== 'division' || y !==1 && operation === 'division')) {
                            continue
                        }

                        const isSymbol = ['+', 'x', '﹣', '/', '='].includes(cell.value) // Is it a special character ?
                        let isFocus
                        p.push()
                            /// Draw the cell's value ///
                            if (isSymbol) {
                                p.strokeWeight(2)
                                p.stroke(themeColors.symbolColor)
                                p.fill(themeColors.symbolColor)
                            } else {
                                p.noStroke()
                                 // Is the character the current focus of the animation ?
                                isFocus = cell.linkedWith(sequence[animation]) || 
                                          cellPosInSequence === animation || 
                                          animation === -1 || 
                                          (animation === sequence.length && (j < 2 || j === grid_rows-1))
                                p.fill(isFocus ? themeColors.arrowFocusColor : themeColors.arrowUnfocusColor)
                            }

                            // Remove leading 0s in final step
                            if (!(animation === sequence.length && operation === 'subtraction' &&
                                j === grid_rows-1 && i < 2 + sub_leading_zero && cell.value == 0) && 
                                !(animation === sequence.length && operation === 'division' &&
                                j === 0 && i < 2 + sub_leading_zero && cell.value == 0 && result >= 1))
                            p.text(cell.value, x, y) 

                            /// Draw the exponents ///
                            p.push()
                            p.textSize(20 * text_ratio)

                            // Remove the multiplication exponents in addition step 
                            // for the multiplication operation
                            if (isFocus && !isSymbol && 
                                cell.linkedWith(sequence[animation]) && 
                                operation === 'multiplication' && 
                                animation > sequence.length - grid_cols - 2 ||
                                animation === sequence.length) {
                                isFocus = false
                            }

                            // Helper method to draw the exponents
                            const drawExponent = (value, x, y) => {
                                const text_w = p.textWidth(value)
                                if (isFocus) {
                                    p.push()
                                    p.stroke(themeColors.backgroundColor)
                                    p.fill(themeColors.backgroundColor)
                                    p.strokeWeight(2)
                                    p.line(x - text_w/2, y + p.textSize()/2 , x + text_w/2, y - p.textSize()/2)
                                    p.pop()
                                }
                                p.text(value, x, y)
                                if (!isFocus) {
                                    p.push()
                                    p.stroke(0)
                                    p.line(x - text_w/2, y + p.textSize()/2 , x + text_w/2, y - p.textSize()/2)
                                    p.pop()
                                }
                            }

                            // Main exponent
                            if (cell.exponent && SHOW_EXPONENTS) {
                                const text_w = p.textWidth(cell.exponent)
                                if (operation === 'division') {
                                    drawExponent(cell.exponent, x + grid_width/2+text_w, this.y1 + grid_height + p.textSize()*3/4)
                                    if (animation < sequence.length) {
                                        p.push()
                                        p.stroke(0)
                                        p.line(x + text_w, this.y2 - grid_height/2 - p.textSize(), x - text_w, this.y2 - grid_height/2 + p.textSize())
                                        p.pop()
                                    }
                                } else if (operation === 'subtraction') {
                                    let v = grid[i-1][0].value-1
                                    let v2 = grid[i][0].value-1
                                    if (v2!==-1||!cell.last_exponent)
                                    drawExponent(cell.exponent, x - grid_width/2 + text_w, this.y1 + p.textSize()*3/4)
                                    p.push()
                                    p.stroke(0)
                                    p.line(x + text_w*1.5 - grid_width, this.y1 + grid_height/2 - p.textSize(), x - text_w*1.5 - grid_width, this.y1 + grid_height/2 + p.textSize())
                                    p.pop()
                                    if (cellPosInSequence >= animation) {
                                        drawExponent(v === - 1 ? 9 : v, x - grid_width - grid_width/2 + text_w*2, this.y1 + p.textSize()*3/4)
                                    }
                                }
                                else if (cellPosInSequence >= animation) {
                                    drawExponent(cell.exponent, x - grid_width, y - grid_height/2 + p.textSize()*3/4)
                                }
                            }
                            // Last exponent
                            if (cell.last_exponent && SHOW_EXPONENTS) {
                                const text_w = p.textWidth(cell.last_exponent)
                                if (operation === 'subtraction') {
                                    let v = grid[i][0].value-1
                                    drawExponent(v === -1 ? 9 : v, x - grid_width/2 + text_w*2, this.y1 + p.textSize()*3/4)
                                }
                                else if (operation !== 'division') drawExponent(cell.last_exponent, x, y - grid_height/2 + p.textSize()*3/4)
                            }
                            p.pop()
                        p.pop()
                    }
                }

                /// Draw the commas ///
                p.push()
                p.fill(themeColors.commaColor)
                p.stroke(themeColors.commaColor)
                p.textSize(60 * text_ratio)
                for (let comma of commas) {
                    const x = this.x1 + grid_width * (comma.x)
                    const y = this.y1 + grid_height * (comma.y+0.5)
                    p.text('.', x, y)
                }
                p.pop()

                /// Draw the separation lines ///
                p.strokeWeight(4)
                p.stroke(themeColors.dividerColor)
                for (let line of lines) {
                    p.line(this.x1 + line.x1 * grid_width, this.y1 + line.y1 * grid_height, 
                           this.x1 + line.x2 * grid_width, this.y1 + line.y2 * grid_height)
                }

                p.pop()
            }

            // Resize the grid
            resize(x, y, w, h) {
                this.init(x, y, w, h)
            }
        }

        let fig = new Figure()
        let lines = []
        let sequence = []
        let commas = []
        let animation = -1

        // Calculate and return the size of the canvas, the size of the grid and cells
        // and if the application is in minified mode
        function getCanvasSize() {
            let w = node.clientWidth

            // If the default grid size is bigger than the canvas size,
            // make the text smaller
            if (w  / grid_cols < default_grid_width) {
                text_ratio = w  / grid_cols / default_grid_width
            } else {
                text_ratio = 1
            }
            p.textSize(40 * text_ratio)

            // Calculate grid cell's dimensions
            grid_width = p.min(w  / grid_cols, default_grid_width)
            grid_height = grid_width*9/7

            // Calculate grid's dimensions
            let fig_width = Math.min(w, grid_width * grid_cols)
            let fig_height = grid_height * grid_rows
            let h = fig_height + 4

            // Update the grid
            fig.resize(w/2, h/2, fig_width, fig_height)

            // If arrows don't fit, set minified mode
            minified = (w - fig.width) / 2 < arrow_size * 2
    
            return {
                width: w,
                height: h + (minified ? arrow_size * 4 : 0)
            }
        }

        // Resize the canvas
        p.windowResized = () => {
            const dims = getCanvasSize()
            p.resizeCanvas(dims.width, dims.height)
        }

        // Get all the digits of a number as a string excluding the decimal character '.'
        const getDigits = (x) => x.toString().replaceAll('.', '')
        // Count the number of digits in a string
        const getDigitCount = (x) => getDigits(x).length

        // Returns the width of the grid in number of cells
        function getLongestRowWidth() {
            // Get the ith digit of a number
            const getDigit = (x, i) => Number(getDigits(x)[i])
            // Count the number of decimals in a number
            const decimalCount = (x) => x.toString().includes('.') ? x.toString().split('.')[1].length : 0

            // Calculate the grid's width according to the operation and the two numbers
            if (operation === 'addition') {
                const highestDecimals = Math.max(decimalCount(nb1), decimalCount(nb2))
                const res_length = p.nf(result, 0, highestDecimals).replaceAll('.','').length
                return p.max(getDigitCount(nb1)+1, res_length+2)
            } else if (operation === 'multiplication') {
                let longest = getDigitCount(nb1)
                const nb2_digit_count = getDigitCount(nb2)
        
                for (let i = 0; i < nb2_digit_count; i++) {
                    let step_mult = getDigit(nb2, nb2_digit_count-i-1) * Number(getDigits(nb1))
                    longest = Math.max(longest, getDigitCount(step_mult)+i+1)
                }
        
                longest = Math.max(longest, getDigitCount(p.nf(result, 0, decimalCount(nb1) + decimalCount(nb2)))+2)

                return longest
            } else if (operation === 'subtraction') {
                return p.max(getDigitCount(nb1), getDigitCount(nb2), getDigitCount(result)) + 2
            } else if (operation === 'division') {
                let nb1_str = nb1.toString().replaceAll('.', '')
                let result_str = result.toString().replaceAll('.','')
                if (Number(nb1_str[0]) < nb2 && result > 1) result_str = '0' + result_str
                let longest_nb = p.max(nb1_str.length, result_str.length)
                while(nb1_str.length < longest_nb) nb1_str += '0'
                while(result_str.length < longest_nb) result_str += '0'
                return p.max(nb1_str.length, result_str.length) + 1
            }
        }

        // Setup the canvas
        p.setup = () => {
            sortNumbers()
            
            // Count the number of decimals in a number
            const decimalCount = (x) => x.toString().includes('.') ? x.toString().split('.')[1].length : 0
            // Fix the javascript precision error (3.5-3.2 = 0.29999999999 instead of 0.3)
            const removePrecisionError = (x) => decimalCount(x) > MAX_DECIMAL_PART_LENGTH ? Number(x.toFixed(MAX_DECIMAL_PART_LENGTH)) : x
            // Get the highest number of digits between nb1 and nb2
            const highestDigits = Math.max(decimalCount(nb1), decimalCount(nb2))

            // Store the result of the operation
            result = {
                'addition': removePrecisionError(nb1 + nb2),
                'subtraction': Number(p.nf(removePrecisionError(nb1 - nb2), 0, highestDigits)),
                'multiplication': removePrecisionError(nb1 * nb2),
                'division': Number(p.nf(removePrecisionError(nb1 / nb2), 0, p.min(getDigitCount(removePrecisionError(nb1/nb2)), MAX_DECIMAL_PART_LENGTH)))
            }[operation]
            // Get the number of rows depending on the operation  (height)
            grid_rows = {
                'addition': 3,
                'subtraction': 3,
                'multiplication': getDigitCount(nb2) + 3 - (getDigitCount(nb2) === 1 ? 1 : 0),
                'division': 2
            }[operation]
            // Calculate the number of columns (width)
            grid_cols = getLongestRowWidth()

            // Initialize the canvas
            const dims = getCanvasSize()
            p.createCanvas(dims.width, dims.height)
            p.rectMode(p.CENTER)
            p.textAlign(p.CENTER, p.CENTER)
            p.textSize(40 * text_ratio)

            // Initialize the grid
            setupGrid()
        }

        // Draw the canvas
        p.draw = () => {
            p.clear() // Clear screen
            fig.draw() // Draw grid
            drawArrows() // Draw arrows
            changeCursorIfOnArrow() // Change cursor
        }

        function drawArrows() {
            p.push()
            p.strokeWeight(4)

            // Calculate arrow position depending on the current mode (minified or not)
            let x1, x2, y
            if (minified) {
                x1 = (fig.x1 + fig.x) / 2
                x2 = (fig.x + fig.x2) / 2
                y = fig.y2 + 2 * arrow_size
            } else {
                x1 = (p.width - fig.width) / 4
                x2 = (3 * p.width + fig.width) / 4
                y = p.height/2
            }

            // Left arrow
            p.stroke(animation === -1 ? themeColors.arrowUnfocusColor : themeColors.arrowFocusColor)
            p.line(x1 - arrow_size, y, x1 + arrow_size, y - arrow_size)
            p.line(x1 - arrow_size, y, x1 + arrow_size, y + arrow_size)

            // Right arrow
            p.stroke(animation >= sequence.length ? themeColors.arrowUnfocusColor : themeColors.arrowFocusColor)
            p.line(x2 + arrow_size, y, x2 - arrow_size, y - arrow_size)
            p.line(x2 + arrow_size, y, x2 - arrow_size, y + arrow_size)

            p.pop()
        }

        // Function called after a click
        p.mousePressed = (e) => {
            if (e.which === 0) return // Prevents double-click in mobile

            // Calculate the arrow positions
            let x1, x2, y
            if (minified) {
                x1 = (fig.x1 + fig.x) / 2
                x2 = (fig.x + fig.x2) / 2
                y = fig.y2 + 2 * arrow_size
            } else {
                x1 = (p.width - fig.width) / 4
                x2 = (3 * p.width + fig.width) / 4
                y = p.height/2
            }

            // Check for intersection
            if (p.mouseX > x2 - arrow_size && p.mouseX < x2 + arrow_size && p.mouseY > y - arrow_size && p.mouseY < y + arrow_size && animation < sequence.length) {
                animation++ // Next step
            } else if (p.mouseX > x1 - arrow_size && p.mouseX < x1 + arrow_size && p.mouseY > y - arrow_size && p.mouseY < y + arrow_size && animation >= 0) {
                animation-- // Previous step
            }
        }

        function changeCursorIfOnArrow() {
            p.cursor('default') // Default cursor
            
            // Calculate the arrow positions
            let x1, x2, y
            if (minified) {
                x1 = (fig.x1 + fig.x) / 2
                x2 = (fig.x + fig.x2) / 2
                y = fig.y2 + 2 * arrow_size
            } else {
                x1 = (p.width - fig.width) / 4
                x2 = (3 * p.width + fig.width) / 4
                y = p.height/2
            }

            // If the cursor is hovering one of the arrows
            if (p.mouseX > x2 - arrow_size && p.mouseX < x2 + arrow_size && p.mouseY > y - arrow_size && p.mouseY < y + arrow_size && animation < sequence.length ||
                p.mouseX > x1 - arrow_size && p.mouseX < x1 + arrow_size && p.mouseY > y - arrow_size && p.mouseY < y + arrow_size && animation >= 0) {
                p.cursor('pointer') // Set the cursor to a Hand pointer
            } 
        }

        // Setup the grid cells
        let sub_leading_zero
        function setupGrid() {
            // Initialize the grid to the right dimensions and empty cells
            for (let x = 0; x < grid_cols; x++) {
                grid[x] = []
                for (let y = 0; y < grid_rows; y++) {
                    grid[x][y] = new Cell()
                }
            }

            // Count the number of decimals in a number
            const decimalCount = (x) => x.toString().includes('.') ? x.toString().split('.')[1].length : 0

            // Create the grid depending on the operation
            if (operation === 'addition') { 
                // Setup the numbers for addition
                const highestDecimals = Math.max(decimalCount(nb1), decimalCount(nb2))
                const nb1_str = p.nf(nb1, 0, highestDecimals).replaceAll('.','')
                const nb2_str = p.nf(nb2, 0, highestDecimals).replaceAll('.','')
                const result_str = p.nf(result, 0, highestDecimals).replaceAll('.','')

                // Create nb1 and nb2 cells
                let nb1_cells = putToEnd(nb1_str, 0)
                let nb2_cells = putToEnd(nb2_str, 1)

                // Create the result cells
                createAdditionCells(result_str, 2, [nb1_cells, nb2_cells])

                // Set special characters and separators
                putToStart('+', 1)
                putHorizontalBar(1, grid_cols, 1)
                putToStart('=', 2)

                // Create commas
                if (highestDecimals > 0) {
                    for (let i = 0; i < 3; i++) {
                        commas.push({
                            x: grid_cols - highestDecimals,
                            y: i
                        })
                    }
                }
            } else if (operation === 'multiplication') {
                // Setup the numbers for multiplication
                const nb1_decimals_count = decimalCount(nb1)
                const nb2_decimals_count = decimalCount(nb2)
                const nb1_str = nb1.toString().replaceAll('.','')
                const nb2_str = nb2.toString().replaceAll('.','')
                const formatted_result = p.nf(result, 0, nb1_decimals_count + nb2_decimals_count)
                const result_decimals_count = decimalCount(formatted_result)
                const result_str = formatted_result.toString().replaceAll('.','')

                // Create nb1 and nb2 cells
                let nb1_cells = putToEnd(nb1_str, 0)
                let nb2_cells = putToEnd(nb2_str, 1)

                // Calculate all the addition steps
                let intermediate_cells = createMultiplicationCells(nb1_cells, nb2_cells, nb1_str, nb2_str)

                // Add the addition cells to the grid if there is more than 1 line of addition steps
                if (nb2_str.length > 1) {
                    intermediate_cells.forEach(c => c.reverse())
                    createAdditionCells(result_str, grid_rows-1, intermediate_cells)
                    putHorizontalBar(1, grid_cols, 1 + nb2_str.length)
                }

                // Set special characters and separators
                putToStart('x', 1)
                putHorizontalBar(1, grid_cols, 1)
                putToStart('=', 2 + (nb2_str.length === 1 ? 0 : nb2_str.length))                

                // Create commas
                if (nb1_decimals_count > 0) commas.push({
                    x: grid_cols - nb1_decimals_count,
                    y: 0
                })
                if (nb2_decimals_count > 0) commas.push({
                    x: grid_cols - nb2_decimals_count,
                    y: 1
                })
                if (result_decimals_count > 0) {
                    for (let i = 0; i < nb2_str.length+1; i++) {
                        commas.push({
                            x: grid_cols - result_decimals_count,
                            y: 2 + i
                        })
                    }
                }
            } else if (operation === 'subtraction') {
                // Setup the numbers for subtraction
                const highestDecimals = Math.max(decimalCount(nb1), decimalCount(nb2))
                const highestNumber = Math.floor(Math.max(Math.abs(nb1), Math.abs(nb2))).toString().length
                const nb1_str = p.nf(nb1, 0, highestDecimals).replaceAll('.','')
                const nb2_str = p.nf(nb2, 0, highestDecimals).replaceAll('.','')
                const result_str = p.nf(result, highestNumber, highestDecimals).replaceAll('.','')
                sub_leading_zero = (result_str.match(/^0+/) || [''])[0].length - (result < 1 ? 1 : 0)

                // Create nb1 and nb2 cells
                let nb1_cells = putToEnd(nb1_str, 0)
                let nb2_cells = putToEnd(nb2_str, 1)

                // Create result cells
                createSubtractionCells(result_str, 2, nb1_cells, nb2_cells)

                // Set special characters and separators
                putToStart('﹣', 1)
                putHorizontalBar(1, grid_cols, 1)
                putToStart('=', 2)
                
                // Create commas
                if (highestDecimals > 0) {
                    for (let i = 0; i < 3; i++) {
                        commas.push({
                            x: grid_cols - highestDecimals,
                            y: i
                        })
                    }
                }
            } else if (operation === 'division') {
                // Setup the numbers for division
                const result_decimals_count = decimalCount(result)
                const nb1_decimals_count = decimalCount(nb1)
                const nb2_str = nb2.toString()
                let nb1_str = nb1.toString().replaceAll('.', '')
                let result_str = result.toString().replaceAll('.','')
                if (Number(nb1_str[0]) < Number(nb2_str) && result > 1) result_str = '0' + result_str
                let longest_nb = p.max(nb1_str.length, result_str.length)
                let added_padding_nb1 = 0
                while(nb1_str.length < longest_nb) nb1_str += '0', added_padding_nb1++
                while(result_str.length < longest_nb) result_str += '0'

                // Set nb1 and nb2 cells
                let nb2_cells = putToStart(nb2_str, 1)
                let nb1_cells = putToEnd(nb1_str, 1)

                // Set result cells
                sub_leading_zero = (result_str.match(/^0+/) || [''])[0].length
                createDivisionCells(result_str, 0, nb1_cells, nb2_cells[0])

                 // Set special characters and separators
                putToStart('=', 0)
                putHorizontalBar(1, grid_cols, 0)
                putVerticalBar(1, 2, 0)

                // Create commas
                if (result_decimals_count > 0) {
                    commas.push({
                        x: grid_cols - result_decimals_count,
                        y: 0
                    })
                }
                if (nb1_decimals_count > 0 || added_padding_nb1 > 0) {
                    commas.push({
                        x: grid_cols - nb1_decimals_count - added_padding_nb1,
                        y: 1
                    })
                } 
            }
        }

        // Calculate and return an array of cells for the division operation
        function createDivisionCells(result, y, nb1_cells, nb2_cell) {
            let linked = []
            let nb_right_str = ''
            let result_pos = 0
            let last_remainder = 0

            for (let i = 0; i < nb1_cells.length; i++) {
                const x = grid_cols-nb1_cells.length+result_pos
                let nb1_cell = nb1_cells[i]
                nb_right_str += nb1_cell.value.toString()
                let nb_right = Number(nb_right_str)

                linked.push(nb1_cell)

                let remainder = nb_right%nb2
                nb_right_str = remainder.toString()

                linked.push(nb2_cell)
                if (x === grid_cols-1 && remainder > 0) remainder = 0
                grid[x][y] = new Cell(result[result_pos], last_remainder, remainder, linked)
                sequence.push(grid[x][y])
                result_pos++
                linked = []
                last_remainder = remainder
            }
        }

        // Calculate and return an array of cells for the addition operation
        function createAdditionCells(result, y, number_cells) {
            let carry = 0

            for (let i = 0; i < result.length; i++) {
                let linked = []
                let addition = 0

                for (let k = 0; k < number_cells.length; k++) {
                    let cell_pos = number_cells[k].length-i-1
                    if (cell_pos >= 0) linked.push(number_cells[k][cell_pos])
                    let cell_value = cell_pos >= 0 ? number_cells[k][cell_pos].value : 0
                    addition += (cell_value === '•' ? 0 : cell_value)
                }

                let result_cell_value = result[result.length-i-1]

                let result_full = addition + carry
                let last_carry = carry
                carry = (result_full - result_full%10)/10

                const x = grid_cols-i-1
                grid[x][y] = new Cell(result_cell_value, last_carry, carry, linked)
                sequence.push(grid[x][y])
            }
        }

        // Calculate and return an array of cells for the multiplication operation
        function createMultiplicationCells(nb1_cells, nb2_cells, nb1_str, nb2_str) {
            let cells = []

            for (let k = 0; k < nb2_str.length; k++) {
                cells[k] = []
                let step_mult = Number(nb2_str[nb2_str.length - 1 - k]) * Number(nb1_str)
                let step_mult_str = step_mult.toString() + Array(k+1).join('•')
                let nb2_cell_pos = nb2_cells.length-k-1
                let carry = 0

                for(let i = 0; i < step_mult_str.length; i++) {
                    let linked = []
                    
                    const x = grid_cols-i-1
                    let nb1_cell_pos = nb1_cells.length-i-1+k
                    let result_cell_value = step_mult_str[step_mult_str.length-i-1]

                    if (result_cell_value === '•') {
                        grid[x][2+k] = new Cell(result_cell_value)
                        cells[k].push(grid[x][2+k])
                        continue
                    }

                    if (nb1_cell_pos >= 0) linked.push(nb1_cells[nb1_cell_pos])
                    if (nb2_cell_pos >= 0) linked.push(nb2_cells[nb2_cell_pos])

                    let nb1_cell_value = nb1_cell_pos >= 0 && nb1_cell_pos < nb1_cells.length ? nb1_cells[nb1_cell_pos].value : 0
                    let nb2_cell_value = nb2_cell_pos >= 0 && nb2_cell_pos < nb2_cells.length ? nb2_cells[nb2_cell_pos].value : 0

                    let result_full = nb1_cell_value * nb2_cell_value + carry
                    let last_carry = carry
                    carry = (result_full - result_full%10)/10

                    grid[x][2+k] = new Cell(result_cell_value, last_carry, carry, linked)
                    sequence.push(grid[x][2+k])
                    cells[k].push(grid[x][2+k])
                }

                if (k < nb2_str.length - 1) putToStart('+', 3 + k)
            }

            return cells
        }

        // Calculate and return an array of cells for the subtraction operation
        function createSubtractionCells(result, y, nb1_cells, nb2_cells) {
            let carry = 0
            for( let i = 0; i < result.length; i++) {
                let linked = []
                let last_carry = carry
                carry = 0

                let nb1_cell_pos = nb1_cells.length-i-1
                let nb2_cell_pos = nb2_cells.length-i-1
                let result_cell_value = result[result.length-i-1]

                if (nb1_cell_pos >= 0) linked.push(nb1_cells[nb1_cell_pos])
                if (nb2_cell_pos >= 0) linked.push(nb2_cells[nb2_cell_pos])

                let nb1_cell_value = nb1_cell_pos >= 0 ? nb1_cells[nb1_cell_pos].value : 0
                let nb2_cell_value = nb2_cell_pos >= 0 ? nb2_cells[nb2_cell_pos].value : 0

                if (last_carry > 0) {
                    if (nb1_cell_value - 1 < nb2_cell_value) {
                        carry = 1
                    }
                } else {
                    if (nb1_cell_value < nb2_cell_value) {
                        carry = 1
                    }
                }

                const x = grid_cols-i-1
                if (result.includes('-')) grid[x][y] = new Cell(result_cell_value, 0, 0, linked)
                else grid[x][y] = new Cell(result_cell_value, last_carry, carry, linked)
                sequence.push(grid[x][y])
            }
        }

        // Create cells to the start of a row
        function putToStart(str, y) {
            let newCells = []
            for( let i = 0; i < str.length; i++) {
                let newCell = new Cell(str[i])
                grid[i][y] = newCell
                newCells.push(newCell)
            }
            return newCells
        }
    
        // Create cells to the end of a row
        function putToEnd(str, y) {
            let newCells = []
            for( let i = 0; i < str.length; i++) {
                let newCell = new Cell(str[i])
                const x = grid_cols - str.length + i
                grid[x][y] = newCell
                newCells.push(newCell)
            }
            return newCells
        }

        // Create an horizontal separator
        function putHorizontalBar(x1, x2, y) {
            lines.push({
                x1: x1, 
                x2: x2,
                y1: (y+1),
                y2: (y+1)
            })
        }

        // Create a vertical separator
        function putVerticalBar(y1, y2, x) {
            lines.push({
                x1: (x+1), 
                x2: (x+1), 
                y1: y1,
                y2: y2
            })
        }

        // Change nb1 and nb2 so that nb1 > nb2 (for addition and multiplication)
        function sortNumbers() {
            if (operation === 'subtraction' || operation === 'division') {
                if (operation === 'division') {
                    nb1 = Number(p.nf(nb1, 0, Math.min(getDigitCount(nb1), 5)))
                }
                return
            }

            const nb1_full_length = getDigitCount(nb1)
            const nb2_full_length = getDigitCount(nb2)
    
            if (nb2_full_length > nb1_full_length) {
                let tmp = nb1
                nb1 = nb2
                nb2 = tmp
            }
        }
    }

    // Create the canvas and run the sketch in the html node.
    new p5(sketch, node)
}