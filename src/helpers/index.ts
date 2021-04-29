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