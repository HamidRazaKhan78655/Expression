var backgroundColor, labelTextColor;
var loadedFont;

// a boolean for telling when in mobile mode
const mobileMode =
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0;

const createCubePlotWidget = () => {
  const cubeNode = document.getElementById(nodeIDs.cubes);
  const planNode = document.getElementById(nodeIDs.plans);

  const heightToWidthRatio = (2 * 5) / 8;
  const getHeightOfCanvas = () => {
    const windowHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    const maxHeight = windowHeight * (5.5 / 10);

    let canvasHeight = cubeNode.clientWidth * heightToWidthRatio;

    canvasHeight = canvasHeight > maxHeight ? maxHeight : canvasHeight;

    return canvasHeight;
  };

  let dims = {
    w: cubeNode.clientWidth,
    h: getHeightOfCanvas(),
  };

  const defaultTheme = "dark";

  const getThemeColors = (theme) => {
    // colors of the background and labels
    const themes = {
      light: {
        backgroundColor: "#f5f7fa",
        labelTextColor: "#000000",
      },
      dark: {
        backgroundColor: "#1D2126",
        labelTextColor: "#FFFFFF",
      },
    };
    return themes[theme];
  };

  const setThemeColors = (theme) => {
    const themeColors = getThemeColors(theme);

    backgroundColor = themeColors.backgroundColor;
    labelTextColor = themeColors.labelTextColor;
  };

  // Define global variables that contain colors used by the widget
  setThemeColors(defaultTheme);

  // Change the theme colors when the document theme is changed
  document.addEventListener("themeset", (event) => {
    setThemeColors(event.detail.newTheme);
  });

  // Define the p5 sketch methods for the 3D cube plot
  const cubeSketch = (p) => {
    p.preload = () => {
      p.loadFont(
        "https://use.typekit.net/af/5da8b8/00000000000000007735bb1e/30/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n3&v=3",
        (font) => {
          loadedFont = font;
          console.log("font loaded");
        }
      );
    };

    p.setup = () => {
      var c = p.createCanvas(dims.w, dims.h, p.WEBGL);
      p.widget = new CubePlotWidget(p);
      p.prevTouch = p.createVector(0, 0);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(dims.h / 12);
      p.textFont(loadedFont);
    };

    p.touchStarted = () => {
      p.prevTouch = p.createVector(p.mouseX, p.mouseY);
    };

    p.touchMoved = () => {
      //send drag to widget
      p.widget.handleDrag(p.mouseX - p.prevTouch.x, p.mouseY - p.prevTouch.y);
      p.prevTouch.x = p.mouseX;
      p.prevTouch.y = p.mouseY;
    };

    p.draw = () => {
      p.clear();
      p.widget.draw();
    };

    p.windowResized = () => {
      dims = {
        w: cubeNode.clientWidth,
        h: getHeightOfCanvas(),
      };

      p.resizeCanvas(dims.w, dims.h);
      p.textSize(dims.h / 12);
      p.widget.resize();
    };
  };

  const elevationSketch = (p) => {
    p.setup = () => {
      var c = p.createCanvas(dims.w, dims.h);
      p.widget = new ElevationWidget(p);
    };

    p.draw = () => {
      p.clear();
      p.widget.draw();
    };

    p.mousePressed = () => {
      p.widget.handleClick(p.mouseX, p.mouseY);
    };

    p.touchStarted = () => {
      p.widget.handleClick(p.mouseX, p.mouseY);
    };

    p.touchEnded = () =>{
      return false;
    }

    p.windowResized = () => {
      dims = {
        w: cubeNode.clientWidth,
        h: getHeightOfCanvas(),
      };

      p.resizeCanvas(dims.w, dims.h);
      p.textSize(p.height / 20);
      p.widget.resize();
    };
  };

  // Create the canvas and run the sketch in the html node.
  new p5(cubeSketch, cubeNode);
  new p5(elevationSketch, planNode);
};

createCubePlotWidget();

class CubePlotWidget {
  constructor(p) {
    this.p = p;
    this.cubeCoords = [];
    this.calculateCoords();
    this.sideLength = null;
    this.cameraXrot = 0;
    this.cameraYrot = 0;
    this.resize();
  }

  resize() {
    this.sideLength = this.p.height / 7;
  }

  handleDrag(dx, dy) {
    this.cameraXrot += dx * 0.01;
    this.cameraYrot += dy * 0.01;
  }

