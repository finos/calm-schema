import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

const schemaFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'schema', 'decorators.json');
const schema = JSON.parse(readFileSync(schemaFile, 'utf-8'));

const ajv = new Ajv2020({ strict: false, allErrors: true });
ajv.addSchema(schema);
const validateDecorator = ajv.getSchema(`${schema.$id}#/defs/decorator`);

const decorator = {
    'unique-id': 'deployment-1',
    type: 'deployment',
    target: ['architectures/conference-signup.json'],
    'applies-to': ['conference-signup'],
    data: { status: 'completed' },
};

test('a decorator without the optional properties is valid', () => {
    assert.ok(validateDecorator(decorator), JSON.stringify(validateDecorator.errors));
});

test('a decorator can declare $schema and target-type', () => {
    const valid = validateDecorator({
        ...decorator,
        $schema: 'https://example.com/deployment.decorator.standard.json',
        'target-type': ['architecture', 'pattern'],
    });
    assert.ok(valid, JSON.stringify(validateDecorator.errors));
});

test('target-type accepts only CALM document types, at least one, with no duplicates', () => {
    for (const targetType of [['deployment'], [], ['architecture', 'architecture']]) {
        assert.equal(validateDecorator({ ...decorator, 'target-type': targetType }), false, JSON.stringify(targetType));
    }
});

test('a decorator still rejects other properties', () => {
    assert.equal(validateDecorator({ ...decorator, owner: 'team-a' }), false);
});
