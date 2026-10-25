import { describe, expect, it } from 'vitest';
import { getAncestry, getPillarIdsForPlant, getPlantOf, getPlants } from './organization.js';
import { organization, users } from './sampleData.js';

const task = 'plant-lyon/department-1/workshop-2/job-1/workstation-2/task-1';

describe('organization helpers', () => {
  it('lists the three plants', () => {
    expect(getPlants(organization).map((plant) => plant.name)).toEqual(['Lyon', 'Curitiba', 'Porto']);
  });

  it('walks up from a task to the department and finds its plant', () => {
    expect(getAncestry(organization, task).map((node) => node.type)).toEqual([
      'department',
      'workshop',
      'job',
      'workstation',
      'task',
    ]);
    expect(getPlantOf(organization, task).id).toBe('plant-lyon');
  });

  it('gives a user the pillars of a plant, or none', () => {
    const ben = users.find((user) => user.id === 'user-ben');
    expect(getPillarIdsForPlant(ben, 'plant-curitiba')).toEqual(['pillar-hs', 'pillar-env']);
    expect(getPillarIdsForPlant(ben, 'plant-lyon')).toEqual([]);
  });
});
