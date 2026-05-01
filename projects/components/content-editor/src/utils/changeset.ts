import { type } from 'os'; // Note: This import seems unused, consider removing it.

/**
 * Describes a single change found during comparison.
 * path: An array of keys/indices representing the location of the change.
 * type: The type of change ('added', 'deleted', 'updated').
 * oldValue: The value in the first object/array (for 'deleted', 'updated').
 * newValue: The value in the second object/array (for 'added', 'updated').
 */
export interface Change {
  path: (string | number)[];
  type: 'added' | 'deleted' | 'updated';
  oldValue?: unknown;
  newValue?: unknown;
}

/**
 * The result of the comparison.
 * hasChanges: A boolean indicating if any differences were found.
 * changes: An array detailing each specific change.
 */
export interface Changeset {
  hasChanges: boolean;
  changes: Change[];
}

/**
 * Recursively finds differences between two values (objects, arrays, primitives).
 *
 * @param obj1 The first value to compare.
 * @param obj2 The second value to compare.
 * @param currentPath The current path being explored.
 * @param visited A WeakMap to track visited object pairs for cycle detection.
 * @returns An array of Change objects found within this branch.
 */
function findDifferences(
  obj1: unknown,
  obj2: unknown,
  currentPath: (string | number)[] = [],
  visited: WeakMap<object, Set<object>> = new WeakMap()
): Change[] {
  const changes: Change[] = [];

  // 1. Handle identical values (quick exit)
  if (Object.is(obj1, obj2)) { // Use Object.is for better handling of NaN, -0/+0
    return changes;
  }

  // 2. Handle different types or one being null/undefined
  const type1 = typeof obj1;
  const type2 = typeof obj2;
  if (type1 !== type2 || obj1 === null || obj2 === null || obj1 === undefined || obj2 === undefined) {
    changes.push({ path: currentPath, type: 'updated', oldValue: obj1, newValue: obj2 });
    return changes;
  }

  // 3. Detect cycles
  if (type1 === 'object' && obj1 !== null && type2 === 'object' && obj2 !== null) {
    const obj1Object = obj1 as object;
    const obj2Object = obj2 as object;

    let visited1 = visited.get(obj1Object);
    if (visited1) {
      if (visited1.has(obj2Object)) {
        return changes; // Cycle detected
      }
      visited1.add(obj2Object);
    } else {
      visited.set(obj1Object, new Set([obj2Object]));
    }

    let visited2 = visited.get(obj2Object);
    if (visited2) {
      if (visited2.has(obj1Object)) {
        return changes; // Cycle detected (reverse)
      }
      visited2.add(obj1Object);
    } else {
      visited.set(obj2Object, new Set([obj1Object]));
    }
  }

  // 4. Handle specific object types (e.g., Date)
  if (obj1 instanceof Date && obj2 instanceof Date) {
    if (obj1.getTime() !== obj2.getTime()) {
      changes.push({ path: currentPath, type: 'updated', oldValue: obj1, newValue: obj2 });
    }
    return changes;
  }

  // 5. Handle Arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    const maxLength = Math.max(obj1.length, obj2.length);
    for (let i = 0; i < maxLength; i++) {
      const pathSegment = i;
      const newPath = [...currentPath, pathSegment];
      const val1 = obj1[i];
      const val2 = obj2[i];

      if (i >= obj1.length) {
        changes.push({ path: newPath, type: 'added', newValue: val2 });
      } else if (i >= obj2.length) {
        changes.push({ path: newPath, type: 'deleted', oldValue: val1 });
      } else {
        changes.push(...findDifferences(val1, val2, newPath, visited));
      }
    }
    return changes;
  }

  // 6. Handle Objects
  const isObject = (o: unknown): o is Record<string, unknown> => o !== null && typeof o === 'object' && !Array.isArray(o) && !(o instanceof Date);

  if (isObject(obj1) && isObject(obj2)) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      const pathSegment = key;
      const newPath = [...currentPath, pathSegment];
      const val1 = obj1[key];
      const val2 = obj2[key];
      const keyIn1 = Object.prototype.hasOwnProperty.call(obj1, key);
      const keyIn2 = Object.prototype.hasOwnProperty.call(obj2, key);

      if (keyIn1 && !keyIn2) {
        changes.push({ path: newPath, type: 'deleted', oldValue: val1 });
      } else if (!keyIn1 && keyIn2) {
        changes.push({ path: newPath, type: 'added', newValue: val2 });
      } else if (keyIn1 && keyIn2) {
        changes.push(...findDifferences(val1, val2, newPath, visited));
      }
    }
    return changes;
  }

  // 7. Handle Primitives & other non-identical, non-handled object types
  changes.push({ path: currentPath, type: 'updated', oldValue: obj1, newValue: obj2 });
  return changes;
}

/**
 * Compares two objects or arrays deeply and returns a changeset.
 * Handles nested structures and circular references.
 *
 * @param obj1 The first object or array to compare.
 * @param obj2 The second object or array to compare.
 * @returns A Changeset object detailing the differences.
 */
export function compare(obj1: unknown, obj2: unknown): Changeset {
  const changes = findDifferences(obj1, obj2, [], new WeakMap());
  return {
    hasChanges: changes.length > 0,
    changes: changes,
  };
}
