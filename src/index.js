import { calculateIntersection } from "./utils.js";

class Canvas {
  constructor() {
    this.canvasEl = document.getElementById("canvas");
    this.context = this.canvasEl.getContext("2d");
    this.isDrawStart = false;
    this.drawedLines = [];
    this.temporaryStartPosition = { x: 0, y: 0 };
    this.temporaryEndPosition = { x: 0, y: 0 };

    this.onClick = this.onClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onRightClick = this.onRightClick.bind(this);
    this.onCollapse = this.onCollapse.bind(this);
  }

  getClientOffset({ pageX, pageY }) {
    const x = pageX - this.canvasEl.offsetLeft;
    const y = pageY - this.canvasEl.offsetTop;

    return {
      x,
      y,
    };
  }

  clear() {
    this.context.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.drawedLines.forEach((line) => {
      line.draw();
    });
  }

  drawIntersections(lines = this.drawedLines) {
    if (lines.length < 1) {
      return;
    }

    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const intersection = calculateIntersection(
          lines[i].startPosition,
          lines[i].endPosition,
          lines[j].startPosition,
          lines[j].endPosition
        );

        if (intersection) {
          const point = new Point(intersection.x, intersection.y);
          point.draw();
        }
      }
    }
  }

  onClick(event) {
    if (this.isDrawStart) {
      this.isDrawStart = false;
      this.drawedLines.push(
        new Line(this.temporaryStartPosition, this.temporaryEndPosition)
      );
    } else {
      this.isDrawStart = true;
      this.temporaryStartPosition = this.getClientOffset(event);
    }
  }

  onMouseMove(event) {
    if (!this.isDrawStart) return;

    this.temporaryEndPosition = this.getClientOffset(event);
    this.clear();

    const line = new Line(
      this.temporaryStartPosition,
      this.temporaryEndPosition
    );
    line.draw();
    this.drawIntersections([...this.drawedLines, line]);
  }

  onRightClick(event) {
    event.preventDefault();
    this.isDrawStart = false;
    this.clear();
    this.drawIntersections();
  }

  onCollapse() {
    const lineStep = 5;
    let reqAnim;

    const animate = () => {
      this.context.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);

      this.drawedLines.forEach((line, index) => {
        const centerPosition = line.getCenterPosition();
        const vector = line.getVector();

        let startPosition = line.startPosition;
        let endPosition = line.endPosition;

        const lineStartPart = new Line(startPosition, centerPosition);
        lineStartPart.draw();

        startPosition.x += vector.x * lineStep;
        startPosition.y += vector.y * lineStep;

        const lineEndPart = new Line(endPosition, centerPosition);
        lineEndPart.draw();

        endPosition.x -= vector.x * lineStep;
        endPosition.y -= vector.y * lineStep;

        if (
          (startPosition.x >= centerPosition.x ||
            startPosition.y >= centerPosition.y) &&
          (endPosition.x <= centerPosition.x ||
            endPosition.y <= centerPosition.y)
        ) {
          this.drawedLines.splice(index, 1);
        }
      });

      // request another loop of animation
      reqAnim = window.requestAnimationFrame(animate);

      if (!this.drawedLines.length) {
        this.context.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
        cancelAnimationFrame(reqAnim);
      }
    };

    // start the animation
    reqAnim = window.requestAnimationFrame(animate);
  }
}

class Line extends Canvas {
  constructor(startPosition, endPosition) {
    super();
    this.startPosition = startPosition;
    this.endPosition = endPosition;
  }

  draw() {
    this.context.beginPath();
    this.context.moveTo(this.startPosition.x, this.startPosition.y);
    this.context.lineTo(this.endPosition.x, this.endPosition.y);
    this.context.stroke();
  }

  getCenterPosition() {
    const x =
      (this.endPosition.x - this.startPosition.x) / 2 + this.startPosition.x;
    const y =
      (this.endPosition.y - this.startPosition.y) / 2 + this.startPosition.y;

    return {
      x,
      y,
    };
  }

  getVector() {
    const centerPosition = this.getCenterPosition();
    const uVect = {
      x: centerPosition.x - this.startPosition.x,
      y: centerPosition.y - this.startPosition.y,
    };

    const vectorNorm = Math.sqrt(uVect.x * uVect.x + uVect.y * uVect.y);
    uVect.x /= vectorNorm;
    uVect.y /= vectorNorm;

    return uVect;
  }
}

class Point extends Canvas {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }

  draw(color = "red") {
    const pointX = Math.round(this.x);
    const pointY = Math.round(this.y);

    this.context.beginPath();
    this.context.fillStyle = color;
    this.context.arc(pointX, pointY, 5, 0 * Math.PI, 2 * Math.PI);
    this.context.fill();
  }
}

const buttonCollapse = document.getElementById("collapse");
const canvas = new Canvas();
const { canvasEl, onClick, onMouseMove, onRightClick, onCollapse } = canvas;

canvasEl.addEventListener("click", onClick);

canvasEl.addEventListener("mousemove", onMouseMove);

canvasEl.addEventListener("contextmenu", onRightClick);

buttonCollapse.addEventListener("click", onCollapse);
