#!/usr/bin/env node

import yargs = require("yargs");
import layer from "./layer";
import exporter from "./exporter";

import { Commands } from "./interfaces/commands";

const PixakiPathArg: yargs.PositionalOptions = {
    describe: 'Pixaki file path',
    type: 'string'
}

const PixakiLayerArg: yargs.PositionalOptions = {
    describe: 'Name of layer to extract',
    type: 'string'
}

const ColumnOptions: yargs.Options = {
    describe: 'Column wrap, as seen in Pixaki when exporting as spritesheet',
    default: 8,
    type: 'number'
}

const options = yargs
    .usage(`
        Usage: pixaki layer <path> <layerName> --columns=4

        All commands will create spritesheet if there are multiple frames.
    `)

    // Layer Commmand
    .command('layer <path> <layerName> [columns]', 
        
        'Create a png export of a specific layer', 
        
        (yargs: yargs.Argv) => {
            yargs.positional('path', PixakiPathArg)
            .positional('layerName', PixakiLayerArg)
            .option('columns', ColumnOptions)
        },

        (argv: Commands['layer']) => {
            layer(argv);
        })
    
    // Export Command (Regular export, same as Pixaki Export->Spritesheet)
    .command('export <path> [columns]', 
        
        'Create a regular png export of a pixaki document', 
        
        (yargs: yargs.Argv) => {
            yargs.positional('path', PixakiPathArg)
            .option('columns', ColumnOptions)
        },
        (argv: Commands['exporter']) => {
            exporter(argv);
        })
    
    .argv;