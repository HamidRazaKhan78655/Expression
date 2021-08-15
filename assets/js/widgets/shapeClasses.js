class CubeDiagram {
  constructor(p) {
    this.p = p;
    this.sideLength = 0;
    this.lengthLabelPositions = [];
    this.arrows = [];
    this.resize();

    // order is lightest to darkest for shading
    this.colors = ["#89c2d9", "#468faf", "#2c7da0"];
  }
  resize() {
    var p = this.p;
    this.sideLength = p.height / 2.4;

    //calculate shape polygons
    this.polygons = [];
    var polyVec = p.createVector(0, 1).rotate(p.TWO_PI / 3);
    polyVec.mult(this.sideLength);
    // generates points by rotating a vector around the origin
    for (let i = 0; i < 3; i++) {
      let currPolygon = [];
      currPolygon.push([0, 0]);
      for (let j = 0; j < 3; j++) {
        currPolygon.push([polyVec.x, polyVec.y]);
        polyVec.rotate(p.TWO_PI / 6);
      }
      this.polygons.push(currPolygon);
      polyVec.rotate(-p.TWO_PI / 6);
    }

    // calculate the label positions
    // arrow tipped lines
    this.arrows = [];
    var offsetVec = p.createVector(1, 1).mult(this.sideLength / 5);
    var p1Vec = p.createVector(...this.polygons[1][2]).add(offsetVec);
    var p2Vec = p.createVector(...this.polygons[1][3]).add(offsetVec);
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);

    // lengths
    this.lengthLabelPositions = [];
    p1Vec.lerp(p2Vec, 0.5);
    this.lengthLabelPositions.push([p1Vec.x, p1Vec.y]);
  }

  drawShape() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2.2);
    p.stroke(labelTextColor);
    for (let i = 0; i < this.polygons.length; i++) {
      p.fill(this.colors[i]);
      p.beginShape();
      for (let j = 0; j < this.polygons[i].length; j++) {
        p.vertex(this.polygons[i][j][0], this.polygons[i][j][1]);
      }
      p.endShape(p.CLOSE);
    }
    p.pop();
  }

  drawLabels() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2.2);
    p.rectMode(p.CENTER);

    // draw length labels
    for (let j = 0; j < this.lengthLabelPositions.length; j++) {
      if (lengthLabels[j] != null && lengthLabels[j] !== "") {
        //arrow tipped line
        let arrow = this.arrows[j];
        p.arrowTippedLine(arrow[0], arrow[1], arrow[2], arrow[3]);

        // label
        p.fill(backgroundColor);
        p.noStroke();
        p.rect(
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1],
          p.textWidth(lengthLabels[j]) + 4,
          p.height / 18
        );
        p.fill(labelTextColor);
        p.text(
          lengthLabels[j],
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1]
        );
      }
    }

    p.pop();
  }
}

class CuboidDiagram {
  constructor(p) {
    this.p = p;
    this.sideLength = 0;
    this.faceLabelPositions = [];
    this.lengthLabelPositions = [];
    this.polygons = [];
    this.arrows = [];
    this.resize();

    // order is lightest to darkest for shading
    this.colors = ["#89c2d9", "#468faf", "#2c7da0"];
  }
  resize() {
    var p = this.p;
    this.sideLength = p.height / 2;

    //calculate shape polygons
    this.polygons = [];
    var polyVec = p5.Vector.fromAngle(-p.PI / 12, this.sideLength);
    var currPoly = [];
    // top
    currPoly.push([0, 0]);
    currPoly.push([polyVec.x, polyVec.y]);
    var offsetVec = p5.Vector.fromAngle(
      p.PI + p.PI / 12,
      this.sideLength * 1.5
    );
    polyVec.add(offsetVec);
    currPoly.push([polyVec.x, polyVec.y]);
    offsetVec = p5.Vector.fromAngle(p.PI - p.PI / 12, this.sideLength);
    polyVec.add(offsetVec);
    currPoly.push([polyVec.x, polyVec.y]);
    this.polygons.push(currPoly);
    // right side
    currPoly = [];
    currPoly.push([0, 0]);
    polyVec = p5.Vector.fromAngle(p.HALF_PI, this.sideLength);
    currPoly.push([polyVec.x, polyVec.y]);
    offsetVec = p5.Vector.fromAngle(-p.PI / 12, this.sideLength);
    polyVec.add(offsetVec);
    currPoly.push([polyVec.x, polyVec.y]);
    offsetVec = p5.Vector.fromAngle(-p.HALF_PI, this.sideLength);
    polyVec.add(offsetVec);
    currPoly.push([polyVec.x, polyVec.y]);
    this.polygons.push(currPoly);
    // left side
    currPoly = [];
    currPoly.push([0, 0]);
    polyVec = p5.Vector.fromAngle(p.HALF_PI, this.sideLength);
    currPoly.push([polyVec.x, polyVec.y]);
    offsetVec = p5.Vector.fromAngle(p.PI + p.PI / 12, this.sideLength * 1.5);
    polyVec.add(offsetVec);
    currPoly.push([polyVec.x, polyVec.y]);
    offsetVec = p5.Vector.fromAngle(-p.HALF_PI, this.sideLength);
    polyVec.add(offsetVec);
    currPoly.push([polyVec.x, polyVec.y]);
    this.polygons.push(currPoly);

    // calculate the label positions
    // faces
    this.faceLabelPositions = [];
    var labelPosVec = p.createVector(-2.3, 0.9).mult(this.sideLength / 3);
    this.faceLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(1.5, 1).mult(this.sideLength / 3);
    this.faceLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(-0.5, -0.9).mult(this.sideLength / 3);
    this.faceLabelPositions.push([labelPosVec.x, labelPosVec.y]);

    // lengths
    this.lengthLabelPositions = [];
    labelPosVec = p.createVector(-0.8, 1).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(0.55, 1.07).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);

