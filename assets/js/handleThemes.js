var lightLabel = document.querySelector('label[for="theme-blue-light"]');
var darkLabel = document.querySelector('label[for="theme-blue-dark"]');

var lightSwitch = document.getElementById("theme-blue-light");
var darkSwitch = document.getElementById("theme-blue-dark");

// Create an event the includes the new theme of the page
const createThemeChangeEvent = (newTheme) => {
  return new CustomEvent("themeset", {
    detail: {newTheme},
    bubbles: true,
    cancelable: true,
    composed: false
  });
}

// Dispatch an event on the document to tell the listener to switch to dark theme
const dispatchDarkThemeEvent = () => {
  const darkThemeEvent = createThemeChangeEvent("dark");
  document.dispatchEvent(darkThemeEvent);
}

// Dispatch an event on the document to tell the listener to switch to light theme
const dispatchLightThemeEvent = () => {
  const lightThemeEvent = createThemeChangeEvent("light");
  document.dispatchEvent(lightThemeEvent);
}

lightSwitch.onchange = function () {
  setTimeout(function () {
    if (lightSwitch.checked == true) {
      setCookie("preferedTheme", "light", 360);
      try {
        document.getElementById("rtl-stylesheet").remove();
        document.getElementById("app-stylesheet").remove();
      } catch (e) {}

      dispatchLightThemeEvent();
    }
  }, 50);
};
darkSwitch.onchange = function () {
  setTimeout(function () {
    if (darkSwitch.checked == true) {
      setCookie("preferedTheme", "dark", 360);
      try {
        document.getElementById("rtl-stylesheet").remove();
        document.getElementById("app-stylesheet").remove();
      } catch (e) {}
      checkTheme();

      dispatchDarkThemeEvent();
    }
  }, 100);
};

if (getCookie("preferedTheme") == "dark") {
	darkLabel.click();

  dispatchDarkThemeEvent();
} else {
	lightLabel.click();

  dispatchLightThemeEvent();
}
