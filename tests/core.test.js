import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const schemaDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'schema');
const load = (file) => JSON.parse(readFileSync(path.join(schemaDir, file), 'utf-8'));

const core = load('core.json');
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
for (const file of readdirSync(schemaDir).filter((name) => name.endsWith('.json'))) {
    ajv.addSchema(load(file));
}
const validateAgainstCalm = ajv.getSchema(load('calm.json').$id);

const pattern = {
    $schema: load('calm.json').$id,
    $id: 'https://example.com/patterns/web-client.json',
    title: 'Web client pattern',
    type: 'object',
    properties: {
        nodes: {
            type: 'array',
            minItems: 1,
            prefixItems: [{ $ref: `${core.$id}#/defs/node` }],
        },
    },
    required: ['nodes'],
};

test('a pattern validates against calm.json', () => {
    assert.ok(validateAgainstCalm(pattern), JSON.stringify(validateAgainstCalm.errors));
});

test('core.json does not declare a property named additionalProperties', () => {
    assert.equal('additionalProperties' in core.properties, false);
});
