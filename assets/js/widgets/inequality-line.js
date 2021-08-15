let inequalityLineThemeColors;

const inequalityLineTouchMode = ('ontouchstart' in window) ||
  (navigator.maxTouchPoints > 0) ||
  (navigator.msMaxTouchPoints > 0);


const runInequalityLineWidget = ({container, xaxis, values, interactive}) => {
  const node = document.getElementById(container);

  const answerHiddenInput = document.createElement("input")

  // Configure the hidden input
  answerHiddenInput.type = "hidden"
  answerHiddenInput.name = "answers[]"

  // Insert the hidden input into the html
  if(interactive) node.append(answerHiddenInput)

  const updateHiddenInputs = (output) => {
    if(!interactive) return

    answerHiddenInput.value = encodeURIComponent(JSON.stringify(output))
  }

  const heightToWidthRatio = 3 / 8;

  const getThemeColors = (theme) => {
    // colors of the background, labels/strokes, and circle highlights
    const themes = {
      "light": {
        backgroundColor: "#f5f7fa",
        labelTextColor: "#000000",
        circHighlightColor: "#00ACED"
      },
      "dark": {
        backgroundColor: "#1D2126",
        labelTextColor: "#FFFFFF",
        circHighlightColor: "#FF8F41"
      }
    }
    return themes[theme];
  }

  const defaultTheme = "light";

  const setThemeColors = (theme) => {
    inequalityLineThemeColors = getThemeColors(theme);
  }

  // Define global variables that contain colors used by the widget
  setThemeColors(defaultTheme);

  // Change the theme colors when the document theme is changed
  document.addEventListener("themeset", (event) => {
    setThemeColors(event.detail.newTheme)
  })

  const getHeightOfCanvas = () => {
    const windowHeight = window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    const maxHeight = windowHeight * (5.5 / 10);

    let height = node.clientWidth * heightToWidthRatio;

    if (height > maxHeight) {
      height = maxHeight;
    }

    return height;
  }

  let dims = {
    w: node.clientWidth,
    h: getHeightOfCanvas()
  }

  var creationData = {
    xaxis: xaxis,
    values: values,
    interactive: interactive
  };

  let ineqLine

  // Define the p5 sketch methods
  const sketch = p => {
    //sketch variables
    p.closestCirc = -1;
    p.touchStartX = -1;
    p.touchStartY = -1;
    p.selectedIcon = "none";
    p.recentlyDragged = false;
    p.lastClickedFrame = 0;


    p.setup = () => {
      var c = p.createCanvas(dims.w, dims.h)
      ineqLine = new InequalityLine(creationData, p, updateHiddenInputs);
    }

    p.draw = () => {
      p.clear();
      ineqLine.draw();
    }

    // update the cursor and cloest circle on mouseMove
    p.mouseMoved = () => {
      if (interactive) {
        p.closestCirc = -1;
        var newCursor = "default";

        var returnedIcon = ineqLine.whichIcon(p.mouseX, p.mouseY);

        switch (returnedIcon) {
          case "start":
            newCursor = ineqLine.values.startIcon === "arrow" ? "pointer" : "col-resize";
            p.closestCirc = 0;
            break;
          case "end":
            newCursor = ineqLine.values.endIcon === "arrow" ? "pointer" : "col-resize";
            p.closestCirc = 1;

            break;
          case "none":
            newCursor = "default";
            break;
          default:
            newCursor = "pointer";
            break;
        }

        //update cursor
        p.cursor(newCursor);
      }
    }

    p.mousePressed = () => {
      return null;
    }
    p.mouseClicked = () => {
      return null;
    }

    // while dragging, send the mouseX to the ineqLine for adjsuting
    p.mouseDragged = (e) => {
      if(!e.cancelable) return

      if (interactive && p.closestCirc >= 0) {
        ineqLine.adjustCircle(p.closestCirc, p.mouseX);
        p.recentlyDragged = true;

        return false; // Prevent accidental scrolling
      }
    }

    // handle changing circle icons on click
    p.mouseReleased = () => {
      if (interactive && !p.recentlyDragged) {
        if (p.frameCount - p.lastClickedFrame > 5) {
          p.lastClickedFrame = p.frameCount;
          ineqLine.handleClick(p.mouseX, p.mouseY);
        }
      }
      p.recentlyDragged = false;
    }

    // update closest circle on touch start
    p.touchStarted = () => {
      if (interactive) {
        p.touchStartX = p.touches[0].x;
        p.touchStartY = p.touches[0].y;

        p.closestCirc = -1;

        switch (ineqLine.whichIcon(p.mouseX, p.mouseY)) {
          case "start":
            newCursor = ineqLine.values.startIcon === "arrow" ? "pointer" : "col-resize";
            p.closestCirc = 0;
            break;
          case "end":
            newCursor = ineqLine.values.endIcon === "arrow" ? "pointer" : "col-resize";
            p.closestCirc = 1;
        }
      }
    }

    // while touch is dragging, send touch x to ineqLine
    p.touchDragged = () => {
      if (interactive) {
        ineqLine.showingIconOptions = false;
        p.recentlyDragged = true;
        ineqLine.adjustCircle(p.closestCirc, p.touches[0].x);

        return false; // Prevent accidental scrolling
      }
    }

    // handle the touch like a click if it wasnt dragged
    p.touchEnded = () => {
      if (interactive && !p.recentlyDragged && p.touchStartX >= 0) {
        if (p.frameCount - p.lastClickedFrame > 5) {
          p.lastClickedFrame = p.frameCount;
          ineqLine.handleClick(p.mouseX, p.mouseY);
        }
      }
      p.recentlyDragged = false;
      p.touchStartX = -1;
      p.touchStartY = -1;
    }

    p.windowResized = () => {
      p.resizeCanvas(0, 0)

      dims = {
        w: node.clientWidth,
        h: getHeightOfCanvas()
      }

      p.resizeCanvas(dims.w, dims.h)
      ineqLine.resize()
    }
  }

  // Create the canvas and run the sketch in the html node.
  new p5(sketch, node)
}

