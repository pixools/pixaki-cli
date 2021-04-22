import { Commands, PixakiDocument } from "./interfaces";

export default function(argv: Commands['layer']){

    var fs = require('fs');
    var im = require('imagemagick');
    var { exec } = require('child_process');

    let pixakiFilePath = argv.path,
        targetLayerName = argv.layerName,
        columnCount = argv.columns;

    // Arg checks
    if(!pixakiFilePath){
        console.error("No pixaki file path arg given");
        return;
    }

    if(!targetLayerName){
        console.error("No layer arg given");
        return;
    }

    // Pixaki 4 Document JSON file
    let documentJSONPath = `${pixakiFilePath}/document.json`;

    if(fs.existsSync(pixakiFilePath) && fs.existsSync(documentJSONPath)){

        let document: PixakiDocument = JSON.parse(fs.readFileSync(documentJSONPath, 'utf8')),
            layerIDs: any[] = null,
            cels: any = [],
            size = document.sprites[0].size; // [x,y] eg. [64,64]
            
        im.convert(['-size', `${size[0]}x${size[1]}`, 'xc:transparent', '_canvas.png']);

        // Loop through layers to find layer matching the given target layer name (grab the ID)
        document.sprites[0].layers.forEach((layer: PixakiDocument['sprites'][0]['layers'][0]) => {
            if(layer.name == targetLayerName){
                // Sort by animation/frame (range.start) order and grab the itemIdentifier only
                layerIDs = layer.clips.sort((a: PixakiDocument['sprites'][0]['layers'][0]['clips'][0], b: PixakiDocument['sprites'][0]['layers'][0]['clips'][0]) => (a.range.start - b.range.start)).map((clip: any) => { return clip.itemIdentifier; });
                return;
            }
        });

        if(!!layerIDs){

            // Find all the "cels" of these IDs, these have more info about positioning/size 
            // and create an array of them
            layerIDs.forEach((layerID: any) => {
                document.sprites[0].cels.forEach((cel: any) => {
                    if(cel.identifier == layerID){
                        cels.push(cel);
                    }
                });
            });
            
            let celIDList = ''; // xxx,xxx,xxx,xxx

            cels.forEach((cel: any, index: any) => {
                console.log(`Found ${cel.identifier}`);
                let celImage: string = `${pixakiFilePath}/images/drawings/${cel.identifier}.png`;
                im.convert(['_canvas.png', celImage, '-geometry', `+${cel.frame[0][0]}+${cel.frame[0][1]}`, '-composite', `_${cel.identifier}.png`]);
                celIDList += cel.identifier + ((index != cels.length - 1) ? ',' : ''); // Comma conditional
            });
            
            let column = cels.length < columnCount ? cels.length : columnCount, // max column wrap
                row = Math.ceil(cels.length / columnCount); // rows based on column wrap number
            
            exec(`montage _{${celIDList}}.png -tile ${column}x${row} -geometry ${size[0]}x${size[1]}+0+0 -background transparent ${targetLayerName}.png`, () => {
                
                cels.forEach((cel: any) => {
                    fs.unlinkSync(`_${cel.identifier}.png`);
                });

                fs.unlinkSync('_canvas.png');
            });

            return;
        }else{
            console.log("No layer found");
            return;
        }

    }else{
        console.warn(`Couldn't find file: "${pixakiFilePath}"`);
    }
};