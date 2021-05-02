import { Command } from "commander";
import layer from "./layer";
import exporter from "./exporter";
import { trimPotentialForwardSlash } from './helpers';
const packageJSON = require('./package.json');

const program = new Command();

const PixakiPathArg: string = 'Pixaki file path pattern';
const LayerArgDescription: string = 'Name of layer to extract';
const ColumnOptionDescription: string = 'Column wrap, as seen in Pixaki when exporting as spritesheet';
const OutDirectoryDescription = 'The directory to export the files to';
const CurrentWorkingDirectoryDescription = 'The current working directory where to look for files (this will be ignored in the outDir)';

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
    .option('-o, --outDir <count>', OutDirectoryDescription, '')
    .option('--cwd <directory>', CurrentWorkingDirectoryDescription, '')
    .description('Create a png export of a specific layer', {
        path: PixakiPathArg,
        layerName: LayerArgDescription
    })
    .action((path: string, layerName: string, options: Options) => {
        
        layer(path, layerName, parseInt(options.columns), trimPotentialForwardSlash(options.outDir), options.cwd);
    });

// Export Command (Regular export, same as Pixaki Export->Spritesheet)
program
    .command('export <path>')
    .alias('e')
    .option('-c, --columns <count>', ColumnOptionDescription, '8')
    .option('-o, --outDir <count>', OutDirectoryDescription, '')
    .option('--cwd <directory>', CurrentWorkingDirectoryDescription, '')
    .description('Create a regular png export of a pixaki document', {
        path: PixakiPathArg
    })
    .action((path: string, options: Options) => {
        exporter(path, parseInt(options.columns), trimPotentialForwardSlash(options.outDir), options.cwd);
    });

program.parse(process.argv);

interface Options { columns?: string, outDir?: string, cwd?: string }