class InequalityLine {
  constructor(data, p, update) {
    this.p = p;

    this.xaxis = data.xaxis;
    this.values = data.values;
    this.interactive = data.interactive;

    this.update = update;

    // data validation
    if (this.values.start >= this.values.end) {
      throw "error: invalid start/end positions"
    }
    if (this.values.startIcon !== "arrow" &&
      this.values.startIcon !== "open-circle" &&
      this.values.startIcon !== "closed-circle") {
      throw "error: invalid startIcon"
    }
    if (this.values.endIcon !== "arrow" &&
      this.values.endIcon !== "open-circle" &&
      this.values.endIcon !== "closed-circle") {
      throw "error: invalid endIcon"
    }
    if (this.values.startIcon === "arrow") {
      this.values.start = this.xaxis.start;
    }
    if (this.values.endIcon === "arrow") {
      this.values.end = this.xaxis.end;
    }


    // array of a range of numbers specified by the start, end, and increment
    var labelNumbs = [];
    if (this.xaxis.increment > 0 && this.xaxis.start < this.xaxis.end) {
      for (let i = this.xaxis.start; i <= this.xaxis.end; i += this.xaxis.increment) {
        labelNumbs.push(i);
      }
    }
    this.labelNumbs = labelNumbs;

    // variables for converting between data values and x coordinates
    this.xCoordMin = 0.5 * ((p.width - 30) / this.labelNumbs.length) + 15;
    this.xCoordMax = (this.labelNumbs.length - 0.5) * ((p.width) / this.labelNumbs.length) - 15;
    this.lineMin = this.labelNumbs[0];
    this.lineMax = this.labelNumbs[this.labelNumbs.length - 1];

    // variables for interactivety
    this.showingIconOptions = false;
    this.currentCirc = -1;

    // position and size variables to be calculated with resize()
    this.startXpos = 0;
    this.endXpos = 0;
    this.ineqLineHeight = 0;
    this.ineqIconRadius = 0;
    this.popupIconHeight = 0;
    this.popupIconRadius = 0;
    this.popupIconSpacing = 0;

    // fills in initial values
    this.resize();

    // update HTML outputs
    this.sendUpdates();
  }

  draw() {
    var p = this.p;
    var bg = inequalityLineThemeColors.backgroundColor;

    p.background(bg);

    this.drawNumberline();
    this.drawIneqLine();

    if (this.showingIconOptions) {
      this.drawIconsOptions();
    }
  }

