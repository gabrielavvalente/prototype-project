// Location picker rules (FR-005): every task of a plant as a full path, text search over the
// paths, and reading a station QR code. A location is { departmentId, …, taskId }.

import { LOCATION_LEVELS } from './validation.js';

// From a node up to (not including) the plant: [department, workshop, …, node].
export function getAncestry(organization, nodeId) {
  const chain = [];
  let node = organization.find((item) => item.id === nodeId);
  while (node && node.type !== 'plant' && node.type !== 'business') {
    chain.unshift(node);
    node = organization.find((item) => item.id === node.parentId);
  }
  return chain;
}

export function getPlantOf(organization, nodeId) {
  let node = organization.find((item) => item.id === nodeId);
  while (node && node.type !== 'plant') {
    node = organization.find((item) => item.id === node.parentId);
  }
  return node || null;
}

// { departmentId, workshopId, jobId, workstationId, taskId } for a task.
export function locationFromTask(organization, taskId) {
  const chain = getAncestry(organization, taskId);
  return Object.fromEntries(LOCATION_LEVELS.map((level, index) => [level, chain[index] ? chain[index].id : '']));
}

// Every task of the plant with the names along its path.
export function buildLocationPaths(organization, plantId) {
  return organization
    .filter((node) => node.type === 'task' && getPlantOf(organization, node.id)?.id === plantId)
    .map((task) => {
      const chain = getAncestry(organization, task.id);
      return {
        taskId: task.id,
        location: locationFromTask(organization, task.id),
        names: chain.map((node) => node.name),
        label: chain.map((node) => node.name).join(' › '),
      };
    });
}

// Every word typed must appear somewhere in the path (any order, ignoring case).
export function searchLocations(paths, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [];
  }
  return paths.filter((path) => words.every((word) => path.label.toLowerCase().includes(word)));
}

// A station QR code holds a location id. Returns what to do with it:
// { location } for a task, { browseFrom } for a higher level, or { error } when it cannot be used.
export function resolveQrCode(organization, plantId, code) {
  const node = organization.find((item) => item.id === code.trim());
  if (!node || !['department', 'workshop', 'job', 'workstation', 'task'].includes(node.type)) {
    return { error: 'This QR code is not a known location.' };
  }
  if (getPlantOf(organization, node.id)?.id !== plantId) {
    return { error: 'This QR code belongs to another plant.' };
  }
  if (node.type === 'task') {
    return { location: locationFromTask(organization, node.id) };
  }
  return { browseFrom: node.id };
}
