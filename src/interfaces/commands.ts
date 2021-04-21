export interface Commands {
    layer: BaseCommand & {
        layerName: string
    },
    exporter: BaseCommand
}

interface BaseCommand {
    path: string,
    columns: number
}