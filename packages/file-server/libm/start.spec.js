import { createFileRepository } from '@komondor-lab/io-fs';
import t from 'assert';
import a from 'assertron';
import fetch from 'node-fetch';
import { dirSync } from 'tmp';
import { start } from '.';
import { context } from './context';
test('automatically find a port between 3698 and 3798', async () => {
    const server = await start();
    expect(server.info.port).toBeGreaterThanOrEqual(3698);
    expect(server.info.port).toBeLessThanOrEqual(3798);
    await server.stop();
});
test('if a port is specified and not available, will throw an error', async () => {
    const runningServer = await start();
    const e = await a.throws(start({ port: Number(runningServer.info.port) }));
    await runningServer.stop();
    expect(e.code).toBe('EADDRINUSE');
});
describe('server behavior', () => {
    let server;
    beforeAll(async () => {
        const tmp = dirSync();
        const repository = createFileRepository(tmp.name);
        await repository.writeSpec('exist', '{ "spec": "exist" }');
        await repository.writeScenario('exist', '{ "scenario": "exist" }');
        context.get().repository = repository;
        server = await start();
    });
    afterAll(() => {
        return server.stop();
    });
    function buildUrl(path) {
        return `http://localhost:${server.info.port}/komondor/${path}`;
    }
    test('get komondor info', async () => {
        const response = await fetch(buildUrl('info'));
        const actual = await response.text();
        const pjson = require('../package.json');
        t.strictEqual(actual, `{"name":"komondor","version":"${pjson.version}","url":"http://localhost:${server.info.port}","plugins":[]}`);
    });
    test('read not exist spec gets 404', async () => {
        const response = await fetch(buildUrl('specs/not exist'));
        expect(response.status).toBe(404);
    });
    test('read spec', async () => {
        const response = await fetch(buildUrl('specs/exist'));
        expect(response.status).toBe(200);
        expect(await response.text()).toEqual('{ "spec": "exist" }');
    });
    test('write spec', async () => {
        const response = await fetch(buildUrl('specs/abc'), { method: 'POST', body: '{ a: 1 }' });
        expect(response.status).toBe(200);
        const repository = context.get().repository;
        const actual = await repository.readSpec('abc');
        expect(actual).toEqual('{ a: 1 }');
    });
    test('read not exist scenario gets 404', async () => {
        const response = await fetch(buildUrl('scenarios/not exist'));
        expect(response.status).toBe(404);
    });
    test('read scenario', async () => {
        const response = await fetch(buildUrl('scenarios/exist'));
        expect(response.status).toBe(200);
        expect(await response.text()).toEqual('{ "scenario": "exist" }');
    });
    test('write scenario', async () => {
        const response = await fetch(buildUrl('scenarios/abc'), { method: 'POST', body: '{ a: 1 }' });
        expect(response.status).toBe(200);
        const repository = context.get().repository;
        const actual = await repository.readScenario('abc');
        expect(actual).toEqual('{ a: 1 }');
    });
});
//# sourceMappingURL=start.spec.js.map