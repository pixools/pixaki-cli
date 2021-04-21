#!/usr/bin/env node

import yargs = require("yargs");
import layer from "./layer";

import { Commands } from "./interfaces/commands";

const options = yargs
    .usage(`
        Usage: pixaki layer <path> <layerName> --columns=4
    `)
    .command('layer <path> <layerName> [columns]', 
        'Grab a layer', 
        // https://github.com/yargs/yargs/blob/master/docs/advanced.md#variadic-positional-arguments
        (yargs: yargs.Argv) => {
            yargs.positional('path', {
                describe: 'Pixaki file path',
                type: 'string'
            }).positional('layerName', {
                describe: 'Name of layer to extract',
                type: 'string'
            }).option('columns', {
                describe: 'Column wrap, as seen in Pixaki when exporting as spritesheet',
                default: 8,
                type: 'number'
            })
        },
        (argv: Commands['layer']) => {
            layer(argv);
        })
        .argv;