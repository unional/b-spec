import * as f from 'cross-fetch';
export function createFakeServerFetch() {
    const specs = {
        'exist': { 'actions': [] }
    };
    const scenarios = {
        'exist': { 'scenario': 'exist' }
    };
    return Object.assign(async (url, init) => {
        const uri = extractUri(url);
        if (uri === 'komondor/info') {
            return new f.Response(JSON.stringify({
                url: 'http://localhost:3999',
                version: '1.0',
                plugins: ['@komondor-lab/plugin-fixture-dummy']
            }));
        }
        else if (uri.startsWith('komondor/specs/')) {
            const id = /komondor\/specs\/(.*)/.exec(uri)[1];
            if (init && init.method === 'POST') {
                specs[id] = JSON.parse(init.body);
                return new f.Response(undefined);
            }
            else {
                if (specs[id])
                    return new f.Response(JSON.stringify(specs[id]));
                else
                    return new f.Response(undefined, { status: 404 });
            }
        }
        else if (uri.startsWith('komondor/scenarios/')) {
            const id = /komondor\/scenarios\/(.*)/.exec(uri)[1];
            if (init && init.method === 'POST') {
                scenarios[id] = JSON.parse(init.body);
                return new f.Response(undefined);
            }
            else {
                if (scenarios[id])
                    return new f.Response(JSON.stringify(scenarios[id]));
                else
                    return new f.Response(undefined, { status: 404 });
            }
        }
        console.error(url);
        return new f.Response(undefined, { status: 404 });
    }, {
        specs,
        scenarios
    });
}
function extractUri(url) {
    const match = /https?:\/\/\w*:\d+\/(.*)/.exec(url);
    if (!match)
        throw match;
    return match[1];
}
//# sourceMappingURL=createFakeServerFetch.js.map