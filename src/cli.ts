import { Command } from "commander";
import layer from "./layer";
import exporter from "./exporter";
const packageJSON = require('./package.json');

const program = new Command();

const PixakiPathArg: string = 'Pixaki file path';
const LayerArgDescription: string = 'Name of layer to extract';
const ColumnOptionDescription: string = 'Column wrap, as seen in Pixaki when exporting as spritesheet';

program
    .version(packageJSON.version)
    .usage(`

        Usage: pixaki layer <path> <layerName> --columns=4

        All commands will create spritesheet if there are multiple frames.

    `);

// Layer Command
program
    .command('layer <path> <layerName> [columns]')
    .description('Create a png export of a specific layer', {
        path: PixakiPathArg,
        layerName: LayerArgDescription,
        columns: ColumnOptionDescription
    })
    .action((path: string, layerName: string, columns: string) => {
        
        layer(path, layerName, parseInt(columns));
    });

// Export Command (Regular export, same as Pixaki Export->Spritesheet)
program
    .command('export <path> [columns]')
    .description('Create a regular png export of a pixaki document', {
        path: PixakiPathArg,
        columns: ColumnOptionDescription
    })
    .action((path: string, layerName: string, columns: string) => {
        
        exporter(path, parseInt(columns));
    });

program.parse(process.argv);