    // arrow tipped lines
    this.arrows = [];
    offsetVec = p
      .createVector(1, 0)
      .mult(this.sideLength * 0.75)
      .rotate(p.PI / 12);
    var p1Vec = p
      .createVector(
        this.lengthLabelPositions[0][0],
        this.lengthLabelPositions[0][1]
      )
      .add(offsetVec);
    var p2Vec = p5.Vector.sub(p1Vec, offsetVec.mult(2));
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);

    offsetVec = p
      .createVector(1, 0)
      .mult(this.sideLength * 0.5)
      .rotate(-p.PI / 12);
    p1Vec = p
      .createVector(
        this.lengthLabelPositions[1][0],
        this.lengthLabelPositions[1][1]
      )
      .add(offsetVec);
    p2Vec = p5.Vector.sub(p1Vec, offsetVec.mult(2));
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);
  }

  drawShape() {
    var p = this.p;
    p.push();
    p.translate(p.width / 1.9, p.height / 2.8);
    p.stroke(labelTextColor);
    for (let i = 0; i < this.polygons.length; i++) {
      p.fill(this.colors[i]);
      p.beginShape();
      for (let j = 0; j < this.polygons[i].length; j++) {
        p.vertex(this.polygons[i][j][0], this.polygons[i][j][1]);
      }
      p.endShape(p.CLOSE);
    }
    p.pop();
  }

  drawLabels() {
    var p = this.p;
    p.push();
    p.translate(p.width / 1.9, p.height / 2.8);
    p.rectMode(p.CENTER);

    // draw length labels
    for (let j = 0; j < this.lengthLabelPositions.length; j++) {
      if (lengthLabels[j] != null && lengthLabels[j] !== "") {
        //arrow tipped line
        let arrow = this.arrows[j];
        p.arrowTippedLine(arrow[0], arrow[1], arrow[2], arrow[3]);

        // label
        p.fill(backgroundColor);
        p.noStroke();
        p.rect(
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1],
          p.textWidth(lengthLabels[j]) + 4,
          p.height / 18
        );
        p.fill(labelTextColor);
        p.text(
          lengthLabels[j],
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1]
        );
      }
    }

    // draw face labels
    p.fill(labelTextColor);
    p.noStroke();
    for (let i = 0; i < this.faceLabelPositions.length; i++) {
      if (faceLabels[i] != null && faceLabels[i] !== "") {
        p.text(
          faceLabels[i],
          this.faceLabelPositions[i][0],
          this.faceLabelPositions[i][1]
        );
      }
    }
    p.pop();
  }
}

class SquarePyramidDiagram {
  constructor(p) {
    this.p = p;
    this.sideLength = 0;
    this.pyramidFaceHeightMask = "#468faf";
    this.angleLabelPositionsMask = "#89c2d9";
    this.faceLabelPositions = [];
    this.lengthLabelPositions = [];
    this.pyramidFaceHeightLabel = [];
    this.angleLabelPositions = [];
    this.polygons = [];
    this.arrows = [];
    this.resize();

    // order is lightest to darkest for shading
    this.colors = ["#89c2d9", "#468faf", "#2c7da0"];
  }
  resize() {
    var p = this.p;
    this.sideLength = p.height / 3;
    this.blankLabelSize = p.height / 15;

    //calculate shape polygons
    this.polygons = [];
    var polyVec = p.createVector(1.2, 0.5).mult(this.sideLength);
    var offsetVec = p.createVector(-1, 0).mult(this.sideLength * 1.8);
    var peakVec = p.createVector(0, -1).mult(this.sideLength);
    var currPoly = [];
    // base
    currPoly.push([polyVec.x, polyVec.y]);
    polyVec.add(offsetVec);
    currPoly.push([polyVec.x, polyVec.y]);
    offsetVec = p5.Vector.fromAngle(p.PI - p.PI / 4, this.sideLength);
    polyVec.add(offsetVec);
    currPoly.push([polyVec.x, polyVec.y]);
    offsetVec = p.createVector(1, 0).mult(this.sideLength * 1.8);
    polyVec.add(offsetVec);
    currPoly.push([polyVec.x, polyVec.y]);
    this.polygons.push(currPoly.slice(0));

    // back side
    polyVec = p5.Vector.fromAngle(p.HALF_PI, this.sideLength);
    currPoly[2] = [peakVec.x, peakVec.y];
    currPoly.splice(3, 1);
    this.polygons.push(currPoly.slice(0));

    // left side
    currPoly = this.polygons[0].slice(0, 3);
    currPoly[0] = [peakVec.x, peakVec.y];
    this.polygons.push(currPoly);

    // calculate the label positions
    // pyramid face height
    this.pyramidFaceHeightLabel = [];
    var labelPosVec = p.createVector(0.53, 0.1).mult(this.sideLength);
    this.pyramidFaceHeightLabel.push([labelPosVec.x, labelPosVec.y]);

    // angle label
    this.angleLabelPositions = [];
    labelPosVec = p.createVector(0.15, 0.95).mult(this.sideLength);
    this.angleLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(
      this.polygons[0][3][0],
      this.polygons[0][3][1]
    );
    let angleStart = p.PI;
    let angleEnd = p5.Vector.sub(peakVec, labelPosVec).heading();
    let angleSize = p.height / 3.5;
    this.angleLabelPositions.push([
      labelPosVec.x,
      labelPosVec.y,
      angleSize,
      angleSize,
      angleStart,
      angleEnd,
    ]);

    // length labels
    this.lengthLabelPositions = [];
    labelPosVec = p.createVector(-1.65, 0).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(-0.4, 1.43).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(1.2, -0.3).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);

