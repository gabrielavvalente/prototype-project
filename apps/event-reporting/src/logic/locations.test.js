import { describe, expect, it } from 'vitest';
import { organization } from '../../../../shared/platform/sampleData.js';
import { buildLocationPaths, locationFromNode, resolveQrCode, searchLocations } from './locations.js';

const lyonTask = 'plant-lyon/department-1/workshop-2/job-1/workstation-2/task-1';

describe('location paths (FR-005)', () => {
  const paths = buildLocationPaths(organization, 'plant-lyon');

  it('lists every task of the plant with its full path', () => {
    expect(paths).toHaveLength(32);
    const path = paths.find((item) => item.nodeId === lyonTask);
    expect(path.label).toBe('Assembly › Workshop South › Line operator › Station 20 › Loading parts');
  });

  it('builds the five location levels from a task', () => {
    expect(locationFromNode(organization, lyonTask)).toEqual({
      departmentId: 'plant-lyon/department-1',
      workshopId: 'plant-lyon/department-1/workshop-2',
      jobId: 'plant-lyon/department-1/workshop-2/job-1',
      workstationId: 'plant-lyon/department-1/workshop-2/job-1/workstation-2',
      taskId: lyonTask,
    });
  });

  it('stops at the workshop when allowed, leaving deeper levels empty', () => {
    const workshop = 'plant-lyon/department-1/workshop-2';
    expect(locationFromNode(organization, workshop)).toEqual({
      departmentId: 'plant-lyon/department-1',
      workshopId: workshop,
      jobId: '',
      workstationId: '',
      taskId: '',
    });
    // 4 workshops + 8 jobs + 16 workstations + 32 tasks in Lyon
    expect(buildLocationPaths(organization, 'plant-lyon', 'workshop')).toHaveLength(60);
  });

  it('finds paths containing every word typed, in any order', () => {
    const results = searchLocations(paths, 'station 20 loading south');
    expect(results.map((item) => item.label)).toEqual([
      'Assembly › Workshop South › Line operator › Station 20 › Loading parts',
      'Assembly › Workshop South › Forklift driver › Station 20 › Loading parts',
      'Logistics › Workshop South › Line operator › Station 20 › Loading parts',
      'Logistics › Workshop South › Forklift driver › Station 20 › Loading parts',
    ]);
    expect(searchLocations(paths, '   ')).toEqual([]);
    expect(searchLocations(paths, 'paint booth')).toEqual([]);
  });
});

describe('resolveQrCode', () => {
  it('selects the location of a task code', () => {
    expect(resolveQrCode(organization, 'plant-lyon', lyonTask).location.taskId).toBe(lyonTask);
  });

  it('selects a workstation code directly when the workshop is enough (TF4 / TF5)', () => {
    const workstation = 'plant-lyon/department-1/workshop-2/job-1/workstation-2';
    expect(resolveQrCode(organization, 'plant-lyon', workstation, 'workshop').location.workstationId).toBe(workstation);
  });

  it('opens browsing at a workstation code', () => {
    const workstation = 'plant-lyon/department-1/workshop-2/job-1/workstation-2';
    expect(resolveQrCode(organization, 'plant-lyon', workstation)).toEqual({ browseFrom: workstation });
  });

  it('refuses unknown codes and codes of another plant', () => {
    expect(resolveQrCode(organization, 'plant-lyon', 'hello').error).toMatch(/not a known location/);
    expect(resolveQrCode(organization, 'plant-lyon', 'plant-porto/department-1').error).toMatch(/another plant/);
  });
});
