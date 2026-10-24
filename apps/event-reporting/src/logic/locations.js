// Location picker rules (FR-005): the locations of a plant as full paths (down to the task, or
// from the workshop for TF4 / TF5), text search over the paths, and reading a station QR code.
// A location is { departmentId, …, taskId }; levels below the chosen one stay empty.

import { LOCATION_LEVELS } from './validation.js';

// Node types of the location levels, from the top.
export const LEVEL_TYPES = ['department', 'workshop', 'job', 'workstation', 'task'];

function isDeepEnough(node, minType) {
  return LEVEL_TYPES.indexOf(node.type) >= LEVEL_TYPES.indexOf(minType);
}

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

// { departmentId, workshopId, jobId, workstationId, taskId } for a node; deeper levels stay empty.
export function locationFromNode(organization, nodeId) {
  const chain = getAncestry(organization, nodeId);
  return Object.fromEntries(LOCATION_LEVELS.map((level, index) => [level, chain[index] ? chain[index].id : '']));
}

// Every location of the plant at minType or deeper (tasks only by default), with its path names.
export function buildLocationPaths(organization, plantId, minType = 'task') {
  return organization
    .filter(
      (node) =>
        LEVEL_TYPES.includes(node.type) && isDeepEnough(node, minType) && getPlantOf(organization, node.id)?.id === plantId,
    )
    .map((node) => {
      const chain = getAncestry(organization, node.id);
      return {
        nodeId: node.id,
        location: locationFromNode(organization, node.id),
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
// { location } when the code is deep enough, { browseFrom } for a higher level, or { error }.
export function resolveQrCode(organization, plantId, code, minType = 'task') {
  const node = organization.find((item) => item.id === code.trim());
  if (!node || !LEVEL_TYPES.includes(node.type)) {
    return { error: 'This QR code is not a known location.' };
  }
  if (getPlantOf(organization, node.id)?.id !== plantId) {
    return { error: 'This QR code belongs to another plant.' };
  }
  if (isDeepEnough(node, minType)) {
    return { location: locationFromNode(organization, node.id) };
  }
  return { browseFrom: node.id };
}
