"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@komondor-lab/core");
var assertron_1 = __importDefault(require("assertron"));
var createIOInternal_1 = require("./createIOInternal");
var test_util_1 = require("./test-util");
test('read not exist spec throws SpecNotFound', function () { return __awaiter(_this, void 0, void 0, function () {
    var fetch, io;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fetch = test_util_1.createFakeServerFetch();
                return [4 /*yield*/, createIOInternal_1.createIOInternal({ fetch: fetch, location: location })];
            case 1:
                io = _a.sent();
                return [4 /*yield*/, assertron_1.default.throws(io.readSpec('not exist'), core_1.SpecNotFound)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('read existing spec', function () { return __awaiter(_this, void 0, void 0, function () {
    var fetch, io, actual;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fetch = test_util_1.createFakeServerFetch();
                return [4 /*yield*/, createIOInternal_1.createIOInternal({ fetch: fetch, location: location })];
            case 1:
                io = _a.sent();
                return [4 /*yield*/, io.readSpec('exist')];
            case 2:
                actual = _a.sent();
                expect(actual).toEqual({ actions: [] });
                return [2 /*return*/];
        }
    });
}); });
test('write spec', function () { return __awaiter(_this, void 0, void 0, function () {
    var fetch, io, record, spec;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fetch = test_util_1.createFakeServerFetch();
                return [4 /*yield*/, createIOInternal_1.createIOInternal({ fetch: fetch, location: location })];
            case 1:
                io = _a.sent();
                record = { refs: {}, actions: [{ type: 'construct', payload: [], ref: '1' }] };
                return [4 /*yield*/, io.writeSpec('new spec', record)];
            case 2:
                _a.sent();
                spec = fetch.specs['new spec'];
                expect(spec).toEqual(record);
                return [2 /*return*/];
        }
    });
}); });
test('read not exist scenario throws ScenarioNotFound', function () { return __awaiter(_this, void 0, void 0, function () {
    var fetch, io;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fetch = test_util_1.createFakeServerFetch();
                return [4 /*yield*/, createIOInternal_1.createIOInternal({ fetch: fetch, location: location })];
            case 1:
                io = _a.sent();
                return [4 /*yield*/, assertron_1.default.throws(io.readScenario('not exist'), core_1.ScenarioNotFound)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('read existing scenario', function () { return __awaiter(_this, void 0, void 0, function () {
    var fetch, io, actual;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fetch = test_util_1.createFakeServerFetch();
                return [4 /*yield*/, createIOInternal_1.createIOInternal({ fetch: fetch, location: location })];
            case 1:
                io = _a.sent();
                return [4 /*yield*/, io.readScenario('exist')];
            case 2:
                actual = _a.sent();
                expect(actual).toEqual({ scenario: 'exist' });
                return [2 /*return*/];
        }
    });
}); });
test('write Scenario', function () { return __awaiter(_this, void 0, void 0, function () {
    var fetch, io, record, spec;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fetch = test_util_1.createFakeServerFetch();
                return [4 /*yield*/, createIOInternal_1.createIOInternal({ fetch: fetch, location: location })];
            case 1:
                io = _a.sent();
                record = { actions: [{ name: 'construct', instanceId: 1, plugin: '', payload: [] }] };
                return [4 /*yield*/, io.writeScenario('new scenario', record)];
            case 2:
                _a.sent();
                spec = fetch.scenarios['new scenario'];
                expect(spec).toEqual(record);
                return [2 /*return*/];
        }
    });
}); });
describe('getPluginList()', function () {
    test('returns installed plugin', function () { return __awaiter(_this, void 0, void 0, function () {
        var fetch, io, list;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetch = test_util_1.createFakeServerFetch();
                    return [4 /*yield*/, createIOInternal_1.createIOInternal({ fetch: fetch, location: location })];
                case 1:
                    io = _a.sent();
                    return [4 /*yield*/, io.getPluginList()];
                case 2:
                    list = _a.sent();
                    expect(list).toEqual(['@komondor-lab/plugin-fixture-dummy']);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('loadPlugin()', function () {
    test('load existing plugin', function () { return __awaiter(_this, void 0, void 0, function () {
        var fetch, io, p;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetch = test_util_1.createFakeServerFetch();
                    return [4 /*yield*/, createIOInternal_1.createIOInternal({ fetch: fetch, location: location })];
                case 1:
                    io = _a.sent();
                    return [4 /*yield*/, io.loadPlugin("@komondor-lab/plugin-fixture-dummy")];
                case 2:
                    p = _a.sent();
                    expect(typeof p.activate).toBe('function');
                    return [2 /*return*/];
            }
        });
    }); });
});
// describe('loadConfig()', () => {
//   test('load...', async () => {
//     const io = await createClientIO()
//     await io.loadConfig()
//   })
// })
//# sourceMappingURL=createIOInternal.spec.js.map