  drawNumberline() {
    var p = this.p;
    p.push();
    p.stroke(inequalityLineThemeColors.labelTextColor);
    p.fill(inequalityLineThemeColors.labelTextColor);

    // draw line itself
    p.strokeWeight(5 * p.width / 1000);
    p.line(0, p.height * (4 / 5), p.width, p.height * (4 / 5));

    // draw number labels and tick marks
    p.textSize(p.min(50, 42 * p.width / 1000));
    p.textAlign(p.CENTER, p.CENTER);

    for (var i = 0; i < this.labelNumbs.length; i++) {
      var xpos = (i + 0.5) * ((p.width - 30) / this.labelNumbs.length) + 15;

      // if there's more than 15 labels to draw, logic will try to cut
      // it down to 10
      if (this.labelNumbs.length > 15) {
        var modNumber = Math.round(this.labelNumbs.length / 10);
        if ((i % modNumber == 0 && i != this.labelNumbs.length - 2) ||
          (i == this.labelNumbs.length - 1)) {
          p.strokeWeight(5 * p.width / 1000);
          p.line(xpos, p.height * (4.2 / 5), xpos, p.height * (3.8 / 5));
          p.strokeWeight(0);
          p.text(this.labelNumbs[i], xpos, p.height * (4.6 / 5));
        } else {
          p.strokeWeight(4 * p.width / 1000);
          p.line(xpos, p.height * (4.15 / 5), xpos, p.height * (3.85 / 5));
        }
      } else {
        p.strokeWeight(5 * p.width / 1000);
        p.line(xpos, p.height * (4.2 / 5), xpos, p.height * (3.8 / 5));
        p.strokeWeight(0);
        p.text(this.labelNumbs[i], xpos, p.height * (4.6 / 5));
      }
    }
    p.pop();
  }

  // draws the start & end circles/arrows
  drawIneqLine() {
    var p = this.p;

    p.push();
    p.strokeWeight(p.width / 180);
    p.stroke(inequalityLineThemeColors.labelTextColor);

    // draw arrows and/or connecting line
    var lineDrawn = false;
    if (this.values.startIcon === "arrow") {
      p.line(this.xCoordMin, this.ineqLineHeight,
        this.xCoordMin + this.ineqIconRadius,
        this.ineqLineHeight + this.ineqIconRadius);
      p.line(this.xCoordMin, this.ineqLineHeight,
        this.xCoordMin + this.ineqIconRadius,
        this.ineqLineHeight - this.ineqIconRadius);
      p.line(this.xCoordMin, this.ineqLineHeight,
        this.endXpos, this.ineqLineHeight);
      lineDrawn = true;
    }
    if (this.values.endIcon === "arrow") {
      p.line(this.xCoordMax, this.ineqLineHeight,
        this.xCoordMax - this.ineqIconRadius,
        this.ineqLineHeight + this.ineqIconRadius);
      p.line(this.xCoordMax, this.ineqLineHeight,
        this.xCoordMax - this.ineqIconRadius,
        this.ineqLineHeight - this.ineqIconRadius);
      p.line(this.xCoordMax, this.ineqLineHeight,
        this.startXpos, this.ineqLineHeight);
      lineDrawn = true;
    }
    if (!lineDrawn) {
      p.line(this.startXpos, this.ineqLineHeight,
        this.endXpos, this.ineqLineHeight);
    }

    // draw start circle
    switch (this.values.startIcon) {
      case "closed-circle":
        p.fill(inequalityLineThemeColors.labelTextColor);
        p.ellipse(this.startXpos, this.ineqLineHeight,
          this.ineqIconRadius, this.ineqIconRadius);
        break;
      case "open-circle":
        p.fill(inequalityLineThemeColors.backgroundColor);
        p.ellipse(this.startXpos, this.ineqLineHeight,
          this.ineqIconRadius, this.ineqIconRadius);
        break;
    }

    // draw end circle
    switch (this.values.endIcon) {
      case "closed-circle":
        p.fill(inequalityLineThemeColors.labelTextColor);
        p.ellipse(this.endXpos, this.ineqLineHeight,
          this.ineqIconRadius, this.ineqIconRadius);
        break;
      case "open-circle":
        p.fill(inequalityLineThemeColors.backgroundColor);
        p.ellipse(this.endXpos, this.ineqLineHeight,
          this.ineqIconRadius, this.ineqIconRadius);
        break;
    }
  }

