"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const Tuntap2Addon = os.platform() !== 'win32' ? require("../../../../build/Release/tuntap2Addon") : undefined;
exports.default = Tuntap2Addon;
//# sourceMappingURL=Tuntap2Addon.js.map