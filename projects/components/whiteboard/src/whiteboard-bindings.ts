import type { WhiteboardBinding, WhiteboardElement } from './whiteboard.models';

type Point = { x: number; y: number };
export const connectorEnds = ['start', 'end'] as const;
export type ConnectorEnd = typeof connectorEnds[number];
export const bindingKey = { start: 'startBinding', end: 'endBinding' } as const;

export function isConnector(element: WhiteboardElement): boolean {
  return element.type === 'line' || element.type === 'arrow';
}

function isBlock(element: WhiteboardElement): boolean {
  return element.width > 0 && element.height > 0 &&
    (element.type === 'rectangle' || element.type === 'ellipse' || element.type === 'diamond' || element.type === 'note');
}

function toWorld(element: WhiteboardElement, point: Point): Point {
  const angle = (element.rotation ?? 0) * Math.PI / 180;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const x = point.x * (element.scaleX ?? 1), y = point.y * (element.scaleY ?? 1);
  return { x: element.x + x * cos - y * sin, y: element.y + x * sin + y * cos };
}

function toLocal(element: WhiteboardElement, point: Point): Point {
  const angle = (element.rotation ?? 0) * Math.PI / 180;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const x = point.x - element.x, y = point.y - element.y;
  return { x: (x * cos + y * sin) / (element.scaleX ?? 1), y: (y * cos - x * sin) / (element.scaleY ?? 1) };
}

function anchorPoint(block: WhiteboardElement, binding: WhiteboardBinding): Point {
  return toWorld(block, { x: binding.anchor[0] * block.width, y: binding.anchor[1] * block.height });
}

function outlineDistance(block: WhiteboardElement, x: number, y: number): number {
  if (block.type === 'ellipse') return Math.hypot(x, y);
  if (block.type === 'diamond') return Math.abs(x) + Math.abs(y);
  return Math.max(Math.abs(x), Math.abs(y));
}

function cornerRadius(block: WhiteboardElement): number {
  return Math.min(block.type === 'note' ? 4 : 8, block.width / 2, block.height / 2);
}

function outlineAnchor(block: WhiteboardElement, x: number, y: number): WhiteboardBinding {
  if (x === 0 && y === 0) x = 1;
  const distance = outlineDistance(block, x, y);
  let u = (1 + x / distance) / 2, v = (1 + y / distance) / 2;
  if (block.type === 'rectangle' || block.type === 'note') {
    const radius = cornerRadius(block);
    const dx = (u - 0.5) * block.width, dy = (v - 0.5) * block.height;
    const cx = Math.sign(dx) * (block.width / 2 - radius);
    const cy = Math.sign(dy) * (block.height / 2 - radius);
    if (Math.abs(dx) > Math.abs(cx) && Math.abs(dy) > Math.abs(cy)) {
      // Where the center ray meets the rounded corner, before it reaches the bounding box.
      const lengthSquared = dx * dx + dy * dy;
      const projection = dx * cx + dy * cy;
      const offset = cx * cx + cy * cy - radius * radius;
      const t = (projection + Math.sqrt(Math.max(0, projection * projection - lengthSquared * offset))) / lengthSquared;
      u = 0.5 + (u - 0.5) * t;
      v = 0.5 + (v - 0.5) * t;
    }
  }
  return { elementId: block.id, anchor: [Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v))] };
}

function facingAnchor(block: WhiteboardElement, other: Point): WhiteboardBinding {
  const local = toLocal(block, other);
  return outlineAnchor(block, 2 * local.x / block.width - 1, 2 * local.y / block.height - 1);
}

