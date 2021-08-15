let anglesBackgroundColor, anglesLabelTextColor;

const runAngleWidget = (values) => {
  const node = document.getElementById(values.container);

  // set the height-to-width ratio based on angle mode, circle or line
  const heightToWidthRatio = values.type === "circle" ? 5 / 8 : 5 / 8;

  const getThemeColors = (theme) => {
    // colors of the background and labels
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
    return themes[theme];
  }

  const defaultTheme = "light";

  const setThemeColors = (theme) => {
    const themeColors = getThemeColors(theme);

    anglesBackgroundColor = themeColors.backgroundColor;
    anglesLabelTextColor = themeColors.labelTextColor;
    circHighlightColor = themeColors.circHighlightColor;
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
    values: values,
  };

  let angleWidget

  // Define the p5 sketch methods
  const sketch = p => {
    p.setup = () => {
      p.createCanvas(dims.w, dims.h)
      angleWidget = new AnglesWidget(creationData, p);
    }

    p.draw = () => {
      p.clear();
      angleWidget.draw();
    }

    p.windowResized = () => {
      p.resizeCanvas(0, 0)

      dims = {
        w: node.clientWidth,
        h: getHeightOfCanvas()
      }

      p.resizeCanvas(dims.w, dims.h)
      angleWidget.resize()
    }
  }

  // Create the canvas and run the sketch in the html node.
  new p5(sketch, node)
}

class AnglesWidget {
  constructor(data, p) {
    this.p = p;

    this.values = data.values;

    // a boolean for telling when in mobile mode
    this.anglesMobileMode = ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0);

    // variables for position and size, calculated in resize()
    this.centVec = null;
    this.spokeRadius = null;
    this.hubRadius = null;
    this.resize();

    // color codes for the arc fills
    this.colors = [p.color("#00aced"),
      p.color("#f26363"),
      p.color("#69b516"),
      p.color("#313b72"),
      p.color("#ff8f41"),
      p.color("#ffb30f"),
      p.color("#7d5bA6")
    ];

    // Align the text centrally
    p.textAlign(p.CENTER, p.CENTER);
  }

  draw() {
    var p = this.p;
    var bg = anglesBackgroundColor;

    p.background(bg);

    this.drawAngles();

    // Update the text color to match the theme
    p.fill(anglesLabelTextColor);
  }

  drawAngles() {
    var p = this.p;
    p.push();

    // sets spoke and arc line width/color
    p.strokeWeight((p.min(7, p.width / 150)));
    p.stroke(anglesLabelTextColor);

    // variables for indexing and keeping track of stuff
    var spokeVec = p5.Vector.fromAngle(0).mult(this.spokeRadius);
    var arcStart = 0;
    var colorIndex = 0;
    var angleSum = 0;
    var variableAngles = [];

    p.translate(this.centVec.x, this.centVec.y);
    p.line(0, 0, spokeVec.x, spokeVec.y);

    // draw the inputted angles
    this.values.angles.forEach((angle, i) => {
      if (typeof(angle) === "number") {
        var arcAngle = p.radians(angle) * -1;
        var labelOffset = p.map(i, 0, this.values.angles.length, 0.75, 1);
        var arcHeight = this.spokeRadius * (labelOffset * 0.65) * 2;

        /* draw the label outside the circle if
         angle is less than 20 or on mobile mode */
        labelOffset = angle < 20 || this.anglesMobileMode ? 1.1 : labelOffset;

        // draw arc
        p.push();
        p.fill(this.colors[colorIndex % this.colors.length]);
        colorIndex++;
        if (angle == 90) {
          p.rotate(arcStart + arcAngle);
          let rectSize = spokeVec.mag() / 2.5;
          p.rect(0, 0, rectSize, rectSize);
        } else {
          p.arc(0, 0, arcHeight, arcHeight, arcStart + arcAngle, arcStart);
        }
        p.pop();

        // draw spoke and label
        p.line(0, 0, spokeVec.x, spokeVec.y);
        spokeVec.mult(labelOffset).rotate(arcAngle / 2);
        p.push();
        p.noStroke();
        p.text("" + angle + "°", spokeVec.x, spokeVec.y);
        p.pop();
        spokeVec.div(labelOffset).rotate(arcAngle / 2);
        p.line(0, 0, spokeVec.x, spokeVec.y);

        arcStart += arcAngle;
        angleSum += angle;
      } else {
        variableAngles.push(angle);
      }
    });

    var fillerAngle = this.values.type === "circle" ?
      -(p.TWO_PI + arcStart) / variableAngles.length :
      -(p.PI + arcStart) / variableAngles.length

    // draws the remaining "blank" variables
    if (!(this.values.type === "line" && angleSum >= 180)) {
      variableAngles.forEach((angle, i) => {
        let labelOffset = 0.9;
        let arcHeight = this.spokeRadius * (labelOffset * 0.8) * 2

        // draw the label outside the circle if
        // angle is less than 20 or on mobile mode
        labelOffset = angle < 20 || this.anglesMobileMode ? 1.1 : labelOffset;

        // arc
        p.push();
        p.fill(this.colors[colorIndex % this.colors.length]);
        colorIndex++;
        p.arc(0, 0, arcHeight, arcHeight, arcStart + fillerAngle, arcStart);
        p.pop();

        // spoke & label
        p.line(0, 0, spokeVec.x, spokeVec.y);
        spokeVec.mult(labelOffset).rotate(fillerAngle / 2);
        p.push();
        p.noStroke();
        p.text("" + angle + "°", spokeVec.x, spokeVec.y);
        p.pop();
        spokeVec.div(labelOffset).rotate(fillerAngle / 2);
        p.line(0, 0, spokeVec.x, spokeVec.y);

        arcStart += fillerAngle;
      });
    }

    // draw the center circle
    p.ellipse(0, 0, this.hubRadius, this.hubRadius);
    p.pop();
  }

  // recalculate size and position variables on resize
  resize() {
    var p = this.p;

    //text size, last two numbs are min/max font size
    p.textSize(p.map(p.height, 180, 360, 14, 28, true));

    if (this.values.type === "circle") {
      if (this.anglesMobileMode) {
        // circle mode, mobile
        this.centVec = p.createVector(p.width / 2, p.height / 2)
        this.spokeRadius = p.height / 2.5;
        this.hubRadius = p.height / 8;
      } else {
        // circle mode, non-mobile
        this.centVec = p.createVector(p.width / 2, p.height / 2)
        this.spokeRadius = p.height / 2.5;
        this.hubRadius = p.height / 20;
      }
    } else if (this.values.type === "line") {
      if (this.anglesMobileMode) {
        // line mode, mobile
        this.centVec = p.createVector(p.width / 2, p.height * (3 / 4));
        this.spokeRadius = p.height / 2.2;
        this.hubRadius = p.height / 8;
      } else {
        // line mode, non-mobile
        this.centVec = p.createVector(p.width / 2, p.height * (3 / 4));
        this.spokeRadius = p.height / 2.2;
        this.hubRadius = p.height / 20;
      }
    }
  }
}