    // arrow tipped lines
    this.arrows = [];
    let p1Vec = p.createVector(this.polygons[0][2][0], this.polygons[0][2][1]);
    let p2Vec = peakVec.copy();
    p1Vec.x -= this.sideLength / 3;
    p2Vec.x = p1Vec.x;
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);

    offsetVec = p.createVector(1, 0).mult(this.sideLength / 1.1);
    p1Vec = p.createVector(...this.lengthLabelPositions[1]).add(offsetVec);
    p2Vec = p5.Vector.sub(p1Vec, offsetVec.mult(2));
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);

    p1Vec = peakVec.copy();
    p2Vec = p.createVector(this.polygons[1][0][0], this.polygons[1][0][1]);
    offsetVec = p.createVector(1, 0).mult(this.sideLength / 4);
    p1Vec.add(offsetVec);
    p2Vec.add(offsetVec);
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);

    // face length arrow tipped lines
    p1Vec = peakVec.copy();
    p2Vec = p.createVector(this.polygons[0][0][0], this.polygons[0][0][1]);
    offsetVec = p.createVector(this.polygons[0][3][0], this.polygons[0][3][1]);
    p2Vec.lerp(offsetVec, 0.5);
    this.pyramidFaceHeightLabel.push([p2Vec.x, p2Vec.y, p1Vec.x, p1Vec.y]);
  }

  drawShape() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2.2);
    p.noStroke();
    for (let i = 0; i < this.polygons.length; i++) {
      p.fill(this.colors[i % this.colors.length]);
      p.beginShape();
      for (let j = 0; j < this.polygons[i].length; j++) {
        p.vertex(...this.polygons[i][j]);
      }
      p.endShape(p.CLOSE);
    }

    p.stroke(labelTextColor);
    p.strokeWeight(3);

    // solid lines
    p.line(
      this.polygons[0][0][0],
      this.polygons[0][0][1],
      this.polygons[0][3][0],
      this.polygons[0][3][1]
    );
    p.line(
      this.polygons[0][0][0],
      this.polygons[0][0][1],
      this.polygons[1][2][0],
      this.polygons[1][2][1]
    );
    p.line(
      this.polygons[0][2][0],
      this.polygons[0][2][1],
      this.polygons[0][3][0],
      this.polygons[0][3][1]
    );
    p.line(
      this.polygons[0][2][0],
      this.polygons[0][2][1],
      this.polygons[1][2][0],
      this.polygons[1][2][1]
    );
    p.line(
      this.polygons[0][3][0],
      this.polygons[0][3][1],
      this.polygons[1][2][0],
      this.polygons[1][2][1]
    );

    // dotted lines
    p.drawDottedLine(
      this.polygons[0][0][0],
      this.polygons[0][0][1],
      this.polygons[0][1][0],
      this.polygons[0][1][1]
    );
    p.drawDottedLine(
      this.polygons[0][1][0],
      this.polygons[0][1][1],
      this.polygons[0][2][0],
      this.polygons[0][2][1]
    );
    p.drawDottedLine(
      this.polygons[0][1][0],
      this.polygons[0][1][1],
      this.polygons[1][2][0],
      this.polygons[1][2][1]
    );

    p.pop();
  }

  drawLabels() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2.2);
    p.rectMode(p.CENTER);

    // draw length labels
    for (let j = 0; j < this.lengthLabelPositions.length; j++) {
      if (lengthLabels[j] != null && lengthLabels[j] !== "") {
        //arrow tipped line
        let arrow = this.arrows[j];
        p.arrowTippedLine(arrow[0], arrow[1], arrow[2], arrow[3]);

        // label
        p.fill(backgroundColor);
        p.noStroke();
        p.rect(
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1],
          p.textWidth(lengthLabels[j]) + 4,
          p.height / 18
        );
        p.fill(labelTextColor);
        p.text(
          lengthLabels[j],
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1]
        );
      }
    }

    // draw the face height label
    if (lengthLabels[3] != null && lengthLabels[3] !== "") {
      p.arrowTippedLine(
        this.pyramidFaceHeightLabel[1][0],
        this.pyramidFaceHeightLabel[1][1],
        this.pyramidFaceHeightLabel[1][2],
        this.pyramidFaceHeightLabel[1][3],
        true
      );
      p.fill(this.pyramidFaceHeightMask);
      p.rect(
        this.pyramidFaceHeightLabel[0][0],
        this.pyramidFaceHeightLabel[0][1],
        p.textWidth(lengthLabels[3]),
        p.height / 18
      );
      p.fill(labelTextColor);
      p.text(
        lengthLabels[3],
        this.pyramidFaceHeightLabel[0][0],
        this.pyramidFaceHeightLabel[0][1]
      );
    }

    // draw the angle label
    if (angleLabel != null && angleLabel !== "") {
      let angleLabelPositionsArc = this.angleLabelPositions[1];
      p.stroke(labelTextColor);
      p.noFill();
      p.arc(
        angleLabelPositionsArc[0],
        angleLabelPositionsArc[1],
        angleLabelPositionsArc[2],
        angleLabelPositionsArc[3],
        angleLabelPositionsArc[4],
        angleLabelPositionsArc[5],
        p.OPEN
      );

      p.noStroke();
      p.fill(this.angleLabelPositionsMask);
      p.rect(
        this.angleLabelPositions[0][0],
        this.angleLabelPositions[0][1],
        p.textWidth(angleLabel) + 4,
        p.height / 18
      );
      p.fill(labelTextColor);
      p.text(
        angleLabel,
        this.angleLabelPositions[0][0],
        this.angleLabelPositions[0][1]
      );
    }

    p.pop();
  }
}

class TrianglePyramidDiagram {
  constructor(p) {
    this.p = p;
    this.sideLength = 0;
    this.lengthLabelPositions = [];
    this.pyramidFaceHeightLabel = [];
    this.angleLabelPositions = [];
    this.polygons = [];
    this.arrows = [];
    this.resize();

    // order is lightest to darkest for shading
    this.colors = ["#89c2d9", "#468faf", "#2c7da0"];
  }
  resize() {
    var p = this.p;
    this.sideLength = p.height / 2.8;
    this.blankLabelSize = p.height / 15;

    //calculate shape polygons
    this.polygons = [];
    var polyVec = p.createVector(1, 0.5).mult(this.sideLength);
    var offsetVec = p.createVector(-1, -0.1).mult(this.sideLength * 2);
    var peakVec = p.createVector(-0.2, -1).mult(this.sideLength);
    var currPoly = [];
    // base
    currPoly.push([polyVec.x, polyVec.y]);
    polyVec.add(offsetVec);
    currPoly.push([polyVec.x, polyVec.y]);
    offsetVec = p5.Vector.fromAngle(p.PI / 2.5, this.sideLength);
    polyVec.add(offsetVec);
    currPoly.push([polyVec.x, polyVec.y]);
    this.polygons.push(currPoly.slice(0));

    // back side
    currPoly[2] = [peakVec.x, peakVec.y];
    currPoly.splice(3, 1);
    this.polygons.push(currPoly.slice(0));

    // calculate the label positions
    // pyramid face height
    this.pyramidFaceHeightLabel = [];
    var labelPosVec = p.createVector(0, 0.1).mult(this.sideLength);
    this.pyramidFaceHeightLabel.push([labelPosVec.x, labelPosVec.y]);

    // angle label
    this.angleLabelPositions = [];
    labelPosVec = p.createVector(-0.28, 0.78).mult(this.sideLength);
    this.angleLabelPositions.push([labelPosVec.x, labelPosVec.y]);

    labelPosVec = p.createVector(
      this.polygons[0][2][0],
      this.polygons[0][2][1]
    );
    let basePoint1 = p.createVector(
      this.polygons[0][0][0],
      this.polygons[0][0][1]
    );
    let basePoint2 = p.createVector(
      this.polygons[0][2][0],
      this.polygons[0][2][1]
    );
    let angleStart = p5.Vector.sub(peakVec, labelPosVec).heading();
    let angleEnd = p5.Vector.sub(basePoint1, basePoint2).heading();
    let angleSize = p.height / 2.3;
    this.angleLabelPositions.push([
      labelPosVec.x,
      labelPosVec.y,
      angleSize,
      angleSize,
      angleStart,
      angleEnd,
    ]);

    // length labels
    this.lengthLabelPositions = [];
    labelPosVec = p.createVector(-1.25, 0).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(0.3, 1.1).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(0.8, -0.4).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);