/** A segment starting on a convex outline stays outside if it leaves along the tangent or outward. */
function canReach(block: WhiteboardElement, binding: WhiteboardBinding, other: Point): boolean {
  const tolerance = 1e-7;
  const local = toLocal(block, other);
  const [u, v] = binding.anchor;
  if (block.type === 'rectangle' || block.type === 'note') {
    const radius = cornerRadius(block);
    const x = u * block.width, y = v * block.height;
    const nx = x - Math.max(radius, Math.min(block.width - radius, x));
    const ny = y - Math.max(radius, Math.min(block.height - radius, y));
    return Math.hypot(nx, ny) >= radius - tolerance && nx * (local.x - x) + ny * (local.y - y) >= -tolerance;
  }
  const x = 2 * u - 1, y = 2 * v - 1;
  if (outlineDistance(block, x, y) < 1 - tolerance) return false;
  const dx = 2 * local.x / block.width - 1 - x, dy = 2 * local.y / block.height - 1 - y;
  if (block.type === 'ellipse') return x * dx + y * dy >= -tolerance;
  // At a diamond vertex, either adjoining edge can be the outward side.
  const alongX = Math.abs(x) < tolerance ? Math.abs(dx) : Math.sign(x) * dx;
  const alongY = Math.abs(y) < tolerance ? Math.abs(dy) : Math.sign(y) * dy;
  return alongX + alongY >= -tolerance;
}

export function findBinding(elements: readonly WhiteboardElement[], point: Point, other: Point, tolerance: number, exclude?: string) {
  let best: { binding: WhiteboardBinding; point: Point; distance: number } | undefined;
  for (let i = elements.length - 1; i >= 0; i--) {
    const block = elements[i];
    if (block.id === exclude || block.opacity === 0 || !isBlock(block)) continue;
    const local = toLocal(block, point);
    const x = 2 * local.x / block.width - 1, y = 2 * local.y / block.height - 1;
    const inside = outlineDistance(block, x, y) <= 1;
    let binding = outlineAnchor(block, x, y);
    let snap = anchorPoint(block, binding);
    const distance = Math.hypot(snap.x - point.x, snap.y - point.y);
    if (inside) {
      if (distance > tolerance || (x === 0 && y === 0)) {
        binding = facingAnchor(block, other);
        snap = anchorPoint(block, binding);
      }
      return { binding, point: snap };
    }
    if (distance <= tolerance && (!best || distance < best.distance)) best = { binding, point: snap, distance };
  }
  return best;
}

export function connectorEndPoint(element: WhiteboardElement, end: ConnectorEnd): Point {
  const points = element.points!;
  const index = end === 'start' ? 0 : points.length - 2;
  return toWorld(element, { x: points[index], y: points[index + 1] });
}

export function connectorBendPoint(element: WhiteboardElement): Point {
  const [x1, y1, x2, y2] = element.points!;
  const [x, y] = element.bend ?? [(x1 + x2) / 2, (y1 + y2) / 2];
  return toWorld(element, { x, y });
}

/** A quadratic through the bend at t=0.5, expressed as a cubic for Konva. */
function curveControl(start: Point, bend: Point, end: Point): Point {
  return { x: 2 * bend.x - (start.x + end.x) / 2, y: 2 * bend.y - (start.y + end.y) / 2 };
}

export function connectorPath(element: WhiteboardElement): { points: number[]; bezier: boolean } {
  const points = [...element.points ?? []];
  if (!element.bend || points.length !== 4) return { points, bezier: false };
  const [x1, y1, x2, y2] = points, [x, y] = element.bend;
  const control = curveControl({ x: x1, y: y1 }, { x, y }, { x: x2, y: y2 });
  return { points: [
    x1, y1, (x1 + 2 * control.x) / 3, (y1 + 2 * control.y) / 3,
    (x2 + 2 * control.x) / 3, (y2 + 2 * control.y) / 3, x2, y2,
  ], bezier: true };
}

export function setConnectorBend(element: WhiteboardElement, point?: Point): WhiteboardElement {
  if (!point && !element.bend) return element;
  const local = point && toLocal(element, point);
  return withConnectorSize({ ...element, bend: local && [local.x, local.y] }, element.points!);
}