  // draws large icon choices in the middle of the screen
  drawIconsOptions() {
    var p = this.p;

    p.push();
    p.strokeWeight(p.width / 150);
    p.stroke(inequalityLineThemeColors.labelTextColor);

    // arrows example
    var arrowsCenterX = (p.width / 2) - this.popupIconSpacing;
    var dir = this.currentCirc == 0 ? -1 : 1;
    p.line(arrowsCenterX + (this.popupIconRadius * dir),
      this.popupIconHeight,
      arrowsCenterX,
      this.popupIconHeight + this.popupIconRadius);
    p.line(arrowsCenterX + (this.popupIconRadius * dir),
      this.popupIconHeight,
      arrowsCenterX,
      this.popupIconHeight - this.popupIconRadius);
    p.line(arrowsCenterX + this.popupIconRadius,
      this.popupIconHeight,
      arrowsCenterX - this.popupIconRadius,
      this.popupIconHeight);

    // closed circle example
    p.fill(inequalityLineThemeColors.labelTextColor);
    p.ellipse(p.width / 2, this.popupIconHeight,
      this.popupIconRadius * 2, this.popupIconRadius * 2);

    // open circle example
    p.fill(inequalityLineThemeColors.backgroundColor);
    p.ellipse((p.width / 2) + this.popupIconSpacing, this.popupIconHeight,
      this.popupIconRadius * 2, this.popupIconRadius * 2);

    // highlight selected circle/arrow
    p.stroke(inequalityLineThemeColors.circHighlightColor);
    p.strokeWeight(p.width / 200);
    p.noFill();

    var offset = p.width / 200;
    if (this.currentCirc == 0) {
      if (this.values.startIcon === "arrow") {
        p.line(this.xCoordMin - offset, this.ineqLineHeight,
          this.xCoordMin - offset + this.ineqIconRadius,
          this.ineqLineHeight + this.ineqIconRadius);
        p.line(this.xCoordMin - offset, this.ineqLineHeight,
          this.xCoordMin - offset + this.ineqIconRadius,
          this.ineqLineHeight - this.ineqIconRadius);
      } else {
        p.ellipse(this.startXpos, this.ineqLineHeight,
          this.ineqIconRadius * 1.25, this.ineqIconRadius * 1.25);
      }
    } else if (this.currentCirc == 1) {
      if (this.values.endIcon === "arrow") {
        p.line(this.xCoordMax + offset, this.ineqLineHeight,
          this.xCoordMax + offset - this.ineqIconRadius,
          this.ineqLineHeight + this.ineqIconRadius);
        p.line(this.xCoordMax + offset, this.ineqLineHeight,
          this.xCoordMax + offset - this.ineqIconRadius,
          this.ineqLineHeight - this.ineqIconRadius);
      } else {
        p.ellipse(this.endXpos, this.ineqLineHeight,
          this.ineqIconRadius * 1.25, this.ineqIconRadius * 1.25);
      }
    }
    p.pop();
  }

  // changes the currently selected icon to newIcon
  changeActiveIcon(newIcon) {
    var p = this.p;

    if (newIcon === "arrow" ||
      newIcon === "open-circle" ||
      newIcon === "closed-circle") {
      if (this.currentCirc == 0) {
        this.values.startIcon = newIcon;
        if (newIcon === "arrow") {
          this.values.start = this.lineMin;
        }
      } else if (this.currentCirc == 1) {
        this.values.endIcon = newIcon;
        if (newIcon === "arrow") {
          this.values.end = this.lineMax;
        }
      }
      this.resize();
      this.sendUpdates();
      this.showingIconOptions = false;
      return true;
    }
    return false;
  }

