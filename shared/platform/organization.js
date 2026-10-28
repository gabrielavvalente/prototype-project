// Organization helpers used by every app: plants, the location hierarchy and a user's pillars.
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

export function getPlants(organization) {
  return organization.filter((node) => node.type === 'plant');
}

export function getPlantName(organization, plantId) {
  const plant = organization.find((node) => node.id === plantId);
  return plant ? plant.name : plantId;
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

// The pillars a user may access for events in one plant (empty when the plant is not theirs).
export function getPillarIdsForPlant(user, plantId) {
  const entry = user.access.find((item) => item.plantId === plantId);
  return entry ? entry.pillarIds : [];
}

// What plants can be chosen by (feature 009): their regions, countries and businesses, sorted.
export function plantFacets(organization) {
  const plants = getPlants(organization);
  const unique = (values) => [...new Set(values)].sort();
  return {
    regions: unique(plants.map((plant) => plant.region)),
    countries: unique(plants.map((plant) => plant.countryName)),
    businesses: organization.filter((node) => node.type === 'business').map((node) => ({ id: node.id, name: node.name })),
  };
}
