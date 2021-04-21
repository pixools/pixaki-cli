import { Commands, PixakiDocument } from "interfaces";

export default function(argv: Commands['exporter']){


    // TODO: Share duplicate code that exists between this and layer.ts (BaseCommand? GetPixakiFile + BaseArgs?)
    var fs = require('fs');
    var im = require('imagemagick');
    var { exec } = require('child_process');

    let pixakiFilePath = argv.path,
        columnCount = argv.columns;

        console.log(argv.columns);

    // Arg checks
    if(!pixakiFilePath){
        console.error("No pixaki file path arg given");
        return;
    }

    // Pixaki 4 Document JSON file
    let documentJSONPath = `${pixakiFilePath}/document.json`;

    if(fs.existsSync(pixakiFilePath) && fs.existsSync(documentJSONPath)){

        let document: PixakiDocument = JSON.parse(fs.readFileSync(documentJSONPath, 'utf8')),
            size = document.sprites[0].size; // [x,y] eg. [64,64]
            
        im.convert(['-size', `${size[0]}x${size[1]}`, 'xc:transparent', '_canvas.png']);

        fs.unlink('_canvas.png');

    }else{
        console.warn(`Couldn't find file: "${pixakiFilePath}"`);
    }
}