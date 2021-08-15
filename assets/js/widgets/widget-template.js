const getThemeColors = (theme) => {
    // Edit these colors to change the colors
    // of specific elements of the pie chart
    const themes = {
        "light": {
            backgroundColor: "#f5f7fa",
            labelTextColor: "#000000"
        },
        "dark": {
            backgroundColor: "#1D2126",
            labelTextColor: "#FFFFFF"
        }
    }

    return themes[theme]
}

const defaultTheme = "light"

// Define global variables that contain colors used by the widget
let { backgroundColor, labelTextColor } = getThemeColors(defaultTheme)

const setThemeColors = (theme) => {
    const themeColors = getThemeColors(theme)

    backgroundColor = themeColors.backgroundColor
    labelTextColor = themeColors.labelTextColor
}

// Change the theme colors when the document theme is changed
document.addEventListener("themeset", (event) => {
    setThemeColors(event.detail.newTheme)
})
