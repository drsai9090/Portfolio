import assert from 'node:assert/strict';
import test from 'node:test';
import { projects, stages, tourStages } from '../journey-content.js';
import { resolveRoute } from '../routes.js';

test('project pages, related work and tour links resolve to complete content', () => {
  const projectIds = projects.map(project => project.id);
  const stageIds = stages.map(stage => stage.id);
  assert.equal(new Set(projectIds).size, projects.length);
  for (const project of projects) {
    assert.deepEqual(resolveRoute(`#/project/${project.id}`, projectIds, stageIds), { page: 'project', id: project.id });
    for (const key of ['title', 'summary', 'status', 'role', 'problem', 'overview', 'approach', 'outcome', 'limitations', 'next']) {
      assert.ok(project[key]?.trim(), `${project.id} needs ${key}`);
    }
    for (const key of ['stack', 'districts', 'decisions', 'flow']) assert.ok(project[key].length, `${project.id} needs ${key}`);
    for (const url of [project.repo, project.live].filter(Boolean)) assert.equal(new URL(url).protocol, 'https:');
  }
  for (const stage of stages) {
    for (const id of stage.projectIds) assert.ok(projectIds.includes(id), `${stage.id} references missing project ${id}`);
    assert.deepEqual(resolveRoute(`#/stage/${stage.id}`, projectIds, stageIds), { page: 'stage', id: stage.id });
  }
  for (const id of tourStages) assert.ok(stageIds.includes(id));
  assert.deepEqual(resolveRoute('#/project/missing', projectIds, stageIds), { page: 'not-found' });
});
