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

export let DisplayMessage = (type: MessageType, styledMessage?: string, unstyledMessageAfter?: string) => {
    
    // Reset = "\x1b[0m"
    // Bright = "\x1b[1m"
    // Dim = "\x1b[2m"
    // Underscore = "\x1b[4m"
    // Blink = "\x1b[5m"
    // Reverse = "\x1b[7m"
    // Hidden = "\x1b[8m"

    // FgBlack = "\x1b[30m"
    // FgRed = "\x1b[31m"
    // FgGreen = "\x1b[32m"
    // FgYellow = "\x1b[33m"
    // FgBlue = "\x1b[34m"
    // FgMagenta = "\x1b[35m"
    // FgCyan = "\x1b[36m"
    // FgWhite = "\x1b[37m"

    // BgBlack = "\x1b[40m"
    // BgRed = "\x1b[41m"
    // BgGreen = "\x1b[42m"
    // BgYellow = "\x1b[43m"
    // BgBlue = "\x1b[44m"
    // BgMagenta = "\x1b[45m"
    // BgCyan = "\x1b[46m"
    // BgWhite = "\x1b[47m"

    unstyledMessageAfter = unstyledMessageAfter || '';
    styledMessage = styledMessage || ''

    switch(type){
        case MessageType.ERROR:
            console.log(`\x1b[31m%s\x1b[0m ${unstyledMessageAfter}`, `${styledMessage}`);
        break;
        case MessageType.SUCCESS:
            console.log(`\x1b[32m%s\x1b[0m ${unstyledMessageAfter}`, `${styledMessage}`);
        break;
        case MessageType.WARNING:
            console.log(`\x1b[33m%s\x1b[0m ${unstyledMessageAfter}`, `${styledMessage}`);
        break;
        case MessageType.INFO:
            console.log(`\x1b[34m%s\x1b[0m ${unstyledMessageAfter}`, `${styledMessage}`);
        break;
        default:
            console.log(`\x1b[37m%s\x1b[0m ${unstyledMessageAfter}`, `${styledMessage}`);
        break;
    }
}

export enum MessageType { INFO, SUCCESS, ERROR, WARNING };

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
    
    // If only 1 item
    if(montageCollection.length == 1 && montageIndex == 0){
        
        let stateMontage = magick('');
        return stateMontage.montage(montageCollection[montageIndex]);

    // Not at end
    }else if (montageIndex < montageCollection.length - 1) {

        let stateMontage = !state ? magick('') : state.montage(montageCollection[montageIndex]);
        
        return multiMontage(magick, montageCollection, montageIndex + (!state ? 0 : 1), stateMontage);
    
    // At end
    } else {
        
        return state.montage(montageCollection[montageIndex]);
    }
}

type Magick = (stream: NodeJS.ReadableStream | Buffer | string, image?: string) => State;