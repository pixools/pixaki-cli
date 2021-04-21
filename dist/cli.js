#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var yargs = require("yargs");
var layer_1 = require("./layer");
var exporter_1 = require("./exporter");
var PixakiPathArg = {
    describe: 'Pixaki file path',
    type: 'string'
};
var PixakiLayerArg = {
    describe: 'Name of layer to extract',
    type: 'string'
};
var ColumnOptions = {
    describe: 'Column wrap, as seen in Pixaki when exporting as spritesheet',
    "default": 8,
    type: 'number'
};
var options = yargs
    .usage("\n        Usage: pixaki layer <path> <layerName> --columns=4\n\n        All commands will create spritesheet if there are multiple frames.\n    ")
    .command('layer <path> <layerName> [columns]', 'Create a png export of a specific layer', function (yargs) {
    yargs.positional('path', PixakiPathArg)
        .positional('layerName', PixakiLayerArg)
        .option('columns', ColumnOptions);
}, function (argv) {
    layer_1["default"](argv);
})
    .command('export <path> [columns]', 'Create a regular png export of a pixaki document', function (yargs) {
    yargs.positional('path', PixakiPathArg)
        .option('columns', ColumnOptions);
}, function (argv) {
    exporter_1["default"](argv);
})
    .argv;
//# sourceMappingURL=cli.js.map