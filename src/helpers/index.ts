import { State } from "gm";
import gm from 'gm';
import { TEMP_FOLDER_NAME } from "../constants";

export let temp = (path: string) => {
    return TEMP_FOLDER_NAME + '/' + path;
}

export let DisplayCompleteMessage = (successCount: number, failCount: number) => {
    console.log("");
    console.log((successCount == 0 ? '\x1b[31m%s\x1b[0m' : '\x1b[32m%s\x1b[0m'), `Exported ${successCount} .pixaki files successfully.`);
    if(failCount > 0){
        console.log('\x1b[31m%s\x1b[0m', `${failCount} failures.`);
    }
}

export let cwdCreate = (cwd: string) => {
    return !!cwd ? `${cwd}/` : '';
}

export let trimPotentialForwardSlash = (path: string) => {
    let trimmed = path;
    
    if(path[path.length - 1] == '/'){
        trimmed = path.slice(0, path.length - 1);
    }

    return trimmed;
}

export let multiMontage = (magick: Magick, montageCollection: string[], montageIndex?: number, state?: State, ): State => {

    if (!montageIndex) {
        montageIndex = 0;
    }

    if (montageIndex < montageCollection.length - 1) {

        let stateMontage = !state ? magick(montageCollection[montageIndex]) : state.montage(montageCollection[montageIndex]);
        
        return multiMontage(magick, montageCollection, montageIndex + 1, stateMontage);
    } else {
        return state.montage(montageCollection[montageIndex]);
    }
}

type Magick = (stream: NodeJS.ReadableStream | Buffer | string, image?: string) => State;