    // arrow tipped lines
    this.arrows = [];
    let p1Vec = p.createVector(this.polygons[0][2][0], this.polygons[0][2][1]);
    let p2Vec = peakVec.copy();
    p1Vec.x -= this.sideLength / 1.7;
    p2Vec.x = p1Vec.x;
    p1Vec.y -= this.sideLength / 3;
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);

    offsetVec = p5.Vector.fromAngle(angleEnd).mult(this.sideLength / 1.1);
    p1Vec = p.createVector(...this.lengthLabelPositions[1]).add(offsetVec);
    p2Vec = p5.Vector.sub(p1Vec, offsetVec.mult(2));
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);

    p1Vec = peakVec.copy();
    p2Vec = p.createVector(this.polygons[1][0][0], this.polygons[1][0][1]);
    offsetVec = p.createVector(1, 0).mult(this.sideLength / 4);
    p1Vec.add(offsetVec);
    p2Vec.add(offsetVec);
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);

    // face height arrow tipped line
    p1Vec = peakVec.copy();
    p2Vec = p.createVector(this.polygons[0][0][0], this.polygons[0][0][1]);
    offsetVec = p.createVector(this.polygons[0][2][0], this.polygons[0][2][1]);
    p2Vec.lerp(offsetVec, 0.5);
    this.pyramidFaceHeightLabel.push([p2Vec.x, p2Vec.y, p1Vec.x, p1Vec.y]);
  }

  drawShape() {
    var p = this.p;
    p.push();
    p.translate(p.width / 1.9, p.height / 2.2);
    p.noStroke();
    for (let i = 0; i < this.polygons.length; i++) {
      p.fill(this.colors[i % this.colors.length]);
      p.beginShape();
      for (let j = 0; j < this.polygons[i].length; j++) {
        p.vertex(this.polygons[i][j][0], this.polygons[i][j][1]);
      }
      p.endShape(p.CLOSE);
    }

    p.stroke(labelTextColor);
    p.strokeWeight(3);

    // solid lines
    p.line(
      this.polygons[0][0][0],
      this.polygons[0][0][1],
      this.polygons[0][2][0],
      this.polygons[0][2][1]
    );
    p.line(
      this.polygons[0][0][0],
      this.polygons[0][0][1],
      this.polygons[1][2][0],
      this.polygons[1][2][1]
    );
    p.line(
      this.polygons[0][1][0],
      this.polygons[0][1][1],
      this.polygons[0][2][0],
      this.polygons[0][2][1]
    );
    p.line(
      this.polygons[0][1][0],
      this.polygons[0][1][1],
      this.polygons[1][2][0],
      this.polygons[1][2][1]
    );
    p.line(
      this.polygons[0][2][0],
      this.polygons[0][2][1],
      this.polygons[1][2][0],
      this.polygons[1][2][1]
    );

    // dotted lines
    p.drawDottedLine(
      this.polygons[0][0][0],
      this.polygons[0][0][1],
      this.polygons[0][1][0],
      this.polygons[0][1][1],
      16
    );

    p.pop();
  }

  drawLabels() {
    var p = this.p;
    p.push();
    p.translate(p.width / 1.9, p.height / 2.2);
    p.rectMode(p.CENTER);

    // draw length labels
    for (let j = 0; j < this.lengthLabelPositions.length; j++) {
      if (lengthLabels[j] != null && lengthLabels[j] !== "") {
        //arrow tipped line
        let arrow = this.arrows[j];
        p.arrowTippedLine(arrow[0], arrow[1], arrow[2], arrow[3]);

        // label
        p.fill(backgroundColor);
        p.noStroke();
        p.rect(
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1],
          p.textWidth(lengthLabels[j]) + 4,
          p.height / 18
        );
        p.fill(labelTextColor);
        p.text(
          lengthLabels[j],
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1]
        );
      }
    }

    // draw the face height label
    if (lengthLabels[3] != null && lengthLabels[3] !== "") {
      p.arrowTippedLine(
        this.pyramidFaceHeightLabel[1][0],
        this.pyramidFaceHeightLabel[1][1],
        this.pyramidFaceHeightLabel[1][2],
        this.pyramidFaceHeightLabel[1][3],
        true
      );
      p.fill(this.colors[1]);
      p.rect(
        this.pyramidFaceHeightLabel[0][0],
        this.pyramidFaceHeightLabel[0][1],
        p.textWidth(lengthLabels[3]),
        p.height / 18
      );
      p.fill(labelTextColor);
      p.text(
        lengthLabels[3],
        this.pyramidFaceHeightLabel[0][0],
        this.pyramidFaceHeightLabel[0][1]
      );
    }

    // draw the angle label
    if (angleLabel != null && angleLabel !== "") {
      let angleLabelPositionsArc = this.angleLabelPositions[1];
      p.stroke(labelTextColor);
      p.noFill();
      p.arc(
        angleLabelPositionsArc[0],
        angleLabelPositionsArc[1],
        angleLabelPositionsArc[2],
        angleLabelPositionsArc[3],
        angleLabelPositionsArc[4],
        angleLabelPositionsArc[5],
        p.OPEN
      );

      p.noStroke();
      p.fill(this.colors[0]);
      p.rect(
        this.angleLabelPositions[0][0],
        this.angleLabelPositions[0][1],
        p.textWidth(angleLabel) + 4,
        p.height / 18
      );
      p.fill(labelTextColor);
      p.text(
        angleLabel,
        this.angleLabelPositions[0][0],
        this.angleLabelPositions[0][1]
      );
    }

    p.pop();
  }
}

class CylinderDiagram {
  constructor(p) {
    this.p = p;
    this.sideLength = 0;
    this.lengthLabelPositions = [];
    this.labelMaskCol = "#89c2d9";
    this.circles = [];
    this.arrows = [];
    this.resize();

    // order is lightest to darkest for shading
    this.colors = ["#89c2d9", "#468faf", "#2c7da0"];
  }

