import { LazyPoint, Point } from './lazy-point';

const RADIUS_DEFAULT = 30;

export interface LazyBrushOptions {
  radius?: number;
  enabled?: boolean;
  initialPoint?: Point;
  friction?: number;
}

export interface LazyBrushUpdateOptions {
  both?: boolean;
  friction?: number;
}

export class LazyBrush {
  _isEnabled: boolean;
  _hasMoved: boolean;
  radius: number;
  pointer: LazyPoint;
  brush: LazyPoint;
  angle: number;
  distance: number;
  friction: number;

  constructor(options: LazyBrushOptions = {}) {
    const initialPoint = options.initialPoint || { x: 0, y: 0 };
    this.radius = options.radius || RADIUS_DEFAULT;
    this._isEnabled = options.enabled === false ? false : true;
    this.friction = options.friction || 0;

    this.pointer = new LazyPoint(initialPoint.x, initialPoint.y);
    this.brush = new LazyPoint(initialPoint.x, initialPoint.y);

    this.angle = 0;
    this.distance = 0;
    this._hasMoved = false;
  }

  enable(): void { this._isEnabled = true; }
  disable(): void { this._isEnabled = false; }
  isEnabled(): boolean { return this._isEnabled; }
  setRadius(radius: number): void { this.radius = radius; }
  getRadius(): number { return this.radius; }
  setFriction(friction: number): void { this.friction = Math.max(0, Math.min(1, friction)); }
  getFriction(): number { return this.friction; }
  getBrushCoordinates(): Point { return this.brush.toObject(); }
  getPointerCoordinates(): Point { return this.pointer.toObject(); }
  getBrush(): LazyPoint { return this.brush; }
  getPointer(): LazyPoint { return this.pointer; }
  getAngle(): number { return this.angle; }
  getDistance(): number { return this.distance; }
  brushHasMoved(): boolean { return this._hasMoved; }

  update(
    newPointerPoint: Point,
    options: LazyBrushUpdateOptions = {}
  ): boolean {
    this._hasMoved = false;
    const currentFriction = options.friction !== undefined ? options.friction : this.friction;

    if (
      this.pointer.equalsTo(newPointerPoint) &&
      !options.both &&
      currentFriction === this.friction
    ) {
      return false;
    }

    this.pointer.update(newPointerPoint);

    if (options.both) {
      this._hasMoved = true;
      this.brush.update(newPointerPoint);
      return true;
    }

    if (this._isEnabled) {
      this.distance = this.pointer.getDistanceTo(this.brush);
      this.angle = this.pointer.getAngleTo(this.brush);
      const isOutside = this.distance > this.radius;
      if (isOutside) {
        this.brush.moveByAngle(
          this.angle,
          this.distance - this.radius,
          currentFriction
        );
        this._hasMoved = true;
      }
    } else {
      this.distance = 0;
      this.angle = 0;
      this.brush.update(newPointerPoint);
      this._hasMoved = true;
    }
    return true;
  }
}
