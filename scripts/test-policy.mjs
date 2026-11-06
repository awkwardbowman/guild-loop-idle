#!/usr/bin/env node
// Select and execute Guild Loops tests by criticality, subsystem, release profile,
// changed files, or explicit case IDs. Node.js 24 required by CI.
import {readFileSync, readdirSync} from 'node:fs';
import {resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync, spawnSync} from 'node:child_process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const policy = JSON.parse(readFileSync(resolve(root, 'test-policy.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const priorityOrder = ['P0', 'P1', 'P2', 'P3'];
const critical = new Set(policy.criticalIds);
const smoke = new Set(policy.smokeIds);
const suites = policy.suites;
const cases = [];
const warnings = [];

for (const filename of readdirSync(resolve(root, 'tests')).filter(name => name.endsWith('.test.ts')).sort()) {
  const file = 'tests/' + filename;
  const source = readFileSync(resolve(root, file), 'utf8');
  const metadata = suites[file] || {priority: 'P1', groups: ['core'], ids: []};
  if (!suites[file]) warnings.push('New test suite ' + file + ' defaults to P1/core; classify it in test-policy.json.');
  const registered = new Set(metadata.ids);
  const found = new Set();
  const names = [...source.matchAll(/\b(?:test|it)\s*\(\s*(['"`])([^'"`]+)\1/g)].map(match => match[2]);
  for (const name of names) {
    const match = /^([A-Z]{1,3}\d{2})\b/.exec(name);
    if (!match) throw new Error(file + ' has an unnamed test: ' + name + '. Prefix every test title with a unique ID.');
    const id = match[1];
    if (found.has(id)) throw new Error('Duplicate test ID ' + id + ' in ' + file);
    found.add(id);
    if (!registered.has(id)) warnings.push('New case ' + id + ' in ' + file + ' inherits suite classification; review catalog.');
    const priority = critical.has(id) ? 'P0' : metadata.priority;
    if (!priorityOrder.includes(priority)) throw new Error('Invalid priority ' + priority + ' for ' + id);
    cases.push({id, name, file, priority, groups: new Set([...metadata.groups, ...(policy.extraGroups[id] || [])])});
  }
  for (const id of registered) if (!found.has(id)) warnings.push('Removed/renamed case ' + id + ' still listed in catalog for ' + file);
}
const caseById = new Map();
for (const entry of cases) {
  if (caseById.has(entry.id)) throw new Error('Duplicate test ID ' + entry.id + ' across ' + entry.file + ' and ' + caseById.get(entry.id).file);
  caseById.set(entry.id, entry);
}
for (const id of [...critical, ...smoke]) if (!caseById.has(id)) throw new Error('Critical/smoke test missing: ' + id);
for (const [file, metadata] of Object.entries(suites)) {
  if (!priorityOrder.includes(metadata.priority)) throw new Error('Invalid suite priority in ' + file);
  if (!Array.isArray(metadata.groups) || !metadata.groups.length) throw new Error('Missing suite groups in ' + file);
}
const argv = process.argv.slice(2);
const profile = argv.shift() || 'smoke';
const positionals = [];
let dryRun = false, only = false, base = null;
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '--dry-run' || arg === '--list') dryRun = true;
  else if (arg === '--only') only = true;
  else if (arg === '--base') base = argv[++i];
  else if (arg.startsWith('--base=')) base = arg.slice('--base='.length);
  else positionals.push(...arg.split(',').filter(Boolean));
}
function fail(message) {
  console.error(message);
  console.error('Profiles: smoke | targeted GROUP... | select ID... [--only] | changed [--base REF] | content | full | release | version patch|minor|major [GROUP...] | catalog');
  process.exit(2);
}
function pickGroups(groups, selected) {
  for (const entry of cases) if (groups.some(group => entry.groups.has(group))) selected.add(entry.id);
}
function pickIds(ids, selected) {
  for (const id of ids) {
    if (!caseById.has(id)) fail('Unknown test ID: ' + id);
    selected.add(id);
  }
}
// Return explicit affected groups; unknown code changes conservatively trigger full.
function impacts(path) {
  if (path.startsWith('docs/') || path.endsWith('.md') || path === '.gitignore') return [];
  if (path === 'test-policy.json' || path === 'package.json' || path === 'package-lock.json' ||
      path.startsWith('scripts/') || path.startsWith('.github/')) return ['*'];
  if (path.endsWith('.test.ts') && path.startsWith('tests/')) return ['file:' + path];
  if (path.startsWith('tests/')) return ['*']; // fixtures can affect any suite
  const mapping = {
    'src/engine.ts': ['*'], // central simulator affects nearly everything
    'src/persistence.ts': ['save', 'travel', 'integration'],
    'src/attributes.ts': ['attributes', 'checks', 'dungeon'],
    'src/skill-system.ts': ['attributes', 'checks', 'dungeon'],
    'src/rooms.ts': ['dungeon', 'content', 'checks'],
    'src/content.ts': ['content', 'progression', 'dungeon'],
    'src/story.ts': ['progression', 'content'],
    'src/equipment.ts': ['equipment', 'economy', 'dungeon'],
    'src/sections.ts': ['logging', 'ui'],
    'src/specialization.ts': ['attributes', 'checks', 'dungeon'],
  };
  if (mapping[path]) return mapping[path];
  if (path === 'index.html' || path.endsWith('.css') || (path.startsWith('src/') && path.endsWith('.tsx'))) return ['ui'];
  return ['*']; // new or unexpected executable files never silently skip validation
}
let selected = new Set(smoke);
let scope = profile;
if (profile === 'targeted') {
  if (!positionals.length) fail('targeted requires one or more groups, e.g. dungeon save');
  pickGroups(positionals, selected);
} else if (profile === 'select') {
  if (!positionals.length) fail('select requires one or more test IDs');
  if (only) selected = new Set();
  pickIds(positionals, selected);
} else if (profile === 'content') {
  pickGroups(['content', 'progression', 'integration'], selected);
} else if (profile === 'full' || profile === 'release') {
  selected = new Set(cases.map(entry => entry.id));
} else if (profile === 'version') {
  const level = positionals.shift();
  if (!['patch', 'minor', 'major'].includes(level)) fail('version requires patch, minor or major');
  scope = 'version/' + level;
  if (level === 'major') selected = new Set(cases.map(entry => entry.id));
  else {
    if (!positionals.length) fail('version ' + level + ' requires affected group(s) (e.g. dungeon, save, content)');
    pickGroups(positionals, selected);
    if (level === 'minor') pickGroups(['integration'], selected);
  }
} else if (profile === 'changed') {
  let changed = [];
  try {
    const args = base ? ['diff', '--name-only', '--diff-filter=ACMRT', base, 'HEAD'] : ['diff', '--name-only', 'HEAD'];
    const stdout = execFileSync('git', args, {cwd: root, encoding: 'utf8'});
    changed = stdout.split(/\r?\n/).filter(Boolean);
    if (!base) changed.push(...execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {cwd: root, encoding: 'utf8'}).split(/\r?\n/).filter(Boolean));
  } catch (error) { fail('Cannot calculate changed files: ' + error.message); }
  const groups = new Set();
  let full = false;
  for (const path of changed) for (const impact of impacts(path)) {
    if (impact === '*') full = true;
    else if (impact.startsWith('file:')) for (const entry of cases) if (entry.file === impact.slice(5)) selected.add(entry.id);
    else groups.add(impact);
  }
  if (full) selected = new Set(cases.map(entry => entry.id));
  else pickGroups([...groups], selected);
  console.log('Changed files (' + changed.length + '): ' + (changed.join(', ') || 'none'));
  console.log('Affected areas: ' + (full ? 'FULL (cross-cutting/unknown)' : [...groups].join(', ') || 'smoke only'));
} else if (profile === 'catalog') {
  selected = new Set();
} else if (profile !== 'smoke') fail('Unknown profile: ' + profile);
if (only && profile !== 'select') fail('--only applies only to select');
if (positionals.length && !['targeted', 'select'].includes(profile) && profile !== 'version') fail('Unexpected arguments: ' + positionals.join(' '));
const chosen = cases.filter(entry => selected.has(entry.id));
const counts = Object.fromEntries(priorityOrder.map(p => [p, chosen.filter(entry => entry.priority === p).length]));
console.log('\nGuild Loops test profile: ' + scope + ' | app ' + pkg.version);
console.log('Selected: ' + chosen.length + '/' + cases.length + '; NOT SELECTED/NOT RUN: ' + (cases.length - chosen.length));
console.log('Selected priorities: ' + Object.entries(counts).map(([p, n]) => p + '=' + n).join(', '));
if (warnings.length) for (const message of warnings) console.warn('Catalog notice: ' + message);
if (profile === 'catalog' || dryRun) {
  if (profile === 'catalog') {
    for (const [file, suite] of Object.entries(suites)) console.log(file + ': ' + suite.ids.length + ' registered, ' + suite.priority + ', ' + suite.groups.join('/'));
  } else console.log('Case IDs: ' + chosen.map(entry => entry.id).join(', '));
  process.exit(0);
}
if (!chosen.length) fail('No tests selected');
const files = [...new Set(chosen.map(entry => entry.file))].sort();
const all = chosen.length === cases.length;
const pattern = '^(?:' + chosen.map(entry => entry.id).join('|') + ')\\b';
const args = ['--experimental-strip-types', '--test', ...(!all ? ['--test-name-pattern=' + pattern] : []), ...files];
const result = spawnSync(process.execPath, args, {cwd: root, stdio: 'inherit'});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
if (profile === 'release') {
  console.log('\nRunning TypeScript + production build...');
  const build = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {cwd: root, stdio: 'inherit'});
  if (build.error) throw build.error;
  if (build.status !== 0) process.exit(build.status ?? 1);
  console.log('Automated release checks completed. Browser/mobile acceptance remains MANUAL and is NOT certified by this command.');
}