  resize() {
    var p = this.p;
    this.sideLength = p.height / 2;

    //calculate shape polygons
    this.circles = [];
    var circ1Vec = p.createVector(-0.5, 0.25).mult(this.sideLength);
    this.circles.push([circ1Vec.x, circ1Vec.y]);
    var circ2Vec = p.createVector(0.5, -0.25).mult(this.sideLength);
    this.circles.push([circ2Vec.x, circ2Vec.y]);

    // body rectangle
    var offsetVec = p5.Vector.fromAngle(p.HALF_PI / 1.5).mult(
      this.sideLength / 2
    );
    var rectVec1 = p5.Vector.add(circ1Vec, offsetVec);
    var rectVec2 = p5.Vector.sub(circ1Vec, offsetVec);
    var rectVec3 = p5.Vector.sub(circ2Vec, offsetVec);
    var rectVec4 = p5.Vector.add(circ2Vec, offsetVec);
    this.bodyRect = [
      rectVec1.x,
      rectVec1.y,
      rectVec2.x,
      rectVec2.y,
      rectVec3.x,
      rectVec3.y,
      rectVec4.x,
      rectVec4.y,
    ];

    // calculate the label positions
    // length labels
    this.lengthLabelPositions = [];
    var labelPosVec = p.createVector(0.33, 0.7).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(-0.5, 0.15).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(-0.35, 0.5).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);

    // arrow tipped lines
    this.arrows = [];
    offsetVec = p5.Vector.sub(circ2Vec, circ1Vec).mult(0.65);
    var p1Vec = p
      .createVector(
        this.lengthLabelPositions[0][0],
        this.lengthLabelPositions[0][1]
      )
      .add(offsetVec);
    var p2Vec = p5.Vector.sub(p1Vec, offsetVec.mult(2));
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);

    // diameter
    p1Vec = circ1Vec.copy();
    offsetVec = p.createVector(0.5, 0).mult(this.sideLength);
    p2Vec = p5.Vector.add(p1Vec, offsetVec);
    p1Vec.sub(offsetVec);
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);

    p1Vec = circ1Vec.copy();
    offsetVec = p.createVector(0, 0.5).mult(this.sideLength);
    p2Vec = p5.Vector.add(p1Vec, offsetVec);
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);
  }

  drawShape() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2.3);
    p.rectMode(p.CORNERS);
    p.strokeWeight(3);

    // back circle
    p.stroke(labelTextColor);
    p.fill(this.colors[1]);
    p.circle(this.circles[1][0], this.circles[1][1], this.sideLength);

    // body rectangle
    p.noStroke();
    p.quad(
      this.bodyRect[0],
      this.bodyRect[1],
      this.bodyRect[2],
      this.bodyRect[3],
      this.bodyRect[4],
      this.bodyRect[5],
      this.bodyRect[6],
      this.bodyRect[7]
    );
    p.stroke(labelTextColor);
    p.line(
      this.bodyRect[2],
      this.bodyRect[3],
      this.bodyRect[4],
      this.bodyRect[5]
    );
    p.line(
      this.bodyRect[0],
      this.bodyRect[1],
      this.bodyRect[6],
      this.bodyRect[7]
    );

    // front circle
    p.fill(this.colors[0]);
    p.circle(this.circles[0][0], this.circles[0][1], this.sideLength);

    p.pop();
  }

  drawLabels() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2.3);
    p.rectMode(p.CENTER);
    p.strokeWeight(2.5);

    // draw length labels
    for (let j = 0; j < this.lengthLabelPositions.length; j++) {
      if (lengthLabels[j] != null && lengthLabels[j] !== "") {
        //arrow tipped line
        let arrow = this.arrows[j];
        p.arrowTippedLine(arrow[0], arrow[1], arrow[2], arrow[3]);

        // label
        let bgCol = j > 0 ? this.labelMaskCol : backgroundColor;
        p.fill(bgCol);
        p.noStroke();
        p.rect(
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1],
          p.textWidth(lengthLabels[j]) + 4,
          p.height / 18
        );
        p.fill(labelTextColor);
        p.text(
          lengthLabels[j],
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1]
        );
      }
    }
    p.pop();
  }
}

class ConeDiagram {
  constructor(p) {
    this.p = p;
    this.sideLength = 0;
    this.lengthLabelPositions = [];
    this.backTriangle = [];
    this.base = [];
    this.resize();

    // order is lightest to darkest for shading
    this.colors = ["#89c2d9", "#468faf", "#2c7da0"];
  }
  resize() {
    var p = this.p;
    this.sideLength = p.height / 2.3;

    //calculate shape polygons
    var polyVec = p.createVector(-1, 0.54).mult(this.sideLength);
    var polyVec2 = p.createVector(1, 0.54).mult(this.sideLength);
    var peakVec = p.createVector(0, -1).mult(this.sideLength);
    this.backTriangle = [
      polyVec.x,
      polyVec.y,
      polyVec2.x,
      polyVec2.y,
      peakVec.x,
      peakVec.y,
    ];

    // base
    let baseWidth = this.sideLength * 2;
    let baseHeight = this.sideLength / 1.5;
    polyVec = p.createVector(0, 0.55).mult(this.sideLength);
    this.base = [[polyVec.x, polyVec.y, baseWidth, baseHeight]];

    this.base.push([
      polyVec.x - this.sideLength,
      polyVec.y,
      polyVec.x + this.sideLength,
      polyVec.y,
      baseHeight / 2,
    ]);

    this.base.push([polyVec.x, polyVec.y, baseWidth, baseHeight, 0, p.PI]);

    // calculate the label positions
    // length labels
    this.lengthLabelPositions = [];
    var labelPosVec = p.createVector(-1.1, -0.15).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(0.75, -0.25).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(0, 0.45).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(0.2, 0.72).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);

    // arrow tipped lines
    this.arrows = [];
    // cone height
    var p1Vec = p.createVector(-1, 0).mult(this.sideLength * 1.1);
    p1Vec.y = polyVec.y;
    var p2Vec = p.createVector(p1Vec.x, peakVec.y);
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);
    // side length
    var offsetVec = p.createVector(1, 0).mult(this.sideLength / 5);
    p1Vec = peakVec.copy().add(offsetVec);
    p2Vec = p.createVector(1, 0.5).mult(this.sideLength).add(offsetVec);
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);
    // base diameter
    p1Vec = polyVec.copy();
    p2Vec = p1Vec.copy();
    p2Vec.x += baseWidth / 2;
    p1Vec.x -= baseWidth / 2;
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);
    // base radius
    p1Vec = polyVec.copy();
    p2Vec = p1Vec.copy();
    p2Vec.y += baseHeight / 2;
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);
  }

  drawShape() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.rectMode(p.CORNERS);

    // back triangle
    //fill
    p.noStroke();
    p.fill(this.colors[1]);
    p.triangle(...this.backTriangle);

    // base
    p.stroke(labelTextColor);
    p.noStroke();
    p.fill(this.colors[0]);
    p.ellipse(...this.base[0]);

    //lines
    p.strokeWeight(3);
    p.stroke(labelTextColor);
    p.noFill();

    p.line(
      this.backTriangle[0],
      this.backTriangle[1],
      this.backTriangle[4],
      this.backTriangle[5]
    );
    p.line(
      this.backTriangle[2],
      this.backTriangle[3],
      this.backTriangle[4],
      this.backTriangle[5]
    );

    p.drawDottedArc(...this.base[1]);
    p.arc(...this.base[2]);

    p.pop();
  }

  drawLabels() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.rectMode(p.CENTER);
    p.strokeWeight(2.5);

    // draw length labels
    for (let j = 0; j < this.lengthLabelPositions.length; j++) {
      if (lengthLabels[j] != null && lengthLabels[j] !== "") {
        //arrow tipped line
        p.arrowTippedLine(...this.arrows[j]);

        // label
        let bgCol = j > 1 ? this.colors[0] : backgroundColor;
        p.fill(bgCol);
        p.noStroke();
        p.rect(
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1],
          p.textWidth(lengthLabels[j]) + 4,
          p.height / 18
        );
        p.fill(labelTextColor);
        p.text(
          lengthLabels[j],
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1]
        );
      }
    }
    p.pop();
  }
}

