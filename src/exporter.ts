import { PixakiDocument } from "./interfaces";
import { convert } from 'imagemagick';
import { TEMP_FOLDER_NAME } from './constants';
import { temp } from "./helpers";
import { glob } from "glob";

export default function (path: string, columns: number, outDir: string) {

    // TODO: Share duplicate code that exists between this and layer.ts (BaseCommand? GetPixakiFile + BaseArgs?)
    var fs = require('fs');
    var rimraf = require('rimraf');
    var shell = require('shelljs');
    var outDir = outDir ? outDir + '/' : '';

    let pixakiFilesPath = path,
        columnCount = columns || 8;

    // Arg checks
    if (!pixakiFilesPath) {
        console.error("No pixaki file path arg given");
        return;
    }

    // Pixaki 4 Document JSON file
    let documentJSONPath = `${pixakiFilesPath}/document.json`;

    let globDoneCount: number = 0;
    glob(documentJSONPath, function (error: Error, documentFiles: string[]) {

        if (documentFiles.length > 0) {

            documentFiles.forEach((documentFile: string) => {
                let document: PixakiDocument = JSON.parse(fs.readFileSync(documentFile, 'utf8')),
                    size = document.sprites[0].size, // [x,y] eg. [64,64]
                    layerSpritesheets: string[] = [],
                    pixakiFilePath: string = documentFile.split('/document.json')[0],
                    pixakiFileName: string = pixakiFilePath.match(/[ \w-]+?(?=\.)/)[0];

                if (!fs.existsSync(TEMP_FOLDER_NAME)) {
                    fs.mkdirSync(TEMP_FOLDER_NAME);
                }

                if (outDir != '' && !fs.existsSync(outDir)) {
                    fs.mkdirSync(outDir);
                }

                convert(['-size', `${size[0]}x${size[1]}`, 'canvas:blue', temp('_' + pixakiFileName + '_srgb.png')], () => {

                    convert([temp('_' + pixakiFileName + '_srgb.png'), '-transparent', 'blue', temp('_' + pixakiFileName + '_canvas.png')], () => {

                        // fs.unlinkSync(temp('_' + pixakiFileName + '_srgb.png'));

                        let layerSpritesheetPrintCount: number = 0,
                            visibleLayers = document.sprites[0].layers.filter((layer) => layer.isVisible);

                        // Each layer
                        document.sprites[0].layers.reverse().forEach((layer, layerIndex) => {

                            if (layer.isVisible) {

                                let opacity: number = layer.opacity,
                                    celIDList: string[] = [],
                                    celPrintCount: number = 0;

                                // Go through each frame in order of animation
                                layer.clips.sort((a, b) => (a.range.start - b.range.start)).forEach((clip, clipIndex) => {

                                    let cel = document.sprites[0].cels.find((cel) => {
                                        return cel.identifier == clip.itemIdentifier;
                                    });

                                    let celImage: string = `${pixakiFilePath}/images/drawings/${cel.identifier}.png`;

                                    convert([temp('_' + pixakiFileName + '_canvas.png'), celImage, '-geometry', `+${cel.frame[0][0]}+${cel.frame[0][1]}`, '-composite', temp(`_${pixakiFileName}_${cel.identifier}.png`)], (error) => {

                                        convert([temp(`_${pixakiFileName}_${cel.identifier}.png`), '-alpha', 'set', '-background', 'none', '-channel', 'A', '-evaluate', 'multiply', layer.opacity * cel.opacity, '+channel', temp(`_${pixakiFileName}_${cel.identifier}.png`)], (error) => {

                                            celPrintCount++;

                                            if (celPrintCount == layer.clips.length) {

                                                let column: number = layer.clips.length < columnCount ? layer.clips.length : columnCount, // max column wrap
                                                    row: number = Math.ceil(layer.clips.length / columnCount); // rows based on column wrap number

                                                let layerSpritesheet = temp(`_${pixakiFileName}_${layerIndex}_${layer.name.replace(" ", "-")}.png`);

                                                layerSpritesheets.push(layerSpritesheet);

                                                shell.exec(`montage ${temp(`_${pixakiFileName}_{${celIDList.join(',')}}.png`)} -tile ${column}x${row} -geometry ${size[0]}x${size[1]}+0+0 -background transparent ${layerSpritesheet}`, () => {

                                                    // celIDList.forEach((celID) => {
                                                    //     fs.unlinkSync(temp(`_${pixakiFileName}_${celID}.png`));
                                                    // });

                                                    layerSpritesheetPrintCount++;

                                                    if (layerSpritesheetPrintCount == visibleLayers.length) {

                                                        let pages: string[] = [];

                                                        layerSpritesheets.sort().reverse().forEach((spritesheetFile) => {
                                                            pages.push('-page', '+0+0', spritesheetFile);
                                                        });

                                                        let outFile: string = pixakiFilePath.replace('.pixaki', '.png'); // sprite.pixaki, folder/sprite.pixaki
                                                        let outFilePath: string = `${outDir}${outFile}`; // OUT_DIR/sprite.pixaki, OUT_DIR/folder/sprite.pixaki, sprite.pixaki, folder/sprite.pixaki
                                                        let outFolderPath: string = outFilePath.split(pixakiFileName)[0];

                                                        if (outFolderPath[outFolderPath.length - 1] == "/") {
                                                            outFolderPath = outFolderPath.slice(0, outFolderPath.length - 1);
                                                        }

                                                        if (outFolderPath != '') {
                                                            fs.mkdirSync(outFolderPath, { recursive: true });
                                                        }

                                                        convert(pages.concat(['-background', 'transparent', '-layers', 'merge', '+repage', `./${outFilePath}`]), (error) => {

                                                            if(error){
                                                                console.log('\x1b[31m%s\x1b[0m', `Failed export to ${outFilePath}.png (${error})`);
                                                            }else{
                                                                console.log('\x1b[32m%s\x1b[0m', `Exported to ${outFilePath}.png`);
                                                            }

                                                            // layerSpritesheets.sort().reverse().forEach((spritesheetFile) => {
                                                            //     fs.unlinkSync(spritesheetFile);
                                                            // });
                                                            // fs.unlinkSync(temp('_' + pixakiFileName + '_canvas.png'));

                                                            globDoneCount++;

                                                            if (globDoneCount == documentFiles.length) {

                                                                rimraf(TEMP_FOLDER_NAME, () => { });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    });

                                    celIDList.push(cel.identifier);
                                });
                            }
                        });
                    });

                });
            });

        } else {
            console.log('\x1b[31m%s\x1b[0m', `Couldn't find file: "${pixakiFilesPath}"`);
        }
    });
}