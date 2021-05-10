import { PixakiDocument } from "./interfaces";
import { convert } from 'imagemagick';
import { TEMP_FOLDER_NAME } from './constants';
import { temp, DisplayCompleteMessage, cwdCreate, multiMontage } from "./helpers";
import { glob } from "glob";
import { subClass } from "gm";
import fsExtra from 'fs-extra';

export default function (path: string, columns: number, outDir: string, cwd: string) {

    console.log(`\nExporting...`);

    // TODO: Share duplicate code that exists between this and layer.ts (BaseCommand? GetPixakiFile + BaseArgs?)
    const fs = require('fs');
    const rimraf = require('rimraf');
    var outDir = outDir ? outDir + '/' : '';
    var successCount = 0;
    var failCount = 0;
    var createdCwd = cwdCreate(cwd);
    const gm = subClass({ imageMagick: true });
    const isZip = require('is-zip');
    const isDirectory = require('is-directory');
    const decompress = require('decompress');

    let pixakiFilesPath = createdCwd + path,
        columnCount = columns || 8;

    // Arg checks
    if (!pixakiFilesPath) {
        console.error("No pixaki file path arg given");
        return;
    }

    let globDoneCount: number = 0;
    glob(pixakiFilesPath, function (error: Error, pixakiProjectFiles: string[]) {

        if (pixakiProjectFiles.length > 0) {

            pixakiProjectFiles.forEach((pixakiProjectFile: string) => {

                let doExport = () => {

                    let unzippedPixakiFilePath: string = temp(pixakiProjectFile),
                        document: PixakiDocument = JSON.parse(fs.readFileSync(`${unzippedPixakiFilePath}/document.json`, 'utf8')),
                        size = document.sprites[0].size, // [x,y] eg. [64,64]
                        layerSpritesheets: string[] = [],
                        pixakiFilePathWithoutCwd: string = !!cwd ? pixakiProjectFile.split(createdCwd)[1] : pixakiProjectFile,
                        pixakiFileName: string = pixakiProjectFile.match(/[ \w-]+?(?=\.)/)[0],
                        pixakiFileNameWithFoldersUnderscored: string = unzippedPixakiFilePath.replace(pixakiFileName + '.pixaki', pixakiFileName).replace(TEMP_FOLDER_NAME, '').split('/').join('_');
                    
                    convert(['-size', `${size[0]}x${size[1]}`, 'canvas:transparent', 'PNG32:' + temp('_' + pixakiFileNameWithFoldersUnderscored + '_canvas.png')], () => {

                        let layerSpritesheetPrintCount: number = 0,
                            visibleLayers = document.sprites[0].layers.filter((layer) => layer.isVisible),
                            animationDuration = document.sprites[0].duration;

                        // Each layer
                        document.sprites[0].layers.reverse().forEach((layer, layerIndex) => {

                            if (layer.isVisible) {

                                let opacity: number = layer.opacity,
                                    celIDList: string[] = [],
                                    celPrintCount: number = 0,
                                    clipIndex: number = 0;

                                // Go through each frame in order of animation
                                layer.clips.sort((a, b) => (a.range.start - b.range.start)).forEach((clip, index) => {

                                    let cel: Partial<PixakiDocument['sprites'][0]['cels'][0]> = null;

                                    let celImage: string;

                                    if (!!clip.itemIdentifier) {
                                        cel = document.sprites[0].cels.find((cel) => {
                                            return cel.identifier == clip.itemIdentifier;
                                        });
                                    }

                                    if (!!cel) {

                                        celImage = `${unzippedPixakiFilePath}/images/drawings/${cel.identifier}.png`;
                                    } else {
                                        cel = {
                                            identifier: 'canvas',
                                            isVisible: false,
                                            frame: [
                                                [
                                                    0,
                                                    0
                                                ],
                                                [
                                                    0,
                                                    0
                                                ]
                                            ]
                                        };

                                        celImage = 'PNG32:' + temp('_' + pixakiFileNameWithFoldersUnderscored + '_canvas.png');
                                    }

                                    // cel.frame can be null sometimes when cel has been manually erased, rather than cleared.
                                    // This is so that the process can still go ahead
                                    if (!cel.frame) {
                                        cel = {
                                            identifier: 'canvas',
                                            isVisible: false,
                                            frame: [
                                                [
                                                    0,
                                                    0
                                                ],
                                                [
                                                    0,
                                                    0
                                                ]
                                            ]
                                        };
                                    }

                                    // TODO: Support static images (null range)

                                    // Examples for sanity:
                                    // clipIndex is 0 and range start is 9, push 9 (9-0)
                                    // clipIndex is 1 and range start is 9, push 8 (9-1) - (The original bug / had one valid item at the start)
                                    // clipIndex is 5 and range start is 9, push 4 (9-5)
                                    if (clip.range != null && clipIndex !== clip.range.start) {

                                        // TODO: Add support for duration using range.end
                                        let difference = clip.range.start - clipIndex;
                                        for (var i = 0; i < difference; i++) {
                                            
                                            celIDList.push('canvas');
                                        }

                                        clipIndex = clip.range.start;

                                    }

                                    if (!clip.range) {

                                        for (var i = 0; i < animationDuration; i++) {
                                            
                                            celIDList.push(cel.identifier);
                                        }

                                    } else {

                                        for (var i = 0; i < (clip.range.end - clip.range.start); i++) {
                                            
                                            celIDList.push(cel.identifier);
                                        }

                                        clipIndex = clip.range.end;
                                    }

                                    clipIndex++;

                                    // TODO: Don't perform all this if ! cel.frame
                                    // TODO: Don't perform all this if !cel.isVisible

                                    // Position the cell on a blank canvas based on the frame position and size
                                    convert([temp('_' + pixakiFileNameWithFoldersUnderscored + '_canvas.png'), celImage, '-geometry', `+${cel.frame[0][0]}+${cel.frame[0][1]}`, '-composite', 'PNG32:' + temp(`_${pixakiFileNameWithFoldersUnderscored}_${cel.identifier}.png`)], (error) => {

                                        // Apply the opacity to the cel (overwrite)
                                        convert([temp(`_${pixakiFileNameWithFoldersUnderscored}_${cel.identifier}.png`), '-alpha', 'set', '-background', 'none', '-channel', 'A', '-evaluate', 'multiply', (cel.isVisible ? (layer.opacity * cel.opacity) : 0), '+channel', 'PNG32:' + temp(`_${pixakiFileNameWithFoldersUnderscored}_${cel.identifier}.png`)], (error) => {

                                            celPrintCount++;

                                            if (celPrintCount == layer.clips.length) {

                                                let column: number = animationDuration < columnCount ? animationDuration : columnCount, // max column wrap
                                                    row: number = Math.ceil(animationDuration / columnCount); // rows based on column wrap number

                                                let layerSpritesheet = temp(`_${pixakiFileNameWithFoldersUnderscored}_${layerIndex}_${layer.name.replace(" ", "-")}.png`);
                                                let grabLayerIndex = (layerName: string) => {
                                                    return parseInt(layerName.split(`_${pixakiFileNameWithFoldersUnderscored}_`)[1].split('_')[0]);
                                                }

                                                layerSpritesheets.push(layerSpritesheet);

                                                let files = celIDList.map((celID: string) => {
                                                    return temp(`_${pixakiFileNameWithFoldersUnderscored.replace(' ', '\ ')}_${celID}.png`);
                                                });
                                                
                                                multiMontage(gm, files)
                                                    .tile(`${column}x${row}`)
                                                    .geometry(`${size[0]}x${size[1]}+0+0`)
                                                    .background('transparent')
                                                    .write(layerSpritesheet, function (error) {

                                                        if (error) {
                                                            console.error(error);
                                                        }

                                                        layerSpritesheetPrintCount++;

                                                        if (layerSpritesheetPrintCount == visibleLayers.length) {

                                                            convert(['-size', `${column * size[0]}x${row * size[1]}`, 'canvas:transparent', 'PNG32:' + temp('_' + pixakiFileNameWithFoldersUnderscored + '_spritesheet_canvas.png')], () => {

                                                                let pages: string[] = [];

                                                                pages.push('-page', '+0+0', temp('_' + pixakiFileNameWithFoldersUnderscored + '_spritesheet_canvas.png'));

                                                                layerSpritesheets.sort((a, b) => { return grabLayerIndex(a) - grabLayerIndex(b) }).reverse().forEach((spritesheetFile) => {
                                                                    pages.push('-page', '+0+0', spritesheetFile);
                                                                });

                                                                let outFile: string = pixakiFilePathWithoutCwd.replace('.pixaki', '.png'); // sprite.png, folder/sprite.png
                                                                let outFilePath: string = `${outDir}${outFile}`; // OUT_DIR/sprite.png, OUT_DIR/folder/sprite.png, sprite.png, folder/sprite.png
                                                                let outFolderPath: string = outFilePath.split(pixakiFileName)[0];

                                                                if (outFolderPath[outFolderPath.length - 1] == "/") {
                                                                    outFolderPath = outFolderPath.slice(0, outFolderPath.length - 1);
                                                                }

                                                                if (outFolderPath != '') {
                                                                    fs.mkdirSync(outFolderPath, { recursive: true });
                                                                }
                                                                
                                                                convert(pages.concat(['-background', 'transparent', '-layers', 'merge', '+repage', `./${outFilePath}`]), (error) => {

                                                                    if (error) {
                                                                        console.log(`\x1b[31m%s\x1b[0m ${outFilePath} (${error})`, 'x');
                                                                        failCount++;
                                                                    } else {
                                                                        console.log(`\x1b[32m%s\x1b[0m ${outFilePath}`, `✔️`);
                                                                        successCount++;
                                                                    }

                                                                    globDoneCount++;

                                                                    if (globDoneCount == pixakiProjectFiles.length) {

                                                                        DisplayCompleteMessage(successCount, failCount);
                                                                        rimraf(TEMP_FOLDER_NAME, () => { });
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    });
                                            }
                                        });
                                    });
                                });
                            }
                        });

                    });
                };

                if (!fs.existsSync(TEMP_FOLDER_NAME)) {
                    fs.mkdirSync(TEMP_FOLDER_NAME);
                }

                if (outDir != '' && !fs.existsSync(outDir)) {
                    fs.mkdirSync(outDir);
                }

                if (isDirectory.sync(pixakiProjectFile)) {

                    fsExtra.copySync(pixakiProjectFile, temp(pixakiProjectFile));
                    doExport();

                } else if (isZip(fs.readFileSync(pixakiProjectFile))) {

                    decompress(pixakiProjectFile, temp(pixakiProjectFile)).then((files: any) => {
                        doExport();
                    });
                } else {
                    console.log(".pixaki file not a directory or zip");
                }

            });

        } else {
            console.log('\x1b[31m%s\x1b[0m', `Couldn't find file: "${pixakiFilesPath}"`);
        }
    });
}