class SphereDiagram {
  constructor(p) {
    this.p = p;
    this.sideLength = 0;
    this.lengthLabelPositions = [];
    this.circles = [];
    this.resize();

    // order is darkest to lightest for shading
    this.colors = ["#2c7da0", "#468faf", "#89c2d9"];
  }
  resize() {
    var p = this.p;
    this.sideLength = p.height / 2.1;

    //calculate shape polygons
    this.circles = [];
    this.circles.push([0, 0, this.sideLength * 2]);
    var circVec = p.createVector(-0.06, -0.06).mult(this.sideLength);
    this.circles.push([circVec.x, circVec.y, this.sideLength * 1.8]);
    circVec = p.createVector(-0.35, -0.45).mult(this.sideLength);
    this.circles.push([circVec.x, circVec.y, this.sideLength * 0.5]);

    // calculate the label positions
    // length labels
    this.lengthLabelPositions = [];
    var labelPosVec = p.createVector(0, -0.1).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(0.2, 0.5).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);

    // arrow tipped lines
    this.arrows = [];
    // diameter
    var offsetVec = p.createVector(1, 0).mult(this.sideLength);
    var p1Vec = p.createVector(0, 0).add(offsetVec);
    var p2Vec = p1Vec.copy().sub(offsetVec.mult(2));
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);
    // radius
    offsetVec = p.createVector(0, 1).mult(this.sideLength);
    p1Vec = p.createVector(0, 0);
    p2Vec = p1Vec.copy().add(offsetVec);
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);
  }

  drawShape() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.stroke(labelTextColor);

    for (let i = 0; i < this.circles.length; i++) {
      if (i > 0) {
        p.noStroke();
      }
      p.fill(this.colors[i % this.colors.length]);
      p.circle(this.circles[i][0], this.circles[i][1], this.circles[i][2]);
    }

    p.pop();
  }

  drawLabels() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.rectMode(p.CENTER);
    p.strokeWeight(2.5);

    // draw length labels
    for (let j = 0; j < this.lengthLabelPositions.length; j++) {
      if (lengthLabels[j] != null && lengthLabels[j] !== "") {
        //arrow tipped line
        let arrow = this.arrows[j];
        p.arrowTippedLine(arrow[0], arrow[1], arrow[2], arrow[3]);

        // label
        p.fill(labelTextColor);
        p.text(
          lengthLabels[j],
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1]
        );
      }
    }
    p.pop();
  }
}

class PrismDiagram {
  constructor(p) {
    this.p = p;
    this.sideLength = 0;
    this.pyramidFaceHeightMask = "#2c7da0";
    this.angleLabelPositionsMask = "";
    this.lengthLabelPositions = [];
    this.faceLabelPositions = [];
    this.pyramidFaceHeightLabel = [];
    this.angleLabelPositions = [];
    this.polygons = [];
    this.arrows = [];
    this.resize();

    // order is lightest to darkest for shading
    this.colors = ["#89c2d9", "#468faf", "#2c7da0"];
  }
  resize() {
    var p = this.p;
    this.sideLength = p.height / 1.9;

    //calculate shape polygons
    this.polygons = [];
    var polyVec = p.createVector(-0.75, -0.4).mult(this.sideLength);
    var offsetVec = p.createVector(-0.5, 1).mult(this.sideLength);
    var currPoly = [];
    // front face
    currPoly.push([polyVec.x, polyVec.y]);
    polyVec.add(offsetVec);
    currPoly.push([polyVec.x, polyVec.y]);
    offsetVec = p.createVector(1, 0).mult(this.sideLength);
    polyVec.add(offsetVec);
    currPoly.push([polyVec.x, polyVec.y]);
    this.polygons.push(currPoly.slice(0));

    // back face
    offsetVec = p.createVector(1.5, -0.35).mult(this.sideLength);
    currPoly = [
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    for (let i = 0; i < 3; i++) {
      currPoly[i][0] = this.polygons[0][i][0] + offsetVec.x;
      currPoly[i][1] = this.polygons[0][i][1] + offsetVec.y;
    }
    this.polygons.push(currPoly.slice(0));

    // calculate the label positions
    // face labels
    this.faceLabelPositions = [];
    var labelPosVec = p.createVector(-0.75, 0.12).mult(this.sideLength);
    this.faceLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(0.1, -0.2).mult(this.sideLength);
    this.faceLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(0.1, 0.4).mult(this.sideLength);
    this.faceLabelPositions.push([labelPosVec.x, labelPosVec.y]);

    // angle label
    this.angleLabelPositions = [];
    labelPosVec = p.createVector(-0.6, 0.35).mult(this.sideLength);
    this.angleLabelPositions.push([labelPosVec.x, labelPosVec.y]);

    let angleSize = this.sideLength / 1.6;
    let angleStart = p.createVector(-1, 0).heading();
    let angleEnd = p.createVector(-0.5, -1).heading();
    this.angleLabelPositions.push([
      this.polygons[0][2][0],
      this.polygons[0][2][1],
      angleSize,
      angleSize,
      angleStart,
      angleEnd,
    ]);

    // pyramid face height
    this.pyramidFaceHeightLabel = [];
    labelPosVec = p.createVector(0.75, -0.2).mult(this.sideLength);
    this.pyramidFaceHeightLabel.push([labelPosVec.x, labelPosVec.y]);

    // length labels
    this.lengthLabelPositions = [];
    labelPosVec = p.createVector(-0.76, 0.7).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(0.6, 0.52).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(1.13, -0.27).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);

    // arrow tipped lines
    this.arrows = [];
    // short side length
    offsetVec = p.createVector(1, 0).mult(this.sideLength / 2);
    var p1Vec = p
      .createVector(
        this.lengthLabelPositions[0][0],
        this.lengthLabelPositions[0][1]
      )
      .add(offsetVec);
    var p2Vec = p5.Vector.sub(p1Vec, offsetVec.mult(2));
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);

