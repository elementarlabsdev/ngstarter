export interface Point {
  x: number;
  y: number;
}

function ease(x: number): number {
  return 1 - Math.sqrt(1 - Math.pow(x, 2));
}

export class LazyPoint implements Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(point: Point): LazyPoint {
    this.x = point.x;
    this.y = point.y;
    return this;
  }

  moveByAngle(
    angle: number,
    distance: number,
    friction?: number
  ): LazyPoint {
    const angleRotated = angle + Math.PI / 2;

    if (friction) {
      this.x = this.x + Math.sin(angleRotated) * distance * ease(1 - friction);
      this.y = this.y - Math.cos(angleRotated) * distance * ease(1 - friction);
    } else {
      this.x = this.x + Math.sin(angleRotated) * distance;
      this.y = this.y - Math.cos(angleRotated) * distance;
    }
    return this;
  }

  equalsTo(point: Point): boolean {
    return this.x === point.x && this.y === point.y;
  }

  getDifferenceTo(point: Point): LazyPoint {
    return new LazyPoint(this.x - point.x, this.y - point.y);
  }

  getDistanceTo(point: Point): number {
    const diff = this.getDifferenceTo(point);
    return Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
  }

  getAngleTo(point: Point): number {
    const diff = this.getDifferenceTo(point);
    return Math.atan2(diff.y, diff.x);
  }

  toObject(): Point {
    return {
      x: this.x,
      y: this.y
    };
  }
}
