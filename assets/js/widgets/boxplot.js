let boxPlotThemeColors;

const runBoxPlotWidget = ({container, xaxis, values, outliers, interactive}) => {
  const node = document.getElementById(container);

  const answerHiddenInput = document.createElement("input");

  // Configure the hidden input
  answerHiddenInput.type = "hidden";
  answerHiddenInput.name = "answers[]";

  // Insert the hidden input into the html
  if(interactive) node.append(answerHiddenInput);

  const updateHiddenInputs = (output) => {
    if(!interactive) return 

    answerHiddenInput.value = encodeURIComponent(JSON.stringify(output))
  }

  const heightToWidthRatio = 5 / 8;

  const getThemeColors = (theme) => {
    // Edit these colors to change the colors
    // of specific elements of the pie chart
    const themes = {
      "light": {
        backgroundColor: "#f5f7fa",
        labelTextColor: "#000000",
        boxFillColor: "#00ACED"
      },
      "dark": {
        backgroundColor: "#1D2126",
        labelTextColor: "#FFFFFF",
        boxFillColor: "#FF8F41"
      }
    }

    return themes[theme];
  }

  const defaultTheme = "light";

  const setThemeColors = (theme) => {
    boxPlotThemeColors = getThemeColors(theme);
  }

  // Define global variables that contain colors used by the widget
  setThemeColors(defaultTheme);

  // Change the theme colors when the document theme is changed
  document.addEventListener("themeset", (event) => {
    setThemeColors(event.detail.newTheme)
  })

  const getHeightOfCanvas = () => {
    const windowHeight = window.innerHeight || document.documentElement.clientHeight ||
      document.body.clientHeight
    const maxHeight = windowHeight * (5.5 / 10)

    let height = node.clientWidth * heightToWidthRatio

    if (height > maxHeight) {
      height = maxHeight
    }

    return height
  }

  let dims = {
    w: node.clientWidth,
    h: getHeightOfCanvas()
  }

  let bplot;
  
  var creationData = {
    xaxis: xaxis,
    values: values,
    outliers: outliers,
    interactive: interactive
  };

  let closestBar = -1;

  // Define the p5 sketch methods
  const sketch = p => {
    p.setup = () => {
      var c = p.createCanvas(dims.w, dims.h)
      bplot = new BoxPlot(creationData, p, updateHiddenInputs);
    }

    p.draw = () => {
      p.clear()
      bplot.draw()
    }

    // set the current bar to drag on mouseMove
    p.mouseMoved = () => {
      if (interactive) {
        p.closestBar = -1;
        if (p.mouseY > (p.height * (2.5 / 7)) &&
          p.mouseY < (p.height * (4.5 / 7))) {
          var barsXpos = bplot.getVerticalBarsXPos();
          var closestBarDist = p.width;
          for (var i = 0; i < barsXpos.length; i++) {
            var mouseDiff = p.abs(p.mouseX - barsXpos[i]);
            if (mouseDiff < 18 && mouseDiff < closestBarDist) {
              closestBarDist = p.abs(p.mouseX - barsXpos[i]);
              p.closestBar = i;
            }
          }
        }

        //update cursor
        try {
          if (interactive && p.closestBar >= 0) {
            p.cursor("col-resize");
          } else {
            p.cursor("default");
          }
        } catch (e) {
          // Prevents any crashes
        }
      }
    }

    // while dragging, send the mouseX to the bplot for adjsuting
    p.mouseDragged = () => {
      if (interactive) {
        if (p.closestBar >= 0) {
          bplot.adjustBar(p.closestBar, p.mouseX);
          return false; // Prevent accidental scrolling
        }
      }
    }

    // set the closest bar when a touch is started
    p.touchStarted = () => {
      if (interactive && p.touches[0]) {
        p.closestBar = -1;
        if (p.touches[0].y > (p.height * (2.5 / 7)) &&
          p.touches[0].y < (p.height * (4.5 / 7))) {
          var barsXpos = bplot.getVerticalBarsXPos();
          var closestBarDist = p.width;
          for (var i = 0; i < barsXpos.length; i++) {
            var touchDiff = p.abs(p.touches[0].x - barsXpos[i]);
            if (touchDiff < 50 && touchDiff < closestBarDist) {
              closestBarDist = p.abs(p.mouseX - barsXpos[i]);
              p.closestBar = i;
            }
          }
        }
      }
    }

    // while touch is dragging, send touch x to bplot
    p.touchDragged = (e) => {
      if(!e.cancelable) return;

      if(!interactive) return;
      
      if (p.closestBar >= 0) {
        bplot.adjustBar(p.closestBar, p.touches[0].x);
        
        return false; // Prevent accidental scrolling
      }
    }


    p.windowResized = () => {
      p.resizeCanvas(0, 0)

      dims = {
        w: node.clientWidth,
        h: getHeightOfCanvas()
      }

      p.resizeCanvas(dims.w, dims.h)

      bplot.resize()
    }
  }

  // Create the canvas and run the sketch in the html node.
  new p5(sketch, node)
}