    // long side length
    offsetVec = p.createVector(1.5, -0.35).mult(this.sideLength / 1.9);
    p1Vec = p
      .createVector(
        this.lengthLabelPositions[1][0],
        this.lengthLabelPositions[1][1]
      )
      .add(offsetVec);
    p2Vec = p5.Vector.sub(p1Vec, offsetVec.mult(2));
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);

    // back triangle side length
    offsetVec = p.createVector(0.5, 1).mult(this.sideLength / 2);
    p1Vec = p
      .createVector(
        this.lengthLabelPositions[2][0],
        this.lengthLabelPositions[2][1]
      )
      .add(offsetVec);
    p2Vec = p5.Vector.sub(p1Vec, offsetVec.mult(2));
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);

    offsetVec = p.createVector(0, 1).mult(this.sideLength);
    p1Vec = p.createVector(this.polygons[1][0][0], this.polygons[1][0][1]);
    p2Vec = p5.Vector.add(p1Vec, offsetVec);
    this.pyramidFaceHeightLabel.push([p2Vec.x, p2Vec.y, p1Vec.x, p1Vec.y]);
  }

  drawShape() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.noStroke();

    let frontFace = this.polygons[0];
    let backFace = this.polygons[1];

    // prism base
    p.fill(this.colors[0]);
    p.beginShape();
    p.vertex(frontFace[1][0], frontFace[1][1]);
    p.vertex(backFace[1][0], backFace[1][1]);
    p.vertex(backFace[2][0], backFace[2][1]);
    p.vertex(frontFace[2][0], frontFace[2][1]);
    p.endShape(p.CLOSE);

    // back quad
    p.fill(this.colors[1]);
    p.beginShape();
    p.vertex(frontFace[0][0], frontFace[0][1]);
    p.vertex(backFace[0][0], backFace[0][1]);
    p.vertex(backFace[1][0], backFace[1][1]);
    p.vertex(frontFace[1][0], frontFace[1][1]);
    p.endShape(p.CLOSE);

    // back triangle
    p.fill(this.colors[2]);
    p.beginShape();
    p.vertex(backFace[0][0], backFace[0][1]);
    p.vertex(backFace[1][0], backFace[1][1]);
    p.vertex(backFace[2][0], backFace[2][1]);
    p.endShape(p.CLOSE);

    p.stroke(labelTextColor);
    p.strokeWeight(3);

    // solid lines
    // front face
    p.line(frontFace[0][0], frontFace[0][1], frontFace[1][0], frontFace[1][1]);
    p.line(frontFace[1][0], frontFace[1][1], frontFace[2][0], frontFace[2][1]);
    p.line(frontFace[2][0], frontFace[2][1], frontFace[0][0], frontFace[0][1]);
    // sides and back
    p.line(frontFace[2][0], frontFace[2][1], backFace[2][0], backFace[2][1]);
    p.line(frontFace[0][0], frontFace[0][1], backFace[0][0], backFace[0][1]);
    p.line(backFace[0][0], backFace[0][1], backFace[2][0], backFace[2][1]);

    // dotted lines
    p.drawDottedLine(
      frontFace[1][0],
      frontFace[1][1],
      backFace[1][0],
      backFace[1][1]
    );
    p.drawDottedLine(
      backFace[1][0],
      backFace[1][1],
      backFace[0][0],
      backFace[0][1]
    );
    p.drawDottedLine(
      backFace[1][0],
      backFace[1][1],
      backFace[2][0],
      backFace[2][1]
    );

    p.pop();
  }

  drawLabels() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.rectMode(p.CENTER);

    // draw length labels
    for (let j = 0; j < this.lengthLabelPositions.length; j++) {
      if (lengthLabels[j] != null && lengthLabels[j] !== "") {
        //arrow tipped line
        let arrow = this.arrows[j];
        p.arrowTippedLine(arrow[0], arrow[1], arrow[2], arrow[3]);

        // label
        p.fill(backgroundColor);
        p.noStroke();
        p.rect(
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1],
          p.textWidth(lengthLabels[j]) + 4,
          p.height / 18
        );
        p.fill(labelTextColor);
        p.text(
          lengthLabels[j],
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1]
        );
      }
    }

    // draw face labels
    p.fill(labelTextColor);
    p.noStroke();
    for (let i = 0; i < this.faceLabelPositions.length; i++) {
      if (faceLabels[i] != null && faceLabels[i] !== "") {
        p.text(
          faceLabels[i],
          this.faceLabelPositions[i][0],
          this.faceLabelPositions[i][1]
        );
      }
    }

    // draw the face height label
    if (lengthLabels[3] != null && lengthLabels[3] !== "") {
      p.arrowTippedLine(
        this.pyramidFaceHeightLabel[1][0],
        this.pyramidFaceHeightLabel[1][1],
        this.pyramidFaceHeightLabel[1][2],
        this.pyramidFaceHeightLabel[1][3],
        true
      );
      p.fill(this.colors[2]);
      p.rect(
        this.pyramidFaceHeightLabel[0][0],
        this.pyramidFaceHeightLabel[0][1],
        p.textWidth(lengthLabels[3]),
        p.height / 18
      );
      p.fill(labelTextColor);
      p.text(
        lengthLabels[3],
        this.pyramidFaceHeightLabel[0][0],
        this.pyramidFaceHeightLabel[0][1]
      );
    }

    // draw the angle label
    if (angleLabel != null && angleLabel !== "") {
      let angleLabelPositionsArc = this.angleLabelPositions[1];
      p.stroke(labelTextColor);
      p.noFill();
      p.arc(
        angleLabelPositionsArc[0],
        angleLabelPositionsArc[1],
        angleLabelPositionsArc[2],
        angleLabelPositionsArc[3],
        angleLabelPositionsArc[4],
        angleLabelPositionsArc[5],
        p.OPEN
      );

      p.noStroke();
      p.fill(this.colors[1]);
      p.rect(
        this.angleLabelPositions[0][0],
        this.angleLabelPositions[0][1],
        p.textWidth(angleLabel) + 4,
        p.height / 18
      );
      p.fill(labelTextColor);
      p.text(
        angleLabel,
        this.angleLabelPositions[0][0],
        this.angleLabelPositions[0][1]
      );
    }

    p.pop();
  }
}

