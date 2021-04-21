#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var yargs = require("yargs");
var layer_1 = require("./layer");
var options = yargs
    .usage("\n        Usage: pixaki layer <path> <layerName> --columns=4\n    ")
    .command('layer <path> <layerName> [columns]', 'Grab a layer', function (yargs) {
    yargs.positional('path', {
        describe: 'Pixaki file path',
        type: 'string'
    }).positional('layerName', {
        describe: 'Name of layer to extract',
        type: 'string'
    }).option('columns', {
        describe: 'Column wrap, as seen in Pixaki when exporting as spritesheet',
        "default": 8,
        type: 'number'
    });
}, function (argv) {
    layer_1["default"](argv);
})
    .argv;
//# sourceMappingURL=cli.js.map