  // given a mouse position, returns the name of the popup icon under the mouse
  whichIcon(inputX, inputY) {
    var p = this.p;

    var selectedIcon = "none";

    if (this.showingIconOptions) {
      if (p.abs(inputY - this.popupIconHeight) < this.popupIconRadius) {
        if (p.abs(inputX - (p.width / 2)) <= this.popupIconRadius * 1.5) {
          selectedIcon = "closed-circle";
        } else if (p.abs((inputX + this.popupIconSpacing) - (p.width / 2)) <=
          this.popupIconRadius * 2) {
          selectedIcon = "arrow";
        } else if (p.abs((inputX - this.popupIconSpacing) - (p.width / 2)) <=
          this.popupIconRadius * 1.5) {
          selectedIcon = "open-circle";
        }
      }
    }

    if (p.abs(this.ineqLineHeight - inputY) < this.ineqIconRadius) {
      if (p.abs(this.startXpos - inputX) < this.ineqIconRadius) {
        selectedIcon = "start";
      } else if (p.abs(this.endXpos - inputX) < this.ineqIconRadius) {
        selectedIcon = "end";
      }
    }

    return selectedIcon;
  }

  // allows users to click and drag circles when set to interactive
  adjustCircle(circleNumber, targetX) {
    if (this.interactive) {
      var p = this.p;
      var updatedValue = p.map(targetX,
        this.xCoordMin, this.xCoordMax,
        this.lineMin, this.lineMax);

      updatedValue = Math.round(updatedValue);
      if (updatedValue % this.xaxis.increment != 0) {
        return;
      }

      switch (circleNumber) {
        case 0:
          if (updatedValue >= this.lineMin &&
            updatedValue < this.values.end &&
            this.values.startIcon !== "arrow") {
            this.values.start = updatedValue;
          }
          break;
        case 1:
          if (updatedValue <= this.lineMax &&
            updatedValue > this.values.start &&
            this.values.endIcon !== "arrow") {
            this.values.end = updatedValue;
          }
          break;
      }

      // apply adjustment
      this.sendUpdates();
      this.resize();
    }
  }

  // returns an array of start and end positions
  getStartEndPos() {
    return [this.startXpos, this.endXpos];
  }

  // update HTML outputs
  sendUpdates() {
    this.update([this.values.start,
      this.values.startIcon,
      this.values.end,
      this.values.endIcon
    ]);
  }

  // also used to recalculate scale/position
  resize() {
    var p = this.p;

    // recalculate data/position conversion variables
    this.xCoordMin = 0.5 * ((p.width - 30) / this.labelNumbs.length) + 15;
    this.xCoordMax = (this.labelNumbs.length - 0.5) *
      ((p.width) / this.labelNumbs.length) - 15;
    this.lineMin = this.labelNumbs[0];
    this.lineMax = this.labelNumbs[this.labelNumbs.length - 1];

    // recalculate x positions start and end
    this.startXpos = p.map(this.values.start,
      this.lineMin, this.lineMax,
      this.xCoordMin, this.xCoordMax);
    this.endXpos = p.map(this.values.end,
      this.lineMin, this.lineMax,
      this.xCoordMin, this.xCoordMax);


    // recalculate size and position variables, top block is touch values
    if (inequalityLineTouchMode) {
		this.ineqLineHeight = p.height * (4 / 7);
		this.ineqIconRadius = p.width / 18;
      
		this.popupIconHeight = p.height * (2 / 10);
		this.popupIconRadius = p.width / 25;
		this.popupIconSpacing = p.width / 5;
	  
    } else {
		this.ineqLineHeight = p.height * (4.5 / 7);
		this.ineqIconRadius = p.width / 30;
      
		this.popupIconHeight = p.height * (3 / 10);
		this.popupIconRadius = p.width / 35;
		this.popupIconSpacing = p.width / 5;
    }

  }

  // handle interactivety for the widget and avoid touch/mouse conflicts
  handleClick(clickX, clickY) {
    var p = this.p;

    if (this.showingIconOptions) {
      this.changeActiveIcon(this.whichIcon(clickX, clickY));
      this.showingIconOptions = false;
    } else {
      this.currentCirc = -1;

      if (p.abs(clickY - this.ineqLineHeight) < p.max(15, p.width / 40)) {
        if (p.abs(clickX - this.startXpos) < p.max(15, p.width / 50)) {
          this.currentCirc = 0;
        } else if (p.abs(clickX - this.endXpos) < p.max(15, p.width / 50)) {
          this.currentCirc = 1;
        }
      }

      if (this.currentCirc >= 0) {
        this.showingIconOptions = !this.showingIconOptions;
      }
    }
  }
}