  draw() {
    var p = this.p;
    p.background(backgroundColor);

    // draw the 3D platform labels
    p.push();
    p.noStroke();
    p.fill(labelTextColor);
    let sides = ["front", "left", "back", "right"];
    p.rotateX(p.QUARTER_PI * 1.5);
    p.rotateZ(-p.QUARTER_PI);
    //rotate to touch orbit controls
    if (mobileMode) {
      p.rotateZ(-this.cameraXrot);
    }
    p.translate(0, 0, -this.sideLength / 2);
    sides.forEach((side) => {
      p.rotateZ(p.HALF_PI);
      p.push();

      p.translate(0, this.sideLength * 1.85);
      p.text(side, 0, 0);
      p.pop();
    });
    p.pop();

    // 3d enviroment and style
    p.directionalLight(200, 200, 200, 2, 2, -1);
    p.ambientLight(100);
    p.orbitControl(1, 1, 0.2);
    p.stroke(labelTextColor);
    p.strokeWeight(3);
    p.fill(255, 0, 0);

    // draw cube platform
    p.push();
    //isometric rotation
    p.rotateX(p.QUARTER_PI * 1.5);
    p.rotateZ(p.QUARTER_PI);
    //rotate to touch orbit controls
    if (mobileMode) {
      p.rotateZ(-this.cameraXrot);
    }
    this.cubeCoords.forEach((cubeCoord) => {
      p.push();
      p.translate(
        cubeCoord[0] * this.sideLength,
        cubeCoord[1] * this.sideLength,
        cubeCoord[2] * this.sideLength
      );
      p.box(this.sideLength);
      p.pop();
    });
    p.pop();
  }

  calculateCoords() {
    this.cubeCoords = [];
    cubePositions.forEach((posCode) => {
      let cubeZ = 0;
      if (posCode > 9) {
        cubeZ = 1;
        posCode -= 9;
      }
      let cubeY = this.p.ceil(posCode / 3) - 2;
      let cubeX = (posCode % 3) - 2;
      cubeX = cubeX == -2 ? 1 : cubeX;
      this.cubeCoords.push([cubeX, cubeY, cubeZ]);
    });
  }
}

class ElevationWidget {
  constructor(p) {
    this.p = p;
    this.frontViewNumbs = [];
    this.rightViewNumbs = [];
    this.topViewNumbs = [];
    this.interactiveViewNumbs = [];
    this.planOutput = [];
    this.views = {};
    this.tileSize = null;
    this.outputNode = document.getElementById(nodeIDs.output);
    this.resize();

    if (!interactive) {
      this.calculateViews();
    }
  }

  resize() {
    var p = this.p;
    p.textSize(p.height / 18);
    p.textAlign(p.CENTER, p.CENTER);

    this.views = {
      front: null,
      right: null,
      top: null,
    };
    let centVec = p.createVector(p.width / 2, p.height / 2);

    // positions for showing all three
    if (showPlan.front && showPlan.right && showPlan.top) {
      this.tileSize = p.height / 12;
      this.views.front = centVec
        .copy()
        .add(-4 * this.tileSize, -4 * this.tileSize);

      this.views.right = centVec.copy().add(this.tileSize, -4 * this.tileSize);

      this.views.top = centVec
        .copy()
        .add(-1.5 * this.tileSize, 1 * this.tileSize);
    }

    // positions for top view and one side view
    if (
      showPlan.top &&
      (showPlan.right || showPlan.front) &&
      !(showPlan.right && showPlan.front)
    ) {
      this.tileSize = p.height / 10;

      this.views.top = centVec
        .copy()
        .add(-1.5 * this.tileSize, 0 * this.tileSize);

      this.views.front = centVec
        .copy()
        .add(-1.5 * this.tileSize, -4 * this.tileSize);

      this.views.right = this.views.front;
    }

    // positions for two side views only
    if (!showPlan.top && showPlan.right && showPlan.front) {
      this.tileSize = p.height / 8;

      this.views.front = centVec
        .copy()
        .add(-4 * this.tileSize, -1 * this.tileSize);

      this.views.right = centVec
        .copy()
        .add(1 * this.tileSize, -1 * this.tileSize);
    }

    // positions for one view
    if (
      (showPlan.top && !showPlan.right && !showPlan.front) ||
      (!showPlan.top && showPlan.right && !showPlan.front) ||
      (!showPlan.top && !showPlan.right && showPlan.front)
    ) {
      this.tileSize = p.height / 6;
      p.textSize(p.height / 12);
      this.views.top = centVec
        .copy()
        .add(-1.5 * this.tileSize, -2 * this.tileSize);
      this.views.front = centVec
        .copy()
        .add(-1.5 * this.tileSize, -1.5 * this.tileSize);
      this.views.right = this.views.front;
    }
  }

  draw() {
    let p = this.p;
    p.background(backgroundColor);
    p.stroke(labelTextColor);
    p.noFill();

    if (showPlan.front) {
      this.drawSideView(this.views.front.x, this.views.front.y, "front");
    }

    if (showPlan.right) {
      this.drawSideView(this.views.right.x, this.views.right.y, "right");
    }

    if (showPlan.top) {
      this.drawTopView(this.views.top.x, this.views.top.y);
    }
  }

