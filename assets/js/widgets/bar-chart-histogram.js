const runHistogramBarChartWidget = ({container, bar_values, x_scale, y_scale, x_label, y_label, interactive}) => {
    const getThemeColors = (theme) => {
        // Edit these colors to change the colors
        // of specific elements of the pie chart
        const themes = {
            "light": {
                AXIS_LABELS_COLOR: 'black',
                BAR_LABELS_COLOR: 'black',
                GRID_VALUES_COLOR: 'black',
                GRID_COLOR: 'black',
                BAR_COLORS: 'black'
            },
            "dark": {
                AXIS_LABELS_COLOR: 'white',
                BAR_LABELS_COLOR: 'white',
                GRID_VALUES_COLOR: 'white',
                GRID_COLOR: 'white',
                BAR_COLORS: 'white'
            }
        }
    
        return themes[theme]
    }
    
    const defaultTheme = "light"
    
    // Define global variables that contain colors used by the widget
    let { AXIS_LABELS_COLOR, BAR_LABELS_COLOR, GRID_VALUES_COLOR, GRID_COLOR, BAR_COLORS } = getThemeColors(defaultTheme)
    
    const setThemeColors = (theme) => {
        const themeColors = getThemeColors(theme)
    
        AXIS_LABELS_COLOR = themeColors.AXIS_LABELS_COLOR
        BAR_LABELS_COLOR = themeColors.BAR_LABELS_COLOR
        GRID_VALUES_COLOR = themeColors.GRID_VALUES_COLOR
        GRID_COLOR = themeColors.GRID_COLOR
        BAR_COLORS = themeColors.BAR_COLORS
    
    }
    
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
    if(interactive) node.append(answerHiddenInput)

    const heightToWidthRatio = 5/8

    const getHeightOfCanvas = () => {
        const windowHeight = window.innerHeight|| document.documentElement.clientHeight|| 
		document.body.clientHeight
        const maxHeight = windowHeight

        let height = Math.max((y_scale.end - y_scale.start) / y_scale.step * windowHeight*0.05, node.clientWidth * heightToWidthRatio)

        if(height > maxHeight) {
            height = maxHeight
        } 

        return height
    }

    const getWidthOfCanvas = () => {
        return Math.max(node.clientWidth, (bar_values.length * 2 + 3) * 60)
    }
    
    let dims = {
        w: getWidthOfCanvas(),
        h: getHeightOfCanvas()
    }

    answerHiddenInput.value = ""

    const updateHiddenInputs = (output) => {
        answerHiddenInput.value = encodeURIComponent(JSON.stringify(...output))
    }

    // Define the p5 sketch methods
    const sketch = p => {
        p.mouseDragged = (e) => mouseDragged(e, p)
        p.mouseMoved = () => mouseMoved(p)
        p.mouseReleased = () => mouseReleased(p)

        p.setup = () => {
            p.createCanvas(dims.w, dims.h)
            setupBarChart(p)  
            
            if(!interactive) return
            
            updateHiddenInputs([bar_values])         
        }

        p.draw = () => {
            p.clear()
            drawBarChart(p)
        }

        p.windowResized = () => {
            p.resizeCanvas(0, 0)

            dims = {
                w: getWidthOfCanvas(),
                h: getHeightOfCanvas()
            }

            p.resizeCanvas(dims.w, dims.h)

            resize(p)
        }
    }

    /// Widget ///
    
    let selected_bar = null
    let grid_cell_width, grid_cell_height, default_strokeWeight, default_textSize, arrow_size, horizontal_axis_y, axis_x_start

    function setupBarChart(p) {
        p.fill(0)
        default_textSize = p.constrain((12/300) * p.height, 1, 24)
        default_strokeWeight = default_textSize/16
        p.textAlign(p.CENTER, p.CENTER)
    }

    function resize(p) {
        default_textSize = p.constrain((12/300) * p.height, 1, 24)
        default_strokeWeight = default_textSize/16
    }

    function drawBarChart(p) {
        drawGrid(p)
    }

    function drawGrid(p) {
        const numbers_x = default_textSize * 1.4 + default_textSize
        axis_x_start = numbers_x + default_textSize
        horizontal_axis_y = p.height - axis_x_start
        arrow_size = default_textSize*0.75
    
        /// Draw Arrows ///
    
        p.strokeWeight(default_strokeWeight)
        // Horizontal arrow
        // p.triangle(p.width - arrow_size*2, horizontal_axis_y - arrow_size, 
        //             p.width - arrow_size*2, horizontal_axis_y + arrow_size, 
        //             p.width, horizontal_axis_y)
    
        // // Vertical arrow
        // p.triangle(axis_x_start-arrow_size, arrow_size*2, 
        //          axis_x_start+arrow_size, arrow_size*2, 
        //          axis_x_start, 0)
    
        const horizontal_lines_count = p.floor((y_scale.end - y_scale.start) / y_scale.step)
        grid_cell_height = (horizontal_axis_y - arrow_size*3) / horizontal_lines_count
    
        /// Draw grid ///

        p.textSize(default_textSize)

        // Horizontal lines
        p.push()
        for (let y = 0; y <= horizontal_lines_count; y++) {
            const line_y = y * grid_cell_height + arrow_size*3
    
            if (y < horizontal_lines_count) {
                p.stroke(GRID_COLOR)
                p.line(axis_x_start - default_textSize/3, line_y, p.width, line_y)
            }
            p.noStroke()
            p.fill(GRID_VALUES_COLOR)
            p.text(y_scale.start + y_scale.step * (horizontal_lines_count-y), numbers_x, line_y)
        }
        p.pop()
    
        const vertical_lines_count = p.floor((x_scale.end - x_scale.start) / x_scale.step)
        grid_cell_width = (p.width - arrow_size * 3 - axis_x_start) / vertical_lines_count
    
        // Vertical lines
        p.push()
        for (let x = 0; x <= vertical_lines_count; x++) {
            const line_x = axis_x_start + x * grid_cell_width
            p.stroke(GRID_COLOR)
            p.line(line_x, arrow_size*3, line_x, horizontal_axis_y + default_textSize/3)
            p.noStroke()
            p.fill(BAR_LABELS_COLOR)
            p.text(x_scale.start + x_scale.step * x, line_x, p.height - numbers_x)
        }
        p.pop()
    
        /// Draw axis ///
    
        p.strokeWeight(default_strokeWeight*4)
        p.textSize(default_textSize*1.2)
        // Horizontal axis and label
        p.push()
        p.stroke(GRID_COLOR)
        p.line(axis_x_start, horizontal_axis_y, p.width, horizontal_axis_y)
        p.noStroke()
        p.fill(AXIS_LABELS_COLOR)
        p.text(x_label, p.width/2, p.height - p.textSize()/2)
        p.pop()

        // Vertical axis and label
        p.push()
        p.stroke(GRID_COLOR)
        p.line(axis_x_start, 0, axis_x_start, horizontal_axis_y)
        p.pop()
        
        p.push()
        p.translate(p.textSize()/2, p.height/2)
        p.rotate(p.radians(-90))
        p.fill(AXIS_LABELS_COLOR)
        p.text(y_label, 0, 0)
        p.pop()
    
        /// Draw bars ///
        p.push()
        for (let i = 0; i < bar_values.length; i++) {
            const bar = bar_values[i]
            const x_start = axis_x_start + grid_cell_width * (bar.start - x_scale.start) / x_scale.step
            const bar_width = grid_cell_width * (bar.end - bar.start) / y_scale.step
            const bar_height = grid_cell_height * (bar.value - y_scale.start) / y_scale.step
    
            // Bar rectangle
            p.fill(28, 172, 255)
            p.push()
            p.stroke(BAR_COLORS)
            p.rect(x_start, horizontal_axis_y - bar_height, bar_width, bar_height)
            p.pop()
        }
        p.pop()
    }
    
    function mouseMoved(p) {
        if (!interactive) {
            return
        }
    
        const selected = getMouseOverBarIndex(p)
    
        if (selected !== null) {
            p.cursor(selected.anchor === 'y' ? 'ns-resize' : 'ew-resize')
        } else {
            p.cursor(p.ARROW)
        }
    }
    
    function mouseDragged(e, p) {
        if(!e.cancelable) return

        if (!interactive) return
    
        if (selected_bar === null) {
            selected_bar = getMouseOverBarIndex(p)
    
            if (selected_bar === null) {
                return
            }
        }
    
        if (selected_bar.anchor === 'y') {
            let new_value = p.map(p.mouseY, arrow_size*3, horizontal_axis_y, y_scale.end, y_scale.start)
            bar_values[selected_bar.index].value = p.constrain(new_value, y_scale.start, y_scale.end)
            bar_values[selected_bar.index].value = alignToGrid(bar_values[selected_bar.index].value, y_scale.step)
        } else {
            let new_value = p.map(p.mouseX, axis_x_start, p.width, x_scale.start, x_scale.end)
    
            if (selected_bar.anchor === 'x_start') {
                
                bar_values[selected_bar.index].start = p.constrain(new_value, 
                    selected_bar.index === 0 ? x_scale.start : bar_values[selected_bar.index-1].start,
                    p.min(bar_values[selected_bar.index].end,
                    selected_bar.index === bar_values.length-1 ? x_scale.end : bar_values[selected_bar.index].end))
                bar_values[selected_bar.index].start = alignToGrid(bar_values[selected_bar.index].start, x_scale.step)
    
                if (selected_bar.index > 0) {
                    bar_values[selected_bar.index-1].end = bar_values[selected_bar.index].start
                }
            } else {
                bar_values[selected_bar.index].end = p.constrain(new_value, 
                    p.max(bar_values[selected_bar.index].start,
                    selected_bar.index === 0 ? bar_values[selected_bar.index].start : bar_values[selected_bar.index-1].start),
                    selected_bar.index === bar_values.length-1 ? x_scale.end : bar_values[selected_bar.index+1].end)
                bar_values[selected_bar.index].end = alignToGrid(bar_values[selected_bar.index].end, x_scale.step)
    
                if (selected_bar.index < bar_values.length-1) {
                    bar_values[selected_bar.index+1].start = bar_values[selected_bar.index].end
                }
            }
        }

        updateHiddenInputs([bar_values])

        return false
    }
    
    function alignToGrid(val, step) {
        const overflow = val%step
        if (overflow < step/2) {
            return val - overflow
        } else {
            return val + step - overflow
        }
    }
    
    function mouseReleased() {
        if (!interactive) {
            return
        }
    
        selected_bar = null
    }
    
    function getMouseOverBarIndex(p) {
        const clickableArea = 30
    
        for (let i = 0; i < bar_values.length; i++) {
            const bar = bar_values[i]
            const bar_height = grid_cell_height * (bar.value - y_scale.start) / y_scale.step
            const x_start = axis_x_start + grid_cell_width * (bar.start - x_scale.start) / x_scale.step
            const x_end = axis_x_start + grid_cell_width * (bar.end - x_scale.start) / x_scale.step
            const y = horizontal_axis_y - bar_height
    
            if (p.mouseX > x_start - grid_cell_width/2 && p.mouseX < x_end + grid_cell_width/2 && p.mouseY > y - grid_cell_height && p.mouseY < y + grid_cell_height) {
                return {
                    index: i,
                    anchor: 'y'
                }
            }
            
            if (p.mouseX > x_start - grid_cell_width/2 && p.mouseX < x_start + grid_cell_width/2 && p.mouseY > y && p.mouseY < horizontal_axis_y) {
                return {
                    index: i,
                    anchor: 'x_start'
                }
            }
    
            if (p.mouseX > x_end - grid_cell_width/2 && p.mouseX < x_end + grid_cell_width/2 && p.mouseY > y && p.mouseY < horizontal_axis_y) {
                return {
                    index: i,
                    anchor: 'x_end'
                }
            }
        }
    
        return null
    }

    // Create the canvas and run the sketch in the html node.
    new p5(sketch, node)
}