export function setConnectorEnds(element: WhiteboardElement, start?: Point, end?: Point): WhiteboardElement {
  if (!start && !end) return element;
  const points = [...element.points!];
  if (start) {
    const local = toLocal(element, start);
    points[0] = local.x;
    points[1] = local.y;
  }
  if (end) {
    const local = toLocal(element, end);
    points[points.length - 2] = local.x;
    points[points.length - 1] = local.y;
  }
  return withConnectorSize(element, points);
}

function withConnectorSize(element: WhiteboardElement, points: readonly number[]): WhiteboardElement {
  let minX = element.bend?.[0] ?? points[0], maxX = minX, minY = element.bend?.[1] ?? points[1], maxY = minY;
  for (let i = 0; i < points.length; i += 2) {
    minX = Math.min(minX, points[i]); maxX = Math.max(maxX, points[i]);
    minY = Math.min(minY, points[i + 1]); maxY = Math.max(maxY, points[i + 1]);
  }
  return { ...element, points, width: maxX - minX, height: maxY - minY };
}

export function resolveConnector(element: WhiteboardElement, getBlock: (id: string) => WhiteboardElement | undefined): WhiteboardElement {
  if (!isConnector(element) || !element.points || (!element.startBinding && !element.endBinding)) return element;
  const start = element.startBinding && getBlock(element.startBinding.elementId);
  const end = element.endBinding && getBlock(element.endBinding.elementId);
  let startBinding = start && isBlock(start) ? element.startBinding : undefined;
  let endBinding = end && isBlock(end) ? element.endBinding : undefined;
  let startPoint = start && startBinding ? anchorPoint(start, startBinding) : connectorEndPoint(element, 'start');
  let endPoint = end && endBinding ? anchorPoint(end, endBinding) : connectorEndPoint(element, 'end');
  const bend = element.bend && connectorBendPoint(element);
  const control = bend && curveControl(startPoint, bend, endPoint);
  if (element.points.length === 4 &&
      ((start && startBinding && !canReach(start, startBinding, control ?? endPoint)) ||
       (end && endBinding && !canReach(end, endBinding, control ?? startPoint)))) {
    // Use a guide independent of the current anchors so resolving again keeps the same sides.
    const startCenter = start && startBinding ? toWorld(start, { x: start.width / 2, y: start.height / 2 }) : startPoint;
    const endCenter = end && endBinding ? toWorld(end, { x: end.width / 2, y: end.height / 2 }) : endPoint;
    const guide = bend && curveControl(startCenter, bend, endCenter);
    if (start && startBinding) {
      startBinding = facingAnchor(start, guide ?? endCenter);
      startPoint = anchorPoint(start, startBinding);
    }
    if (end && endBinding) {
      endBinding = facingAnchor(end, guide ?? startCenter);
      endPoint = anchorPoint(end, endBinding);
    }
  }
  return setConnectorEnds({ ...element, startBinding, endBinding }, startBinding ? startPoint : undefined, endBinding ? endPoint : undefined);
}

/** When the blocks overlap along the connector, there may be no visible path. */
export function isConnectorObscured(element: WhiteboardElement, getBlock: (id: string) => WhiteboardElement | undefined): boolean {
  if (!isConnector(element) || element.points?.length !== 4 || (!element.startBinding && !element.endBinding)) return false;
  const startPoint = connectorEndPoint(element, 'start'), endPoint = connectorEndPoint(element, 'end');
  if (!element.bend && Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y) < 1e-7) return true;
  const start = element.startBinding && getBlock(element.startBinding.elementId);
  const end = element.endBinding && getBlock(element.endBinding.elementId);
  const control = element.bend && curveControl(startPoint, connectorBendPoint(element), endPoint);
  return !!((start && element.startBinding && !canReach(start, element.startBinding, control ?? endPoint)) ||
    (end && element.endBinding && !canReach(end, element.endBinding, control ?? startPoint)));
}

export function resolveBindings(elements: readonly WhiteboardElement[]): readonly WhiteboardElement[] {
  if (!elements.some(element => element.startBinding || element.endBinding)) return elements;
  const byId = new Map(elements.map(element => [element.id, element]));
  return elements.map(element => resolveConnector(element, id => byId.get(id)));
}
