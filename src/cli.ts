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
    .command('layer <path> <layerName>')
    .alias('l')
    .option('-c, --columns <count>', ColumnOptionDescription, '8')
    .description('Create a png export of a specific layer', {
        path: PixakiPathArg,
        layerName: LayerArgDescription
    })
    .action((path: string, layerName: string, options: Options) => {
        
        layer(path, layerName, parseInt(options.columns));
    });

// Export Command (Regular export, same as Pixaki Export->Spritesheet)
program
    .command('export <path>')
    .alias('e')
    .option('-c, --columns <count>', ColumnOptionDescription, '8')
    .description('Create a regular png export of a pixaki document', {
        path: PixakiPathArg
    })
    .action((path: string, options: Options) => {

        exporter(path, parseInt(options.columns));
    });

program.parse(process.argv);

interface Options { columns?: string }