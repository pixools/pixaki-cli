import { TEMP_FOLDER_NAME } from "../constants";

export let temp = (path: string) => {
    return TEMP_FOLDER_NAME + '/' + path;
}