import { Commands, PixakiDocument } from "interfaces";
import { convert } from 'imagemagick';
import { TEMP_FOLDER_NAME } from './constants';
import { temp } from "./helpers";

export default function (argv: Commands['exporter']) {

    // TODO: Share duplicate code that exists between this and layer.ts (BaseCommand? GetPixakiFile + BaseArgs?)
    var fs = require('fs');
    var rimraf = require('rimraf');
    var { exec } = require('child_process');

    let pixakiFilePath = argv.path,
        pixakiFileName = pixakiFilePath.split('.pixaki')[0],
        columnCount = argv.columns;

    // Arg checks
    if (!pixakiFilePath) {
        console.error("No pixaki file path arg given");
        return;
    }

    // Pixaki 4 Document JSON file
    let documentJSONPath = `${pixakiFilePath}/document.json`;

    if (fs.existsSync(pixakiFilePath) && fs.existsSync(documentJSONPath)) {

        let document: PixakiDocument = JSON.parse(fs.readFileSync(documentJSONPath, 'utf8')),
            size = document.sprites[0].size, // [x,y] eg. [64,64]
            layerSpritesheets: string[] = [];

        if (!fs.existsSync(TEMP_FOLDER_NAME)) {
            fs.mkdirSync(TEMP_FOLDER_NAME);
        }
        convert(['-size', `${size[0]}x${size[1]}`, 'canvas:blue', temp('_srgb.png')], () => {

            convert([temp('_srgb.png'), '-transparent', 'blue', temp('_canvas.png')], () => {

                fs.unlinkSync(temp('_srgb.png'));

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

                            convert([temp('_canvas.png'), celImage, '-geometry', `+${cel.frame[0][0]}+${cel.frame[0][1]}`, '-composite', temp(`_${cel.identifier}.png`)], () => {

                                convert([temp(`_${cel.identifier}.png`), '-alpha', 'set', '-background', 'none', '-channel', 'A', '-evaluate', 'multiply', layer.opacity * cel.opacity, '+channel', temp(`_${cel.identifier}.png`)], () => {

                                    celPrintCount++;

                                    if (celPrintCount == layer.clips.length) {

                                        let column = layer.clips.length < columnCount ? layer.clips.length : columnCount, // max column wrap
                                            row = Math.ceil(layer.clips.length / columnCount); // rows based on column wrap number

                                        let layerSpritesheet = temp(`${layerIndex}_${layer.name.replace(" ", "-")}.png`);

                                        layerSpritesheets.push(layerSpritesheet);

                                        exec(`montage ${temp(`_{${celIDList.join(',')}}.png`)} -tile ${column}x${row} -geometry ${size[0]}x${size[1]}+0+0 -background transparent ${layerSpritesheet}`, () => {

                                            celIDList.forEach((celID) => {
                                                fs.unlinkSync(temp(`_${celID}.png`));
                                            });

                                            layerSpritesheetPrintCount++;

                                            if (layerSpritesheetPrintCount == visibleLayers.length) {

                                                let pages: string[] = [];

                                                layerSpritesheets.sort().reverse().forEach((spritesheetFile) => {
                                                    pages.push('-page', '+0+0', spritesheetFile);
                                                });

                                                convert(pages.concat(['-background', 'transparent', '-layers', 'merge', '+repage', `${pixakiFileName}.png`]), () => {

                                                    layerSpritesheets.sort().reverse().forEach((spritesheetFile) => {
                                                        fs.unlinkSync(spritesheetFile);
                                                    });
                                                    fs.unlinkSync(temp('_canvas.png'));
                                                    rimraf(TEMP_FOLDER_NAME, () => {});
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

    } else {
        console.warn(`Couldn't find file: "${pixakiFilePath}"`);
    }
}