var backgroundColor, labelTextColor;

// a boolean for telling when in mobile mode
const mobileMode = ('ontouchstart' in window) ||
  (navigator.maxTouchPoints > 0) ||
  (navigator.msMaxTouchPoints > 0);

// ensure angle label has degree symbol
if(angleLabel != null && angleLabel !== "" && !angleLabel.includes("°")){
  angleLabel += "°";
}

const createThreeDimShapeWidget = () => {
  const node = document.getElementById('widget-container');

  const heightToWidthRatio = 5 / 8;
  const getThemeColors = (theme) => {
    // colors of the background and labels
    const themes = {
      "light": {
        backgroundColor: "#f5f7fa",
        labelTextColor: "#000000",
      },
      "dark": {
        backgroundColor: "#1D2126",
        labelTextColor: "#FFFFFF",
      }
    }
    return themes[theme];
  }

  const defaultTheme = "dark";

  const setThemeColors = (theme) => {
    const themeColors = getThemeColors(theme);

    backgroundColor = themeColors.backgroundColor;
    labelTextColor = themeColors.labelTextColor;
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

    let canvasHeight = node.clientWidth * heightToWidthRatio;

    canvasHeight = canvasHeight > maxHeight ? maxHeight : canvasHeight;

    return canvasHeight;
  }

  let dims = {
    w: node.clientWidth,
    h: getHeightOfCanvas()
  }

  // Define the p5 sketch methods
  const sketch = p => {
    p.setup = () => {
      var c = p.createCanvas(dims.w, dims.h)
      p.widget = new ThreeDimShapeWidget(p);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(p.height / 20);
      p.strokeWeight(2);
    }

    p.draw = () => {
      p.clear();
      p.widget.draw();
    }

    p.arrowTippedLine = (x1, y1, x2, y2, oneSided = false) => {
      p.push();
      p.stroke(labelTextColor);

      //line
      var point1Vec = p.createVector(x1, y1);
      var point2Vec = p.createVector(x2, y2);
      p.line(point1Vec.x, point1Vec.y, point2Vec.x, point2Vec.y)

      //first arrow head
      var rayVec = p5.Vector.sub(point2Vec, point1Vec).
      setMag(p.height / 18).rotate(p.PI / 6);
      var tempVec = p5.Vector.add(point1Vec, rayVec);
      p.line(point1Vec.x, point1Vec.y, tempVec.x, tempVec.y);
      rayVec.rotate(-p.PI / 3);
      tempVec = p5.Vector.add(point1Vec, rayVec);
      p.line(point1Vec.x, point1Vec.y, tempVec.x, tempVec.y);

      if(!oneSided){
      //second arrow head
      rayVec.mult(-1);
      tempVec = p5.Vector.add(point2Vec, rayVec);
      p.line(point2Vec.x, point2Vec.y, tempVec.x, tempVec.y);
      rayVec.rotate(p.PI / 3);
      tempVec = p5.Vector.add(point2Vec, rayVec);
      p.line(point2Vec.x, point2Vec.y, tempVec.x, tempVec.y);
      }
      p.pop();
    }

    p.drawDottedLine = (x1, y1, x2, y2, numb = 12) => {
      for (let i = 0; i <= numb; i++) {
        p.point(p.lerp(x1, x2, i / numb), p.lerp(y1, y2, i / numb));
      }
    }
    
    p.drawDottedArc = (x1, y1, x2, y2, h, numb = 12) => {
      for (let i = 0; i <= numb; i++) {
        let pX = p.lerp(x1, x2, i / numb);
        let pY = p.lerp(y1, y2, i / numb);
        let hFactor = p.sqrt(1 - p.pow((i/numb*2) - 1, 2));
        pY -= h * hFactor;
        p.point(pX, pY)
      }
    }

    p.windowResized = () => {

      dims = {
        w: node.clientWidth,
        h: getHeightOfCanvas()
      }

      p.resizeCanvas(dims.w, dims.h)
      p.textSize(p.height / 20);
      p.widget.resize()
    }
  }

  // Create the canvas and run the sketch in the html node.
  new p5(sketch, node)
}

createThreeDimShapeWidget();

// manager class that creates the required shape object and passes off touches/events to it
class ThreeDimShapeWidget {
  constructor(p) {
    this.p = p;
    this.acceptingInput = false;
    this.lastClickedLabel = -1;

    this.shape = null;
    switch (shapeType) {
      case "cube":
        this.shape = new CubeDiagram(p);
        break;
      case "cuboid":
        this.shape = new CuboidDiagram(p);
        break;
      case "square-pyramid":
        this.shape = new SquarePyramidDiagram(p);
        break;
      case "triangle-pyramid":
        this.shape = new TrianglePyramidDiagram(p);
        break;
      case "cylinder":
        this.shape = new CylinderDiagram(p);
        break;
      case "cone":
        this.shape = new ConeDiagram(p);
        break;
      case "sphere":
        this.shape = new SphereDiagram(p);
        break;
      case "prism":
        this.shape = new PrismDiagram(p);
        break;
      case "icecream-cone":
        this.shape = new IceCreamConeDiagram(p);
        break;
    }
  }

  draw() {
    var p = this.p;
    
    p.background(backgroundColor);
    this.shape.drawShape();
    this.shape.drawLabels();
  }

  resize() {
    this.shape.resize()
  }
}

