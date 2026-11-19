import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

const schemaDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'schema');
const ajv = new Ajv2020({ strict: false, allErrors: true });
for (const name of readdirSync(schemaDir).filter((file) => file.endsWith('.json'))) {
    ajv.addSchema(JSON.parse(readFileSync(path.join(schemaDir, name), 'utf-8')));
}
const flowSchema = JSON.parse(readFileSync(path.join(schemaDir, 'flow.json'), 'utf-8'));
const validateDocument = ajv.getSchema(flowSchema.$id);
const validateEmbedded = ajv.getSchema(`${flowSchema.$id}#/defs/flow`);

const flow = {
    'unique-id': 'flow-submit-payment',
    name: 'Submit Payment',
    description: 'A customer submits a payment in the mobile app.',
    transitions: [{ 'relationship-unique-id': 'mobile-app-to-api-gateway', 'sequence-number': 1, description: 'Submit payment request' }],
};

const document = {
    $schema: flowSchema.$id,
    $id: 'https://calm.finos.org/samples/payments-api/flows/submit-payment.json',
    'architecture-url': '/calm/namespaces/finos.payments/architectures/payments-api/versions/1.0.0',
    ...flow,
};

test('a flow document with $schema, $id and architecture-url is valid', () => {
    assert.ok(validateDocument(document), JSON.stringify(validateDocument.errors));
    const unpinned = { ...document, 'architecture-url': '/calm/namespaces/finos.payments/architectures/payments-api' };
    assert.ok(validateDocument(unpinned), JSON.stringify(validateDocument.errors));
    assert.ok(validateDocument(flow), JSON.stringify(validateDocument.errors));
});

test('a flow document is checked against the flow definition', () => {
    const withoutTransitions = structuredClone(document);
    delete withoutTransitions.transitions;
    for (const invalid of [{}, withoutTransitions, { ...document, owner: 'team-a' }, { ...document, 'architecture-url': '' }]) {
        assert.equal(validateDocument(invalid), false, JSON.stringify(invalid));
    }
});

test('an embedded flow does not change', () => {
    assert.ok(validateEmbedded(flow), JSON.stringify(validateEmbedded.errors));
    for (const key of ['$schema', '$id', 'architecture-url']) {
        assert.equal(validateEmbedded({ ...flow, [key]: document[key] }), false, key);
    }
});
