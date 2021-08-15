const runFillableTableWidget = ({container, table}) => {

    const widgetContainer = document.getElementById(container)

    // Switch between light and dark mode
    document.addEventListener('themeset', (event) => {
        // Switch the css class of the widget container when the theme changes
        const newThemeClass = `fillable-table-container-${event.detail.newTheme}`

        widgetContainer.classList = ""

        widgetContainer.classList.add(newThemeClass)
    })

    const answersHiddenInput = document.createElement("input")

    // Configure the hidden input
    answersHiddenInput.type = "hidden"
    answersHiddenInput.name = "answers[]"

    // Insert the hidden input into the html
    widgetContainer.append(answersHiddenInput)

    // Contains all of the answers from the inputs
    const answers = []

    const createAnswerContainer = (initalValue = "") => {
        answers.push(initalValue)

        const index = answers.length - 1

        // Do an initial update of the hidden input
        answersHiddenInput.value = encodeURIComponent(JSON.stringify(answers))

        const getValue = () => answers[index]

        const setValue = (value) => {
            answers[index] = value

            answersHiddenInput.value = encodeURIComponent(JSON.stringify(answers))
        }

        return { getValue, setValue }
    }

    const appendElement = (parent, element) => parent.append(element)

    // Create the html table element
    const tableElement = document.createElement('table')
    tableElement.className = "fillable-table"

    // Append the table to the widget container in the document
    appendElement(widgetContainer, tableElement)

    // Create the header section of the table
    const headerSection = document.createElement('thead')

    // Add the header section to the table
    appendElement(tableElement, headerSection)

    // Create the header row
    const headerRow = document.createElement('tr')
    headerRow.className = "ft-header-row"

    // Add the header row to the table
    appendElement(headerSection, headerRow)

    // Add all of the headers in the table
    for(const header of table.headers) {
        const headerElement = document.createElement('th')

        headerElement.className = "ft-header"
        headerElement.innerHTML = header

        appendElement(headerRow, headerElement)
    }

    // Creates a text cell in the table
    // Note: can be used for normal numbers and text
    const createTextCell = (cellData) => {
        const cellElement = document.createElement('td')

        cellElement.className = "ft-cell"
        cellElement.innerText = cellData

        return cellElement
    }

    const createInputCell = (cellData) => {
        // Create the cell wrapper element
        const cellElement = document.createElement('td')
        cellElement.className = "ft-input-cell"

        // Create the input
        const inputElement = document.createElement('input')
        inputElement.className = "ft-input"
        inputElement.value = cellData

        const answerContainer = createAnswerContainer(cellData)

        // Update the answer hidden input when the user types something in
        inputElement.addEventListener("input", (e) => {
            // Only include letters, numbers, and .'s from whatever is entered
            const regex = /[a-zA-Z0-9.]+/g
            const matched = e.target.value.match(regex)
            const value = matched != null ? matched.join() : ""

            // Update the value of input to only include valid characters
            inputElement.value = value

            answerContainer.setValue(value)
        })

        // Prevent form submission when the user presses enter
        inputElement.addEventListener("keydown", (e) => {
            if(e.key == "Enter") e.preventDefault()
        })

        // Add the input to the cell wrapper
        appendElement(cellElement, inputElement)

        return cellElement
    }

    const createTableRow = (cells) => {
        const rowElement = document.createElement('tr')

        // Create all of the cells in the row
        for(const cell of cells) {
            let cellElement

            if(cell.type === "text") cellElement = createTextCell(cell.data)
            if(cell.type === "input") cellElement = createInputCell(cell.data)

            appendElement(rowElement, cellElement)
        }

        return rowElement
    }

    // Create the body section of the table
    const bodySection = document.createElement('tbody')
    
    // Add the body section to the table element
    appendElement(tableElement, bodySection)

    // Create all of the rows in the table
    table.rows.forEach(row => appendElement(bodySection, createTableRow(row)))

}