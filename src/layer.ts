import { DisplayCompleteMessage, temp } from "./helpers";
import { PixakiDocument } from "./interfaces";
import { convert } from 'imagemagick';
import { TEMP_FOLDER_NAME } from "./constants";
import { glob } from "glob";

export default function (path: string, layerName: string, columns: number, outDir: string) {
    
    console.log(`\nLayer exporting...`);

    var fs = require('fs');
    var shell = require('shelljs');
    var rimraf = require('rimraf');
    var outDir = outDir ? outDir + '/' : '';
    var successCount = 0;
    var failCount = 0;

    let pixakiFilesPath = path,
        targetLayerName = layerName,
        columnCount = columns || 8;

    // Arg checks
    if (!pixakiFilesPath) {
        console.error("No pixaki file path arg given");
        return;
    }

    if (!targetLayerName) {
        console.error("No layer arg given");
        return;
    }

    // Pixaki 4 Document JSON file
    let documentJSONPath = `${pixakiFilesPath}/document.json`;

    let globDoneCount: number = 0;
    glob(documentJSONPath, function (error: Error, documentFiles: string[]) {

        if (documentFiles.length > 0) {

            documentFiles.forEach((documentFile: string) => {

                let document: PixakiDocument = JSON.parse(fs.readFileSync(documentFile, 'utf8')),
                    layerIDs: any[] = null,
                    cels: any = [],
                    size = document.sprites[0].size, // [x,y] eg. [64,64]
                    pixakiFilePath: string = documentFile.split('/document.json')[0],
                    pixakiFileName: string = pixakiFilePath.match(/[ \w-]+?(?=\.)/)[0];

                if (!fs.existsSync(TEMP_FOLDER_NAME)) {
                    fs.mkdirSync(TEMP_FOLDER_NAME);
                }

                if (outDir != '' && !fs.existsSync(outDir)) {
                    fs.mkdirSync(outDir);
                }

                convert(['-size', `${size[0]}x${size[1]}`, 'canvas:blue', temp('_' + pixakiFileName + '_srgb.png')], () => {

                    convert([temp('_' + pixakiFileName + '_srgb.png'), '-transparent', 'blue', temp('_' + pixakiFileName + '_canvas.png')], (error: any) => {

                        // Loop through layers to find layer matching the given target layer name (grab the ID)
                        document.sprites[0].layers.forEach((layer: PixakiDocument['sprites'][0]['layers'][0]) => {
                            if (layer.name == targetLayerName) {
                                // Sort by animation/frame (range.start) order and grab the itemIdentifier only
                                layerIDs = layer.clips.sort((a: PixakiDocument['sprites'][0]['layers'][0]['clips'][0], b: PixakiDocument['sprites'][0]['layers'][0]['clips'][0]) => (a.range.start - b.range.start)).map((clip: any) => { return clip.itemIdentifier; });
                                return;
                            }
                        });

                        if (!!layerIDs) {

                            // Find all the "cels" of these IDs, these have more info about positioning/size 
                            // and create an array of them
                            layerIDs.forEach((layerID: any) => {
                                document.sprites[0].cels.forEach((cel: any) => {
                                    if (cel.identifier == layerID) {
                                        cels.push(cel);
                                    }
                                });
                            });

                            let celIDList: string[] = [];
                            let celsDone: number = 0;
                            cels.forEach((cel: any, index: any) => {

                                let celImage: string = `${pixakiFilePath}/images/drawings/${cel.identifier}.png`;
                                celIDList.push(cel.identifier);
                                convert([temp('_' + pixakiFileName + '_canvas.png'), celImage, '-geometry', `+${cel.frame[0][0]}+${cel.frame[0][1]}`, '-composite', temp(`_${pixakiFileName}_${cel.identifier}.png`)], () => {
                                    celsDone++;

                                    // Done all
                                    if (celsDone == cels.length) {

                                        let column = cels.length < columnCount ? cels.length : columnCount, // max column wrap
                                            row = Math.ceil(cels.length / columnCount); // rows based on column wrap number

                                        let outFile: string = pixakiFilePath.replace('.pixaki', `_${targetLayerName}.png`); // sprite.png, folder/sprite.png
                                        let outFilePath: string = `${outDir}${outFile}`; // OUT_DIR/sprite.png, OUT_DIR/folder/sprite.png, sprite.png, folder/sprite.png
                                        let outFolderPath: string = outFilePath.split(pixakiFileName)[0];

                                        if (outFolderPath[outFolderPath.length - 1] == "/") {
                                            outFolderPath = outFolderPath.slice(0, outFolderPath.length - 1);
                                        }

                                        if (outFolderPath != '') {
                                            fs.mkdirSync(outFolderPath, { recursive: true });
                                        }

                                        shell.exec(`montage ${temp(`_${pixakiFileName}_{${celIDList.join(',')}}.png`)} -tile ${column}x${row} -geometry ${size[0]}x${size[1]}+0+0 -background transparent './${outFilePath}'`, () => {

                                            console.log(`\x1b[32m%s\x1b[0m ${outFilePath}`, `✔️`);

                                            globDoneCount++;
                                            successCount++;
                                            if (globDoneCount == documentFiles.length) {

                                                DisplayCompleteMessage(successCount, failCount);
                                                rimraf(TEMP_FOLDER_NAME, () => { });
                                            }
                                        });
                                    }
                                });
                            });

                            return;
                        } else {
                            console.log(`\x1b[31m%s\x1b[0m ${pixakiFilePath} (No layer found)`, 'x');
                            
                            globDoneCount++;
                            failCount++;

                            if (globDoneCount == documentFiles.length) {

                                DisplayCompleteMessage(successCount, failCount);
                                rimraf(TEMP_FOLDER_NAME, () => { });
                            }
                            return;
                        }
                    });
                });
            });

        } else {
            console.log(`Couldn't find file: "${pixakiFilesPath}"`);
        }
    });
};