class BoxPlot {
  constructor(data, p, update) {
    this.p = p;

    this.xaxis = data.xaxis;
    this.values = data.values;
    this.outliers = data.outliers.sort();
    this.interactive = data.interactive;

    this.update = update;


    // data validation
    if (this.xaxis.start >= this.xaxis.end || this.xaxis.increment < 1) {
      throw "Error: invalid x-axis parameters";
    }
    var valuesArray = [this.values.minimum,
      this.values.lowerquartile,
      this.values.median,
      this.values.upperquartile,
      this.values.maximum
    ];
    for (let i = 0; i < valuesArray.length - 1; i++) {
      if (valuesArray[i] > valuesArray[i + 1]) {
        throw "Error: invalid plot values";
      }
    }
    for (let j = 0; j < this.outliers.length; j++) {
      if (this.outliers[j] > this.values.minimum && this.outliers[j] < this.values.maximum) {
        throw "Error: invalid outlier value:" + this.outliers[j];
      }
    }

    // creates an array of a range of numbers specified by the start, end, and increment
    var labelNumbs = [];
    if (this.xaxis.increment > 0 && this.xaxis.start < this.xaxis.end) {
      for (let i = this.xaxis.start; i <= this.xaxis.end; i += this.xaxis.increment) {
        labelNumbs.push(i);
      }
    }
    this.labelNumbs = labelNumbs;
    this.drawnNumbs = [];

    // variables for converting between data values and x coordinates
    this.xCoordMin = 0.5 * ((p.width - 30) / this.labelNumbs.length) + 15;
    this.xCoordMax = (this.labelNumbs.length - 0.5) * ((p.width) / this.labelNumbs.length) - 15;
    this.lineMin = this.labelNumbs[0];
    this.lineMax = this.labelNumbs[this.labelNumbs.length - 1];

    // calculate x positions of vertical bars
    this.minXpos = p.map(this.values.minimum,
      this.lineMin, this.lineMax,
      this.xCoordMin, this.xCoordMax);
    this.lowQuartXpos = p.map(this.values.lowerquartile,
      this.lineMin, this.lineMax,
      this.xCoordMin, this.xCoordMax);
    this.medianXpos = p.map(this.values.median,
      this.lineMin, this.lineMax,
      this.xCoordMin, this.xCoordMax);
    this.uppQuartXpos = p.map(this.values.upperquartile,
      this.lineMin, this.lineMax,
      this.xCoordMin, this.xCoordMax);
    this.maxXpos = p.map(this.values.maximum,
      this.lineMin, this.lineMax,
      this.xCoordMin, this.xCoordMax);

    // update HTML outputs
    this.update([this.values.minimum,
      this.values.lowerquartile,
      this.values.median,
      this.values.upperquartile,
      this.values.maximum
    ]);
  }

  draw() {
    var p = this.p;
    var bg = boxPlotThemeColors.backgroundColor;

    p.background(bg);

    this.drawNumberline();
    this.drawBoxFeatures();
    this.drawOutliers();
  }