  drawSideView(x, y, side) {
    let p = this.p;
    let viewNumbs =
      side === "front" ? this.frontViewNumbs : this.rightViewNumbs;
    p.push();
    p.translate(x, y);
    for (let i = 1; i < 7; i++) {
      p.push();
      if (i > 3) {
        p.translate((i - 4) * this.tileSize, this.tileSize);
      } else {
        p.translate((i - 1) * this.tileSize, 0);
      }

      if (viewNumbs.includes(i)) {
        p.fill(255, 0, 0);
      }

      p.rect(0, 0, this.tileSize, this.tileSize);
      p.pop();
    }
    p.fill(labelTextColor);
    p.noStroke();
    p.text(side + " view", this.tileSize * 1.5, this.tileSize * 2.7);
    p.pop();
  }

  drawTopView(x, y, side) {
    let p = this.p;
    p.push();
    p.translate(x, y);
    for (let i = 1; i < 10; i++) {
      p.push();
      if (i > 6) {
        p.translate((i - 7) * this.tileSize, this.tileSize * 2);
      } else if (i > 3) {
        p.translate((i - 4) * this.tileSize, this.tileSize);
      } else {
        p.translate((i - 1) * this.tileSize, 0);
      }

      if (this.topViewNumbs.includes(i)) {
        p.fill(255, 0, 0);
      }

      p.rect(0, 0, this.tileSize, this.tileSize);
      p.pop();
    }
    p.fill(labelTextColor);
    p.noStroke();
    p.text("top view", this.tileSize * 1.5, this.tileSize * 3.7);
    p.pop();
  }

  calculateViews() {
    cubePositions.forEach((posCode) => {
      let cubeZ = 0;
      if (posCode > 9) {
        cubeZ = 1;
        posCode -= 9;
      }
      let cubeY = this.p.ceil(posCode / 3) - 2;
      let cubeX = (posCode % 3) - 2;
      cubeX = cubeX == -2 ? 1 : cubeX;

      let frontViewTile = cubeX + 2 + cubeZ * 3;
      let rightViewTile = -cubeY + 2 + cubeZ * 3;
      let topViewTile = (cubeY + 1) * 3 + (cubeX + 2);

      frontViewTile = frontViewTile > 3 ? frontViewTile - 3 : frontViewTile + 3;
      rightViewTile = rightViewTile > 3 ? rightViewTile - 3 : rightViewTile + 3;

      if (!this.frontViewNumbs.includes(frontViewTile)) {
        this.frontViewNumbs.push(frontViewTile);
      }
      if (!this.rightViewNumbs.includes(rightViewTile)) {
        this.rightViewNumbs.push(rightViewTile);
      }
      if (!this.topViewNumbs.includes(topViewTile))
        this.topViewNumbs.push(topViewTile);
    });

    this.frontViewNumbs.sort();
    this.rightViewNumbs.sort();
    this.topViewNumbs.sort();
  }

  clickDecoder(mX, mY, viewPos, w, h) {
    if (
      mX > viewPos.x &&
      mX < viewPos.x + w &&
      mY > viewPos.y &&
      mY < viewPos.y + h
    ) {
      mX = this.p.ceil(
        this.p.map(mX, viewPos.x, viewPos.x + w, 0, w / this.tileSize)
      );
      mY = this.p.ceil(
        this.p.map(mY, viewPos.y, viewPos.y + h, 0, h / this.tileSize)
      );
      //return the tile number
      return this.p.round((mY - 1) * (w / this.tileSize) + mX);
    }
    return -1;
  }

  handleClick(mX, mY) {
    // ignore clicks when not interactive
    if (!interactive) {
      return false;
    }

    // front view
    if (showPlan.front) {
      let tileNumb = this.clickDecoder(
        mX,
        mY,
        this.views.front,
        this.tileSize * 3,
        this.tileSize * 2
      );

      if (tileNumb > 0) {
        let index = this.frontViewNumbs.indexOf(tileNumb);
        if (index > -1) {
          this.frontViewNumbs.splice(index, 1);
        } else {
          this.frontViewNumbs.push(tileNumb);
        }

        this.outputNode.value = JSON.stringify(this.frontViewNumbs.sort());
      }
    }

    // right view
    if (showPlan.right) {
      let tileNumb = this.clickDecoder(
        mX,
        mY,
        this.views.right,
        this.tileSize * 3,
        this.tileSize * 2
      );

      if (tileNumb > 0) {
        let index = this.rightViewNumbs.indexOf(tileNumb);
        if (index > -1) {
          this.rightViewNumbs.splice(index, 1);
        } else {
          this.rightViewNumbs.push(tileNumb);
        }

        this.outputNode.value = JSON.stringify(this.rightViewNumbs.sort());
      }
    }

    // top view
    if (showPlan.top) {
      let tileNumb = this.clickDecoder(
        mX,
        mY,
        this.views.top,
        this.tileSize * 3,
        this.tileSize * 3
      );

      if (tileNumb > 0) {
        let index = this.topViewNumbs.indexOf(tileNumb);
        if (index > -1) {
          this.topViewNumbs.splice(index, 1);
        } else {
          this.topViewNumbs.push(tileNumb);
        }

        this.outputNode.value = JSON.stringify(this.topViewNumbs.sort());
      }
    }
  }
}
