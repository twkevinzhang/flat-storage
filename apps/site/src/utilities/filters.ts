import { ObjectEntity, ObjectsFilter } from '@site/models';

/**
 * Apply filter conditions to an array of objects
 * @param objects - Array of ObjectEntity to filter
 * @param filter - Filter conditions
 * @returns Filtered array of ObjectEntity
 */
export function applyObjectFilter(
  objects: ObjectEntity[],
  filter: ObjectsFilter
): ObjectEntity[] {
  let result = objects;
  
  if (filter.isEmpty) return result;

  const { name, createdAt } = filter;

  // Apply name filter
  if (name && name.operator && name.condition) {
    const condition = name.condition.toLowerCase();
    if (name.operator === 'contains') {
      result = result.filter((f) =>
        f.name.toLowerCase().includes(condition)
      );
    } else if (name.operator === 'notContains') {
      result = result.filter(
        (f) => !f.name.toLowerCase().includes(condition)
      );
    }
  }

  // Apply date filter
  if (createdAt) {
    if (createdAt.start) {
      result = result.filter(
        (f) => f.createdAt && f.createdAt >= createdAt.start!
      );
    }
    if (createdAt.end) {
      result = result.filter(
        (f) => f.createdAt && f.createdAt <= createdAt.end!
      );
    }
  }

  return result;
}
