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

// publish-site.yml publishes only the JSON files at the top of each standard directory: the schemas,
// and documents that conform to them, such as the default C4 mapping.
const publishedFiles = standardNames.flatMap((name) => listJsonFiles(path.join(standardsDir, name)));
const isJsonSchema = (file) => readJson(file).$schema?.startsWith('https://json-schema.org/') ?? false;
const standardFiles = publishedFiles.filter(isJsonSchema);
const documentFiles = publishedFiles.filter((file) => !isJsonSchema(file));
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
    for (const file of publishedFiles) {
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

test('every example and published document is valid against the standard in its $schema', () => {
    assert.ok(exampleFiles.length > 0, 'no examples found');
    for (const file of [...exampleFiles, ...documentFiles]) {
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

test('the C4 mapping standard rejects unknown kinds, fields and nesting modes', () => {
    const example = readJson(path.join(standardsDir, 'c4', 'examples', 'acme.c4-mapping.json'));
    const validate = ajv.getSchema(example.$schema);
    const withoutUniqueId = structuredClone(example);
    delete withoutUniqueId['unique-id'];
    const withNodeTypes = (nodeTypes) => ({ ...example, 'node-types': nodeTypes });
    for (const invalid of [
        withoutUniqueId,
        withNodeTypes({ service: 'system' }),
        withNodeTypes({ service: { external: true } }),
        withNodeTypes({ service: { kind: 'container', external: 'yes' } }),
        withNodeTypes({ service: { kind: 'container', technology: 'Java' } }),
        withNodeTypes({ '': 'container' }),
        withNodeTypes({ ecosystem: { kind: 'enterprise-boundary', external: true } }),
        withNodeTypes({ network: { kind: 'deployment-node', external: true } }),
        withNodeTypes({ folder: { kind: 'hidden', external: true } }),
        { ...example, nesting: 'flatten' },
        { ...example, extends: 'calm-default.c4-mapping.json' },
        { ...example, 'node-type': {} },
    ]) {
        assert.equal(validate(invalid), false, JSON.stringify(invalid));
    }
    for (const kind of ['person', 'software-system', 'container', 'component']) {
        const valid = withNodeTypes({ vendor: { kind, external: true } });
        assert.ok(validate(valid), JSON.stringify(validate.errors));
    }
    assert.ok(validate(withNodeTypes({ ecosystem: { kind: 'enterprise-boundary', external: false } })), JSON.stringify(validate.errors));
});

// A mapping that does not set nesting inherits it through extends, so the schema must not fill it in.
test('the C4 mapping schema adds no nesting to a mapping that does not set it', () => {
    const withDefaults = new Ajv2020({ strict: false, useDefaults: true });
    addFormats(withDefaults);
    const validate = withDefaults.compile(readJson(path.join(standardsDir, 'c4', 'c4-mapping.json')));
    const mapping = readJson(path.join(standardsDir, 'c4', 'examples', 'acme.c4-mapping.json'));
    assert.ok(validate(mapping), JSON.stringify(validate.errors));
    assert.equal(mapping.nesting, undefined);
});

test('every C4 mapping example extends a mapping published in this repository', () => {
    const published = new Set(documentFiles.map((file) => readJson(file).$id));
    for (const file of listJsonFiles(path.join(standardsDir, 'c4', 'examples'))) {
        const { extends: parent } = readJson(file);
        assert.ok(parent === undefined || published.has(parent), `${file} extends ${parent}, which is not published here`);
    }
});

const threatModelDir = path.join(standardsDir, 'threat-model', 'examples');

function threatModelExample(file) {
    const example = readJson(path.join(threatModelDir, file));
    return { example, validate: ajv.getSchema(example.$schema) };
}

test('the threat-model standard requires target-type, a flow, a methodology, an assessment date and threats', () => {
    const { example, validate } = threatModelExample('route-agent-request.threat-model.decorator.json');
    const without = (mutate) => {
        const copy = structuredClone(example);
        mutate(copy);
        return copy;
    };
    for (const invalid of [
        without((d) => delete d['target-type']),
        without((d) => delete d.data.flow),
        without((d) => delete d.data.methodology),
        without((d) => delete d.data['assessed-on']),
        without((d) => delete d.data.threats),
        without((d) => delete d.data['trust-boundaries'][0].elements),
        without((d) => (d.data['trust-boundaries'][0].elements = [])),
        without((d) => delete d.data.threats[0]['applies-to']),
        without((d) => (d.data.threats[0].status = 'open')),
        without((d) => (d.data.threats[0].likelihood = 'severe')),
        without((d) => (d.data['assessed-on'] = '18/11/2026')),
        { ...example, 'target-type': ['pattern'] },
        { ...example, type: 'review' },
    ]) {
        assert.equal(validate(invalid), false, JSON.stringify(invalid));
    }
    for (const valid of [
        without((d) => (d.data.threats = [])),
        without((d) => (d.data.threats[0]['firm-risk-id'] = 'RISK-1042')),
        without((d) => (d.data.threats[0].mitigations[0]['firm-owner'] = 'platform-team')),
        without((d) => delete d.data['trust-boundaries']),
    ]) {
        assert.ok(validate(valid), JSON.stringify(validate.errors));
    }
});

test('the threat-model standard checks what each status needs', () => {
    const { example, validate } = threatModelExample('submit-payment.stride.threat-model.decorator.json');
    const threat = (id, mutate) => {
        const copy = structuredClone(example);
        mutate(copy.data.threats.find((t) => t['unique-id'] === id));
        return copy;
    };
    for (const invalid of [
        threat('t-token-replay', (t) => delete t.mitigations),
        threat('t-token-replay', (t) => (t.mitigations = [])),
        threat('t-bola', (t) => delete t.mitigations),
        threat('t-token-replay', (t) => (t.mitigations[0].state = 'planned')),
        threat('t-no-audit', (t) => delete t['residual-risk']),
        threat('t-no-audit', (t) => delete t['residual-risk']['accepted-by']),
        threat('t-no-audit', (t) => delete t.justification),
        threat('t-no-audit', (t) => {
            t.status = 'transferred';
            delete t['residual-risk'];
        }),
        threat('t-submit-flood', (t) => (t.status = 'not-applicable')),
    ]) {
        assert.equal(validate(invalid), false, JSON.stringify(invalid));
    }
    for (const valid of [
        threat('t-submit-flood', (t) => delete t.mitigations),
        threat('t-submit-flood', (t) => {
            t.status = 'not-applicable';
            t.justification = 'The gateway is not reachable from the internet.';
        }),
    ]) {
        assert.ok(validate(valid), JSON.stringify(validate.errors));
    }
});

test('the STRIDE standard fixes the methodology and needs a STRIDE classification', () => {
    const { example, validate } = threatModelExample('submit-payment.stride.threat-model.decorator.json');
    const first = (mutate) => {
        const copy = structuredClone(example);
        mutate(copy.data.threats[0], copy);
        return copy;
    };
    for (const invalid of [
        first((t, d) => (d.data.methodology = 'PASTA')),
        first((t) => delete t.classification),
        first((t) => (t.classification = [{ scheme: 'CWE', value: 'CWE-294' }])),
        first((t) => (t.classification = [{ scheme: 'STRIDE', value: 'Spoofing' }])),
        first((t) => t.classification.push({ scheme: 'STRIDE', value: 'phishing' })),
    ]) {
        assert.equal(validate(invalid), false, JSON.stringify(invalid));
    }
    assert.ok(validate(first((t) => t.classification.push({ scheme: 'MITRE-ATTACK', value: 'T1550' }))), JSON.stringify(validate.errors));
});

test('the threat-model standard rejects empty strings and duplicate ids', () => {
    const { example, validate } = threatModelExample('submit-payment.stride.threat-model.decorator.json');
    const changed = (mutate) => {
        const copy = structuredClone(example);
        mutate(copy.data);
        return copy;
    };
    for (const invalid of [
        changed((d) => (d.flow = '')),
        changed((d) => (d['trust-boundaries'][0].elements = [''])),
        changed((d) => (d.threats[0].mitigations[0].control = '')),
        changed((d) => (d.threats[0]['applies-to'] = ['api-gateway', 'api-gateway'])),
        changed((d) => (d.threats[0]['sequence-numbers'] = [1, 1])),
    ]) {
        assert.equal(validate(invalid), false, JSON.stringify(invalid));
    }
});

// JSON Schema cannot compare a decorator with its target, so this checks the rules that the README gives tools.
test('every threat-model example names the flow, elements and sequence numbers of the architecture it targets', () => {
    const decorators = listJsonFiles(threatModelDir).map(readJson).filter((doc) => doc.type === 'threat-model');
    assert.ok(decorators.length > 0, 'no threat-model examples found');
    for (const decorator of decorators) {
        const name = decorator['unique-id'];
        const architecture = readJson(path.join(threatModelDir, decorator.target[0]));
        const elementIds = new Set([...architecture.nodes, ...architecture.relationships].map((e) => e['unique-id']));
        const flow = architecture.flows?.find((f) => f['unique-id'] === decorator.data.flow);
        assert.ok(flow, `${name}: flow ${decorator.data.flow} is not in the flows of ${decorator.target[0]}`);
        const sequenceNumbers = new Set(flow.transitions.map((t) => t['sequence-number']));

        const boundaries = decorator.data['trust-boundaries'] ?? [];
        const named = [
            ...boundaries.flatMap((b) => b.elements),
            ...decorator.data.threats.flatMap((t) => t['applies-to']),
        ];
        for (const id of [...named, ...decorator.data.threats.flatMap((t) => (t.mitigations ?? []).map((m) => m['attached-to']).filter(Boolean))]) {
            assert.ok(elementIds.has(id), `${name}: ${id} is not a node or relationship of ${decorator.target[0]}`);
        }
        for (const id of [decorator.data.flow, ...named]) {
            assert.ok(decorator['applies-to'].includes(id), `${name}: applies-to does not list ${id}`);
        }
        for (const number of decorator.data.threats.flatMap((t) => t['sequence-numbers'] ?? [])) {
            assert.ok(sequenceNumbers.has(number), `${name}: ${number} is not a sequence number of ${decorator.data.flow}`);
        }
        for (const ids of [boundaries.map((b) => b['unique-id']), decorator.data.threats.map((t) => t['unique-id'])]) {
            assert.equal(new Set(ids).size, ids.length, `${name}: duplicate unique-id in ${JSON.stringify(ids)}`);
        }
    }
});
