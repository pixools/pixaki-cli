import { DisplayCompleteMessage, temp, cwdCreate, multiMontage } from "./helpers";
import { PixakiDocument } from "./interfaces";
import { convert } from 'imagemagick';
import { TEMP_FOLDER_NAME } from "./constants";
import { glob } from "glob";
import { subClass } from "gm";

// TODO: Add support for static layers (Create a test Pixaki Project first)
export default function (path: string, layerName: string, columns: number, outDir: string, cwd: string) {

    console.log(`\nLayer exporting...`);

    var fs = require('fs');
    var rimraf = require('rimraf');
    var outDir = outDir ? outDir + '/' : '';
    var successCount = 0;
    var failCount = 0;
    var createdCwd = cwdCreate(cwd);
    var gm = subClass({ imageMagick: true });

    let pixakiFilesPath = createdCwd + path,
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
    } else {
        targetLayerName = targetLayerName.trim();
    }

    // Pixaki 4 Document JSON file
    let documentJSONPath = `${pixakiFilesPath}/document.json`;

    let globDoneCount: number = 0;
    glob(documentJSONPath, function (error: Error, documentFiles: string[]) {

        if (documentFiles.length > 0) {

            documentFiles.forEach((documentFile: string) => {

                let document: PixakiDocument = JSON.parse(fs.readFileSync(documentFile, 'utf8')),
                    layerIDs: any[] = [],
                    cels: any = [],
                    size = document.sprites[0].size, // [x,y] eg. [64,64]
                    pixakiFilePath: string = documentFile.split('/document.json')[0],
                    pixakiFilePathWithoutCwd: string = !!cwd ? pixakiFilePath.split(createdCwd)[1] : pixakiFilePath,
                    pixakiFileName: string = pixakiFilePath.match(/[ \w-]+?(?=\.)/)[0];

                if (!fs.existsSync(TEMP_FOLDER_NAME)) {
                    fs.mkdirSync(TEMP_FOLDER_NAME);
                }

                if (outDir != '' && !fs.existsSync(outDir)) {
                    fs.mkdirSync(outDir);
                }

                convert(['-size', `${size[0]}x${size[1]}`, 'canvas:transparent', 'PNG32:' + temp('_' + pixakiFileName + '_canvas.png')], () => {

                    // Loop through layers to find layer matching the given target layer name (grab the ID)
                    document.sprites[0].layers.forEach((layer: PixakiDocument['sprites'][0]['layers'][0]) => {
                        if (layer.name.trim() == targetLayerName) {

                            // Sort by animation/frame (range.start) order and grab the itemIdentifier only
                            // Add in blanks to make up for ranges not starting at 0

                            let clipIndex: number = 0;
                            layer.clips.sort((a, b) => (a.range.start - b.range.start)).forEach((clip, index) => {

                                if(!clip.range){
                                    let animationDuration = document.sprites[0].duration;

                                    for (var i = 0; i < animationDuration; i++) {
                                        layerIDs.push(clip.itemIdentifier);
                                    }
                                }else{

                                    // Examples for sanity:
                                    // clipIndex is 0 and range start is 9, push 9 (9-0)
                                    // clipIndex is 1 and range start is 9, push 8 (9-1) - (The original bug / had one valid item at the start)
                                    // clipIndex is 5 and range start is 9, push 4 (9-5)
                                    if (clip.range != null && clipIndex !== clip.range.start) {

                                        // TODO: Add support for duration using range.end
                                        let difference = clip.range.start - clipIndex;
                                        for (var i = 0; i < difference; i++) {
                                            
                                            layerIDs.push('canvas');
                                        }

                                        clipIndex = clip.range.start;

                                    }

                                    if (!clip.range) {

                                        for (var i = 0; i < document.sprites[0].duration; i++) {
                                            
                                            layerIDs.push(clip.itemIdentifier);
                                        }

                                    } else {

                                        for (var i = 0; i < (clip.range.end - clip.range.start); i++) {
                                            
                                            layerIDs.push(clip.itemIdentifier);
                                        }

                                        clipIndex = clip.range.end;
                                    }

                                    clipIndex++;
                                }
                            });

                            // .map((clip: any) => { return clip.itemIdentifier; });
                            return;
                        }
                    });

                    if (!!layerIDs && layerIDs.length > 0) {

                        // Find all the "cels" of these IDs, these have more info about positioning/size 
                        // and create an array of them
                        layerIDs.forEach((layerID: any, index: number) => {

                            if (layerID == 'canvas') {

                                cels.push({
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
                                });

                            } else {

                                document.sprites[0].cels.forEach((cel: any) => {
                                    if (cel.identifier == layerID) {
                                        cels.push(cel);
                                    }
                                });
                            }
                        });

                        let celIDList: string[] = [];
                        let celsDone: number = 0;

                        cels.forEach((cel: any, index: any) => {
                            
                            let celImage: string = temp(`_${pixakiFileName}_canvas.png`);
                            
                            if(cel.identifier != 'canvas'){
                                celImage = `${pixakiFilePath}/images/drawings/${cel.identifier}.png`;
                            }

                            celIDList.push(cel.identifier);

                            convert([temp('_' + pixakiFileName + '_canvas.png'), celImage, '-geometry', `+${cel.frame[0][0]}+${cel.frame[0][1]}`, '-composite', 'PNG32:' + temp(`_${pixakiFileName}_${cel.identifier}.png`)], () => {
                                celsDone++;

                                // Done all
                                if (celsDone == cels.length) {

                                    let column = cels.length < columnCount ? cels.length : columnCount, // max column wrap
                                        row = Math.ceil(cels.length / columnCount); // rows based on column wrap number

                                    let outFile: string = pixakiFilePathWithoutCwd.replace('.pixaki', `_${targetLayerName}.png`); // sprite.png, folder/sprite.png
                                    let outFilePath: string = `${outDir}${outFile}`; // OUT_DIR/sprite.png, OUT_DIR/folder/sprite.png, sprite.png, folder/sprite.png
                                    let outFolderPath: string = outFilePath.split(pixakiFileName)[0];

                                    if (outFolderPath[outFolderPath.length - 1] == "/") {
                                        outFolderPath = outFolderPath.slice(0, outFolderPath.length - 1);
                                    }

                                    if (outFolderPath != '') {
                                        fs.mkdirSync(outFolderPath, { recursive: true });
                                    }

                                    let files = celIDList.map((celID: string) => {
                                        return temp(`_${pixakiFileName.replace(' ', '\ ')}_${celID}.png`);
                                    });

                                    multiMontage(gm, files)
                                        .tile(`${column}x${row}`)
                                        .geometry(`${size[0]}x${size[1]}+0+0`)
                                        .background('transparent')
                                        .write(`./${outFilePath}`, function (error) {

                                            console.log(`\x1b[32m%s\x1b[0m ${outFilePath}`, `??????`);

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

        } else {
            console.log(`Couldn't find file: "${pixakiFilesPath}"`);
        }
    });
};