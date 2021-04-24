import { temp } from "./helpers";
import { PixakiDocument } from "./interfaces";
import { convert } from 'imagemagick';
import { TEMP_FOLDER_NAME } from "./constants";

export default function (path: string, layerName: string, columns: number) {

    var fs = require('fs');
    var shell = require('shelljs');
    var rimraf = require('rimraf');
    
    let pixakiFilePath = path,
        pixakiFileName = pixakiFilePath.match(/[ \w-]+?(?=\.)/g),
        targetLayerName = layerName,
        columnCount = columns || 8;

    // Arg checks
    if (!pixakiFilePath) {
        console.error("No pixaki file path arg given");
        return;
    }

    if (!targetLayerName) {
        console.error("No layer arg given");
        return;
    }

    // Pixaki 4 Document JSON file
    let documentJSONPath = `${pixakiFilePath}/document.json`;

    if (fs.existsSync(pixakiFilePath) && fs.existsSync(documentJSONPath)) {

        let document: PixakiDocument = JSON.parse(fs.readFileSync(documentJSONPath, 'utf8')),
            layerIDs: any[] = null,
            cels: any = [],
            size = document.sprites[0].size; // [x,y] eg. [64,64]
        
        if (!fs.existsSync(TEMP_FOLDER_NAME)) {
            fs.mkdirSync(TEMP_FOLDER_NAME);
        }

        convert(['-size', `${size[0]}x${size[1]}`, 'canvas:blue', temp('_srgb.png')], () => {

            convert([temp('_srgb.png'), '-transparent', 'blue', temp('_canvas.png')], (error: any) => {

                fs.unlinkSync(temp('_srgb.png'));

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
                        convert([temp('_canvas.png'), celImage, '-geometry', `+${cel.frame[0][0]}+${cel.frame[0][1]}`, '-composite', temp(`_${cel.identifier}.png`)], () => {
                            celsDone++;
                            
                            // Done all
                            if (celsDone == cels.length) {
                                
                                let column = cels.length < columnCount ? cels.length : columnCount, // max column wrap
                                    row = Math.ceil(cels.length / columnCount); // rows based on column wrap number

                                shell.exec(`montage ${temp(`_{${celIDList.join(',')}}.png`)} -tile ${column}x${row} -geometry ${size[0]}x${size[1]}+0+0 -background transparent '${pixakiFileName}_${targetLayerName}.png'`, () => {

                                    cels.forEach((cel: any) => {
                                        fs.unlinkSync(temp(`_${cel.identifier}.png`));
                                    });

                                    fs.unlinkSync(temp('_canvas.png'));
                                    rimraf(TEMP_FOLDER_NAME, () => {});
                                });
                            }
                        });
                    });

                    return;
                } else {
                    console.log("No layer found");
                    return;
                }
            });
        });

    } else {
        console.log(`Couldn't find file: "${pixakiFilePath}"`);
    }
};