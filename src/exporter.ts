import { PixakiDocument } from "./interfaces";
import { convert } from 'imagemagick';
import { TEMP_FOLDER_NAME } from './constants';
import { temp, DisplayCompleteMessage, cwdCreate } from "./helpers";
import { glob } from "glob";
import { exec } from "shelljs";

export default function (path: string, columns: number, outDir: string, cwd: string) {

    // require('events').EventEmitter.defaultMaxListeners = 20;
    // process.setMaxListeners(0);

    console.log(`\nExporting...`);

    // TODO: Share duplicate code that exists between this and layer.ts (BaseCommand? GetPixakiFile + BaseArgs?)
    var fs = require('fs');
    var rimraf = require('rimraf');
    var outDir = outDir ? outDir + '/' : '';
    var successCount = 0;
    var failCount = 0;
    var createdCwd = cwdCreate(cwd);

    let pixakiFilesPath = createdCwd + path,
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
                    pixakiFilePathWithoutCwd: string = !!cwd ? pixakiFilePath.split(createdCwd)[1] : pixakiFilePath,
                    pixakiFileName: string = pixakiFilePath.match(/[ \w-]+?(?=\.)/)[0];

                if (!fs.existsSync(TEMP_FOLDER_NAME)) {
                    fs.mkdirSync(TEMP_FOLDER_NAME);
                }

                if (outDir != '' && !fs.existsSync(outDir)) {
                    fs.mkdirSync(outDir);
                }

                convert(['-size', `${size[0]}x${size[1]}`, 'canvas:blue', temp('_' + pixakiFileName + '_srgb.png')], () => {

                    convert([temp('_' + pixakiFileName + '_srgb.png'), '-transparent', 'blue', temp('_' + pixakiFileName + '_canvas.png')], () => {

                        let layerSpritesheetPrintCount: number = 0,
                            visibleLayers = document.sprites[0].layers.filter((layer) => layer.isVisible),
                            animationDuration = Math.max.apply(Math, document.sprites[0].layers.map(function(o) { return o.clips.length; }));

                        // Each layer
                        document.sprites[0].layers.reverse().forEach((layer, layerIndex) => {

                            if (layer.isVisible) {

                                let opacity: number = layer.opacity,
                                    celIDList: string[] = [],
                                    celPrintCount: number = 0;

                                // Go through each frame in order of animation
                                layer.clips.sort((a, b) => (a.range.start - b.range.start)).forEach((clip, clipIndex) => {

                                    let cel: Partial<PixakiDocument['sprites'][0]['cels'][0]> = null;

                                    let celImage: string;

                                    if(!!clip.itemIdentifier){
                                        cel = document.sprites[0].cels.find((cel) => {
                                            return cel.identifier == clip.itemIdentifier;
                                        });
                                    }

                                    if(!!cel) {

                                        celImage = `${pixakiFilePath}/images/drawings/${cel.identifier}.png`;
                                    }else{
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
                                        }

                                        celImage = temp('_' + pixakiFileName + '_canvas.png');
                                    }

                                    // Examples for sanity:
                                    // clipIndex is 0 and range start is 9, push 9 (9-0)
                                    // clipIndex is 1 and range start is 9, push 8 (9-1) - (The original bug / had one valid item at the start)
                                    // clipIndex is 5 and range start is 9, push 4 (9-5)
                                    if(clipIndex !== clip.range.start){

                                        for (var i = 0; i < clip.range.start - clipIndex; i++) {
                                            celIDList.push('canvas');
                                        }
                                        
                                    }

                                    // TODO: Don't perform all this if !cel.isVisible
                                    convert([temp('_' + pixakiFileName + '_canvas.png'), celImage, '-geometry', `+${cel.frame[0][0]}+${cel.frame[0][1]}`, '-composite', temp(`_${pixakiFileName}_${cel.identifier}.png`)], (error) => {

                                        convert([temp(`_${pixakiFileName}_${cel.identifier}.png`), '-alpha', 'set', '-background', 'none', '-channel', 'A', '-evaluate', 'multiply', cel.isVisible ? (layer.opacity * cel.opacity) : 0, '+channel', temp(`_${pixakiFileName}_${cel.identifier}.png`)], (error) => {

                                            celPrintCount++;

                                            if (celPrintCount == layer.clips.length) {

                                                let column: number = animationDuration < columnCount ? animationDuration : columnCount, // max column wrap
                                                    row: number = Math.ceil(animationDuration / columnCount); // rows based on column wrap number

                                                let layerSpritesheet = temp(`_${pixakiFileName}_${layerIndex}_${layer.name.replace(" ", "-")}.png`);
                                                let grabLayerIndex = (layerName: string) => {
                                                    return parseInt(layerName.split(`_${pixakiFileName}_`)[1].split('_')[0]);
                                                }
                                                
                                                layerSpritesheets.push(layerSpritesheet);
                                                
                                                // Factor in clip.range.start
                                                exec(`montage ${temp(`_${pixakiFileName.replace(' ', '\ ')}_{${celIDList.join(',')}}.png`)} -tile ${column}x${row} -geometry ${size[0]}x${size[1]}+0+0 -background transparent ${layerSpritesheet}`, () => {

                                                    layerSpritesheetPrintCount++;

                                                    if (layerSpritesheetPrintCount == visibleLayers.length) {

                                                        convert(['-size', `${row}x${column}`, 'canvas:blue', temp('_' + pixakiFileName + '_spritesheet_srgb.png')], () => {

                                                            convert([temp('_' + pixakiFileName + '_srgb.png'), '-transparent', 'blue', temp('_' + pixakiFileName + '_spritesheet_canvas.png')], () => {

                                                                let pages: string[] = [];

                                                                pages.push('-page', '+0+0', temp('_' + pixakiFileName + '_spritesheet_canvas.png'));

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

                                                                    if (globDoneCount == documentFiles.length) {

                                                                        DisplayCompleteMessage(successCount, failCount);
                                                                        rimraf(TEMP_FOLDER_NAME, () => { });
                                                                    }
                                                                });
                                                            });
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
            console.log('\x1b[31m%s\x1b[0m', `Couldn't find file: "${pixakiFilesPath} (${documentJSONPath})"`);
        }
    });
}