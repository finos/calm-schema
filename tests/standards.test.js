import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaDir = path.join(rootDir, 'schema');
const standardsDir = path.join(rootDir, 'standards');

function readJson(file) {
    return JSON.parse(readFileSync(file, 'utf-8'));
}

function listJsonFiles(dir) {
    return readdirSync(dir)
        .filter((name) => name.endsWith('.json'))
        .map((name) => path.join(dir, name));
}

const standardNames = readdirSync(standardsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

// publish-site.yml publishes only the JSON files at the top of each standard directory.
const standardFiles = standardNames.flatMap((name) => listJsonFiles(path.join(standardsDir, name)));
const exampleFiles = standardNames.flatMap((name) => listJsonFiles(path.join(standardsDir, name, 'examples')));

const releaseUrl = /https:\/\/calm\.finos\.org\/release\/([0-9]+\.[0-9]+)\/meta\//g;

function releasesIn(schemas) {
    return new Set(schemas.flatMap((schema) => [...JSON.stringify(schema).matchAll(releaseUrl)].map((match) => match[1])));
}

function git(...args) {
    return execFileSync('git', args, { cwd: rootDir, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
}

// A standard keeps the schema release that it extends when schema/ moves on to the next release.
function readReleaseFromTag(version) {
    const tag = `v${version}`;
    let files;
    try {
        files = git('ls-tree', '--name-only', tag, 'schema/').split('\n');
    } catch {
        throw new Error(`A standard refers to release ${version}, which is not in schema/, and there is no tag ${tag}. Run git fetch upstream --tags.`);
    }
    return files.filter((file) => file.endsWith('.json')).map((file) => JSON.parse(git('show', `${tag}:${file}`)));
}

const schemas = listJsonFiles(schemaDir).map(readJson);
const standards = standardFiles.map(readJson);
const releaseInProgress = releasesIn(schemas);
const earlierReleases = [...releasesIn(standards)].filter((version) => !releaseInProgress.has(version));

const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
for (const schema of [...schemas, ...earlierReleases.flatMap(readReleaseFromTag), ...standards]) {
    ajv.addSchema(schema, schema.$id);
}

// One tag publishes all the standards in a directory, so they share one version.
test('every standard has a $id that is its URL on calm.finos.org', () => {
    assert.ok(standardFiles.length > 0, 'no standards found');
    const versions = new Map();
    for (const file of standardFiles) {
        const name = path.basename(path.dirname(file));
        const match = readJson(file).$id?.match(/^https:\/\/calm\.finos\.org\/standards\/([^/]+)\/([0-9]+\.[0-9]+)\/([^/]+)$/);
        assert.ok(match, `${file} has no $id of the form https://calm.finos.org/standards/<name>/<major>.<minor>/<file>`);
        assert.deepEqual([match[1], match[3]], [name, path.basename(file)], file);
        assert.equal(versions.get(name) ?? match[2], match[2], `${file} has a different version from the other ${name} standards`);
        versions.set(name, match[2]);
    }
});

test('every standard compiles and all $refs resolve', () => {
    for (const file of standardFiles) {
        assert.ok(ajv.getSchema(readJson(file).$id), file);
    }
});

test('every example is valid against the standard in its $schema', () => {
    assert.ok(exampleFiles.length > 0, 'no examples found');
    for (const file of exampleFiles) {
        const example = readJson(file);
        const validate = ajv.getSchema(example.$schema);
        assert.ok(validate, `${file} has $schema ${example.$schema}, which is not a standard in this repository`);
        assert.ok(validate(example), `${file}: ${JSON.stringify(validate.errors)}`);
    }
});

test('the deployment standard requires target-type, the type deployment and a status', () => {
    const example = readJson(path.join(standardsDir, 'deployment', 'examples', 'simple-deployment.decorator.json'));
    const validate = ajv.getSchema(example.$schema);
    const withoutTargetType = structuredClone(example);
    delete withoutTargetType['target-type'];
    const withoutStatus = structuredClone(example);
    delete withoutStatus.data.status;
    for (const invalid of [
        withoutTargetType,
        withoutStatus,
        { ...example, 'target-type': ['pattern'] },
        { ...example, type: 'review' },
    ]) {
        assert.equal(validate(invalid), false, JSON.stringify(invalid));
    }
});

test('the control-evaluation standard requires a fully qualified requirement-url, and findings when not met', () => {
    const example = readJson(path.join(standardsDir, 'control-evaluation', 'examples', 'ledger-change-not-met.decorator.json'));
    const validate = ajv.getSchema(example.$schema);
    const withoutTargetType = structuredClone(example);
    delete withoutTargetType['target-type'];
    const withoutFindings = structuredClone(example);
    delete withoutFindings.data.findings;
    const noFindings = structuredClone(example);
    noFindings.data.findings = [];
    const relativeRequirement = structuredClone(example);
    relativeRequirement.data.control['requirement-url'] = '/calm/domains/sdlc/controls/code-review/requirement/versions/1.0.0';
    const withoutStatus = structuredClone(example);
    delete withoutStatus.data.status;
    for (const invalid of [
        withoutTargetType,
        withoutFindings,
        noFindings,
        relativeRequirement,
        withoutStatus,
        { ...example, type: 'deployment' },
        { ...example, data: { ...example.data, status: 'passed' } },
    ]) {
        assert.equal(validate(invalid), false, JSON.stringify(invalid));
    }
    const met = structuredClone(withoutFindings);
    met.data.status = 'met';
    assert.ok(validate(met), JSON.stringify(validate.errors));
});

test('the control-evaluation standard allows findings only when not met', () => {
    const example = readJson(path.join(standardsDir, 'control-evaluation', 'examples', 'ledger-change-not-met.decorator.json'));
    const validate = ajv.getSchema(example.$schema);
    for (const status of ['met', 'not-applicable']) {
        const withFindings = structuredClone(example);
        withFindings.data.status = status;
        assert.equal(validate(withFindings), false, JSON.stringify(withFindings));
    }
});

test('the control-evaluation standard rejects empty strings and uppercase digests', () => {
    const example = readJson(path.join(standardsDir, 'control-evaluation', 'examples', 'ledger-change-not-met.decorator.json'));
    const validate = ajv.getSchema(example.$schema);
    const emptyControlId = structuredClone(example);
    emptyControlId.data.control['control-id'] = '';
    const emptyActor = structuredClone(example);
    emptyActor.data.actors.reviewer = '';
    const emptyCheck = structuredClone(example);
    emptyCheck.data.findings[0].check = '';
    const uppercaseDigest = structuredClone(example);
    uppercaseDigest.data['report-sha256'] = example.data['report-sha256'].toUpperCase();
    for (const invalid of [emptyControlId, emptyActor, emptyCheck, uppercaseDigest]) {
        assert.equal(validate(invalid), false, JSON.stringify(invalid));
    }
});