class IceCreamConeDiagram {
  constructor(p) {
    this.p = p;
    this.sideLength = 0;
    this.labelMaskCol = "#468faf";
    this.lengthLabelPositions = [];
    this.angleLabelPositions = [];
    this.backTriangle = [];
    this.topSphere = [];
    this.base = [];
    this.resize();

    // order is lightest to darkest for shading
    this.colors = ["#89c2d9", "#468faf", "#2c7da0"];
  }
  resize() {
    var p = this.p;
    this.sideLength = p.height / 3;

    //calculate shape polygons
    var polyVec = p.createVector(0.985, -0.18).mult(this.sideLength);
    var polyVec2 = p.createVector(-0.985, -0.18).mult(this.sideLength);
    var peakVec = p.createVector(0, 1.2).mult(this.sideLength);
    this.backTriangle = [
      polyVec.x,
      polyVec.y,
      polyVec2.x,
      polyVec2.y,
      peakVec.x,
      peakVec.y,
    ];

    // base
    let baseWidth = this.sideLength * 2;
    let baseHeight = this.sideLength / 1.5;
    let baseVec = p.createVector(0, -0.25).mult(this.sideLength);
    this.base = [[baseVec.x, baseVec.y, baseWidth, baseHeight]];

    this.base.push([
      baseVec.x - this.sideLength,
      baseVec.y,
      baseVec.x + this.sideLength,
      baseVec.y,
      baseHeight / 2,
    ]);

    this.base.push([baseVec.x, baseVec.y, baseWidth, baseHeight, 0, p.PI]);

    // top sphere
    this.topSphere = [baseVec.x, baseVec.y, baseWidth, baseWidth, p.PI, 0];

    // calculate the label positions
    // angle label
    this.angleLabelPositions = [];
    labelPosVec = p.createVector(0, 0.6).mult(this.sideLength);
    this.angleLabelPositions.push([labelPosVec.x, labelPosVec.y]);

    let angleStart = p5.Vector.sub(polyVec2, peakVec).heading();
    let angleEnd = p5.Vector.sub(polyVec, peakVec).heading();
    let angleSize = p.height / 2.5;
    this.angleLabelPositions.push([
      peakVec.x,
      peakVec.y,
      angleSize,
      angleSize,
      angleStart,
      angleEnd,
    ]);

    // length labels
    this.lengthLabelPositions = [];
    var labelPosVec = p.createVector(-1.1, 0.5).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(0.75, 0.5).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(-0.5, -0.36).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);
    labelPosVec = p.createVector(0, -0.36).mult(this.sideLength);
    this.lengthLabelPositions.push([labelPosVec.x, labelPosVec.y]);

    // arrow tipped lines
    this.arrows = [];
    // cone height
    let offsetVec = p.createVector(-1, 0).mult(baseWidth * 0.55);
    let p1Vec = peakVec.copy().add(offsetVec);
    let p2Vec = baseVec.copy().add(offsetVec);
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);
    // side length
    offsetVec = p.createVector(1, 0).mult(this.sideLength / 4.5);
    p1Vec = peakVec.copy().add(offsetVec);
    p2Vec = baseVec.copy().add(offsetVec);
    p2Vec.x += baseWidth / 2;
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);
    //base radius
    p1Vec = baseVec.copy();
    p2Vec = baseVec.copy();
    p1Vec.x = -baseWidth / 2;
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);
    //base diameter
    p1Vec = baseVec.copy();
    p2Vec = p1Vec.copy();
    p2Vec.x += baseWidth / 2;
    p1Vec.x -= baseWidth / 2;
    this.arrows.push([p1Vec.x, p1Vec.y, p2Vec.x, p2Vec.y]);
  }

  drawShape() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.rectMode(p.CORNERS);

    // back triangle
    //fill
    p.noStroke();
    p.fill(this.colors[2]);
    p.triangle(...this.backTriangle);

    p.stroke(labelTextColor);
    p.strokeWeight(3);
    // top sphere
    p.fill(this.colors[0]);
    p.arc(...this.topSphere);

    // cone base
    p.noStroke();
    p.fill(this.colors[1]);
    p.ellipse(...this.base[0]);

    p.stroke(labelTextColor);
    p.noFill();
    p.drawDottedArc(...this.base[1]);
    p.arc(...this.base[2]);

    //lines
    p.line(
      this.backTriangle[0],
      this.backTriangle[1],
      this.backTriangle[4],
      this.backTriangle[5]
    );
    p.line(
      this.backTriangle[2],
      this.backTriangle[3],
      this.backTriangle[4],
      this.backTriangle[5]
    );

    p.pop();
  }

  drawLabels() {
    var p = this.p;
    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.rectMode(p.CENTER);
    p.strokeWeight(2.5);

    // draw length labels
    for (let j = 0; j < this.lengthLabelPositions.length; j++) {
      if (lengthLabels[j] != null && lengthLabels[j] !== "") {
        //arrow tipped line
        let arrow = this.arrows[j];
        p.arrowTippedLine(arrow[0], arrow[1], arrow[2], arrow[3]);

        // label
        let bgCol = j > 1 ? this.labelMaskCol : backgroundColor;
        p.fill(bgCol);
        p.noStroke();
        p.rect(
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1],
          p.textWidth(lengthLabels[j]) + 4,
          p.height / 18
        );
        p.fill(labelTextColor);
        p.text(
          lengthLabels[j],
          this.lengthLabelPositions[j][0],
          this.lengthLabelPositions[j][1]
        );
      }
    }

    // draw the angle label
    if (angleLabel != null && angleLabel !== "") {
      let angleLabelPositionsArc = this.angleLabelPositions[1];
      p.stroke(labelTextColor);
      p.noFill();
      p.arc(
        angleLabelPositionsArc[0],
        angleLabelPositionsArc[1],
        angleLabelPositionsArc[2],
        angleLabelPositionsArc[3],
        angleLabelPositionsArc[4],
        angleLabelPositionsArc[5],
        p.OPEN
      );

      p.noStroke();
      p.fill(this.colors[2]);
      p.rect(
        this.angleLabelPositions[0][0],
        this.angleLabelPositions[0][1],
        p.textWidth(angleLabel) + 4,
        p.height / 18
      );
      p.fill(labelTextColor);
      p.text(
        angleLabel,
        this.angleLabelPositions[0][0],
        this.angleLabelPositions[0][1]
      );
    }

    p.pop();
  }
}
