import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const schemaDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'schema');

function listJsonFiles(dir) {
    if (!statSync(dir, { throwIfNoEntry: false })) {
        return [];
    }
    return readdirSync(dir, { withFileTypes: true, recursive: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
        .map((entry) => path.join(entry.parentPath ?? entry.path, entry.name));
}

// The schema/ directory is empty until the Phase 2 history migration lands; these
// tests become meaningful the moment schema files are added, without needing changes.
test('every schema document is valid JSON', () => {
    const files = listJsonFiles(schemaDir);
    for (const file of files) {
        assert.doesNotThrow(() => JSON.parse(readFileSync(file, 'utf-8')), `${file} should be valid JSON`);
    }
});

test('every schema document compiles as a JSON Schema (2020-12) and all $refs resolve', () => {
    const files = listJsonFiles(schemaDir);
    if (files.length === 0) {
        return;
    }

    const ajv = new Ajv2020({ strict: false, allErrors: true });
    addFormats(ajv);

    const schemas = files.map((file) => JSON.parse(readFileSync(file, 'utf-8')));
    for (const schema of schemas) {
        ajv.addSchema(schema, schema.$id);
    }
    for (const [index, schema] of schemas.entries()) {
        assert.doesNotThrow(
            () => ajv.compile(schema),
            `${files[index]} should compile without unresolved $refs`
        );
    }
});

test('every schema document declares a unique $id', () => {
    const files = listJsonFiles(schemaDir);
    const ids = new Map();
    for (const file of files) {
        const schema = JSON.parse(readFileSync(file, 'utf-8'));
        assert.ok(schema.$id, `${file} is missing a $id`);
        assert.ok(!ids.has(schema.$id), `${file} duplicates $id ${schema.$id} already declared by ${ids.get(schema.$id)}`);
        ids.set(schema.$id, file);
    }
});