  drawNumberline() {
    var p = this.p;
    p.push();
    p.stroke(boxPlotThemeColors.labelTextColor);
    p.fill(boxPlotThemeColors.labelTextColor);

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
          p.line(xpos, p.height * (4.1 / 5), xpos, p.height * (3.9 / 5));
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

  drawBoxFeatures() {
    var p = this.p;
    p.push();
    p.rectMode(p.CORNERS);
    p.stroke(boxPlotThemeColors.labelTextColor);
    p.strokeWeight(5 * p.width / 1000);
    p.fill(boxPlotThemeColors.boxFillColor);

    var yMin = p.height * (2.5 / 7);
    var yMed = p.height * (3.5 / 7);
    var yMax = p.height * (4.5 / 7);

    // draw lines & rects
    p.line(this.minXpos, yMin, this.minXpos, yMax);
    p.line(this.minXpos, yMed, this.lowQuartXpos, yMed);
    p.rect(this.lowQuartXpos, yMin, this.medianXpos, yMax);
    p.rect(this.medianXpos, yMin, this.uppQuartXpos, yMax);
    p.line(this.uppQuartXpos, yMed, this.maxXpos, yMed);
    p.line(this.maxXpos, yMin, this.maxXpos, yMax);
  }

  drawOutliers() {
    var p = this.p;
    var yMed = p.height * 0.5;

    this.outliers.forEach(function(outlier) {
      var outlierXpos = p.map(outlier, this.lineMin, this.lineMax, this.xCoordMin, this.xCoordMax);
      var offset = 7 * p.width / 1000;

      // draw an "x" from two lines
      p.line(outlierXpos - offset,
        yMed - offset,
        outlierXpos + offset,
        yMed + offset);
      p.line(outlierXpos - offset,
        yMed + offset,
        outlierXpos + offset,
        yMed - offset);
    }, this);
  }


  // returns an array of each bar's x posistion
  getVerticalBarsXPos() {
    return [this.minXpos, this.lowQuartXpos, this.medianXpos, this.uppQuartXpos, this.maxXpos];
  }

  // allows users to click and drag bars when set to interactive
  adjustBar(barNumber, targetX) {
    if (this.interactive) {
      var p = this.p;
      var updatedValue = p.map(targetX,
        this.xCoordMin, this.xCoordMax,
        this.lineMin, this.lineMax);

      updatedValue = Math.round(updatedValue);
      if (updatedValue % this.xaxis.increment != 0) {
        return;
      }

      switch (barNumber) {
        case 0:
          if (updatedValue < this.values.lowerquartile &&
            updatedValue >= this.lineMin) {
            if (this.outliers.length > 0) {
              var leftOutliers = this.outliers.filter((outlier) => {
                return outlier < this.values.median;
              });
              if (updatedValue - 0.15 >
                leftOutliers[leftOutliers.length - 1]) {
                this.values.minimum = updatedValue;
              }
            } else {
              this.values.minimum = updatedValue;
            }
          }
          break;
        case 1:
          if (updatedValue > this.values.minimum &&
            updatedValue < this.values.median) {
            this.values.lowerquartile = updatedValue;
          }
          break;
        case 2:
          if (updatedValue > this.values.lowerquartile &&
            updatedValue < this.values.upperquartile) {
            this.values.median = updatedValue;
          }
          break;
        case 3:
          if (updatedValue > this.values.median &&
            updatedValue < this.values.maximum) {
            this.values.upperquartile = updatedValue;
          }
          break;
        case 4:
          if (updatedValue > this.values.upperquartile &&
            updatedValue <= this.lineMax) {
            if (this.outliers.length > 0) {
              var rightOutliers = this.outliers.filter((outlier) => {
                return outlier > this.values.median;
              });
              if ((updatedValue + 0.15) < rightOutliers[0]) {
                this.values.maximum = updatedValue;
              }
            } else {
              this.values.maximum = updatedValue;
            }
          }
          break;
      }

      // update HTML outputs
      this.update([this.values.minimum,
        this.values.lowerquartile,
        this.values.median,
        this.values.upperquartile,
        this.values.maximum
      ]);

      // apply adjustment
      this.resize();
    }
  }

  // also used to recalculate scale/position
  resize() {
    var p = this.p;

    // recalculate data/position conversion variables
    this.xCoordMin = 0.5 * ((p.width - 30) / this.labelNumbs.length) + 15;
    this.xCoordMax = (this.labelNumbs.length - 0.5) * ((p.width) / this.labelNumbs.length) - 15;
    this.lineMin = this.labelNumbs[0];
    this.lineMax = this.labelNumbs[this.labelNumbs.length - 1];

    // recalculate veritcal bar positions
    this.minXpos = p.map(this.values.minimum,
      this.lineMin, this.lineMax,
      this.xCoordMin, this.xCoordMax);
    this.lowQuartXpos = p.map(this.values.lowerquartile,
      this.lineMin, this.lineMax,
      this.xCoordMin, this.xCoordMax);
    this.medianXpos = p.map(this.values.median,
      this.lineMin, this.lineMax,
      this.xCoordMin, this.xCoordMax);
    this.uppQuartXpos = p.map(this.values.upperquartile,
      this.lineMin, this.lineMax,
      this.xCoordMin, this.xCoordMax);
    this.maxXpos = p.map(this.values.maximum,
      this.lineMin, this.lineMax,
      this.xCoordMin, this.xCoordMax);
  }
}
