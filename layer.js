exports.layer = function(argv){

    var fs = require('fs');
    var im = require('imagemagick');
    var { exec } = require('child_process');

    let pixakiFilePath = argv.path,
        targetLayerName = argv.layerName,
        columnCount = argv.columns;

        console.log(argv.columns);

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

        let document = JSON.parse(fs.readFileSync(documentJSONPath, 'utf8')),
            layerIDs = null,
            cels = [],
            size = document.sprites[0].size; // [x,y] eg. [64,64]
            
        im.convert(['-size', `${size[0]}x${size[1]}`, 'xc:transparent', '_canvas.png']);

        // Loop through layers to find layer matching the given target layer name (grab the ID)
        document.sprites[0].layers.forEach(layer => {
            if(layer.name == targetLayerName){
                // Sort by animation/frame (range.start) order and grab the itemIdentifier only
                layerIDs = layer.clips.sort((a, b) => (a.range.start - b.range.start)).map((clip) => { return clip.itemIdentifier; });
                return;
            }
        });

        if(!!layerIDs){

            // Find all the "cels" of these IDs, these have more info about positioning/size 
            // and create an array of them
            layerIDs.forEach(layerID => {
                document.sprites[0].cels.forEach(cel => {
                    if(cel.identifier == layerID){
                        cels.push(cel);
                    }
                });
            });
            
            let cellIDList = ''; // xxx,xxx,xxx,xxx

            cels.forEach((cel, index) => {
                console.log(`Found ${cel.identifier}`);
                celImage = `${pixakiFilePath}/images/drawings/${cel.identifier}.png`;
                im.convert(['_canvas.png', celImage, '-geometry', `+${cel.frame[0][0]}+${cel.frame[0][1]}`, '-composite', `_${cel.identifier}.png`]);
                cellIDList += cel.identifier + ((index != cels.length - 1) ? ',' : ''); // Comma conditional
            });
            
            let column = cels.length < columnCount ? cels.length : columnCount, // max column wrap
                row = Math.ceil(cels.length / columnCount); // rows based on column wrap number
            console.log(columnCount);
            exec(`montage _{${cellIDList}}.png -tile ${column}x${row} -geometry ${size[0]}x${size[1]}+0+0 -background transparent out.png`, () => {
                
                cels.forEach(cel => {
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
        console.warn(`Couldn't find file: "${pixakiFile}"`);
    }
};