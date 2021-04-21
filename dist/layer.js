"use strict";
exports.__esModule = true;
function default_1(argv) {
    var fs = require('fs');
    var im = require('imagemagick');
    var exec = require('child_process').exec;
    var pixakiFilePath = argv.path, targetLayerName = argv.layerName, columnCount = argv.columns;
    console.log(argv.columns);
    if (!pixakiFilePath) {
        console.error("No pixaki file path arg given");
        return;
    }
    if (!targetLayerName) {
        console.error("No layer arg given");
        return;
    }
    var documentJSONPath = pixakiFilePath + "/document.json";
    if (fs.existsSync(pixakiFilePath) && fs.existsSync(documentJSONPath)) {
        var document_1 = JSON.parse(fs.readFileSync(documentJSONPath, 'utf8')), layerIDs_1 = null, cels_1 = [], size = document_1.sprites[0].size;
        im.convert(['-size', size[0] + "x" + size[1], 'xc:transparent', '_canvas.png']);
        document_1.sprites[0].layers.forEach(function (layer) {
            if (layer.name == targetLayerName) {
                layerIDs_1 = layer.clips.sort(function (a, b) { return (a.range.start - b.range.start); }).map(function (clip) { return clip.itemIdentifier; });
                return;
            }
        });
        if (!!layerIDs_1) {
            layerIDs_1.forEach(function (layerID) {
                document_1.sprites[0].cels.forEach(function (cel) {
                    if (cel.identifier == layerID) {
                        cels_1.push(cel);
                    }
                });
            });
            var cellIDList_1 = '';
            cels_1.forEach(function (cel, index) {
                console.log("Found " + cel.identifier);
                var celImage = pixakiFilePath + "/images/drawings/" + cel.identifier + ".png";
                im.convert(['_canvas.png', celImage, '-geometry', "+" + cel.frame[0][0] + "+" + cel.frame[0][1], '-composite', "_" + cel.identifier + ".png"]);
                cellIDList_1 += cel.identifier + ((index != cels_1.length - 1) ? ',' : '');
            });
            var column = cels_1.length < columnCount ? cels_1.length : columnCount, row = Math.ceil(cels_1.length / columnCount);
            console.log(columnCount);
            exec("montage _{" + cellIDList_1 + "}.png -tile " + column + "x" + row + " -geometry " + size[0] + "x" + size[1] + "+0+0 -background transparent " + targetLayerName + ".png", function () {
                cels_1.forEach(function (cel) {
                    fs.unlinkSync("_" + cel.identifier + ".png");
                });
                fs.unlinkSync('_canvas.png');
            });
            return;
        }
        else {
            console.log("No layer found");
            return;
        }
    }
    else {
        console.warn("Couldn't find file: \"" + pixakiFilePath + "\"");
    }
}
exports["default"] = default_1;
;
//# sourceMappingURL=layer.js.map