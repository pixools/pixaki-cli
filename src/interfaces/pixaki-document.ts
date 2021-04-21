export interface PixakiDocument {
  gridSettings: {
    color: {
      hue: number;
      saturation: number;
      brightness: number;
      alpha: number;
      [k: string]: unknown;
    };
    size: {
      [k: string]: unknown;
    }[];
    showGrid: boolean;
    [k: string]: unknown;
  };
  isIndexed: boolean;
  palette: {
    name: string;
    identifier: string;
    colors: [
      {
        hue: number;
        saturation: number;
        brightness: number;
        alpha: number;
        [k: string]: unknown;
      },
      ...{
        hue: number;
        saturation: number;
        brightness: number;
        alpha: number;
        [k: string]: unknown;
      }[]
    ];
    [k: string]: unknown;
  };
  brushIdentifier: string;
  sprites: [
    {
      layers?: [
        {
          clips?: [
            {
              range?: {
                start: number;
                end: number;
                [k: string]: unknown;
              };
              identifier: string;
              itemIdentifier: string;
              [k: string]: unknown;
            },
            ...{
              range?: {
                start: number;
                end: number;
                [k: string]: unknown;
              };
              identifier: string;
              itemIdentifier: string;
              [k: string]: unknown;
            }[]
          ];
          isVisible: boolean;
          type: string;
          name: string;
          opacity: number;
          identifier: string;
          [k: string]: unknown;
        },
        ...{
          clips?: [
            {
              range?: {
                start: number;
                end: number;
                [k: string]: unknown;
              };
              identifier: string;
              itemIdentifier: string;
              [k: string]: unknown;
            },
            ...{
              range?: {
                start: number;
                end: number;
                [k: string]: unknown;
              };
              identifier: string;
              itemIdentifier: string;
              [k: string]: unknown;
            }[]
          ];
          isVisible: boolean;
          type: string;
          name: string;
          opacity: number;
          identifier: string;
          [k: string]: unknown;
        }[]
      ];
      canvasConfiguration?: {
        previewZoomLevel: number;
        [k: string]: unknown;
      };
      timelineSelection?: {
        frame: number;
        layer: {
          indexes: {
            [k: string]: unknown;
          }[];
          [k: string]: unknown;
        };
        [k: string]: unknown;
      };
      symmetrySettings?: {
        reflectionType: number;
        isEnabled: boolean;
        position: {
          [k: string]: unknown;
        }[];
        isLocked: boolean;
        [k: string]: unknown;
      };
      size?: {
        [k: string]: unknown;
      }[];
      cels?: [
        {
          requiresTrim: boolean;
          frame?: {
            "0"?: {
              [k: string]: unknown;
            }[];
            "1"?: {
              [k: string]: unknown;
            }[];
            [k: string]: unknown;
          }[];
          containerSize?: unknown;
          identifier: string;
          isVisible: boolean;
          type: string;
          opacity: number;
          [k: string]: unknown;
        },
        ...{
          requiresTrim: boolean;
          frame?: {
            "0"?: {
              [k: string]: unknown;
            }[];
            "1"?: {
              [k: string]: unknown;
            }[];
            [k: string]: unknown;
          }[];
          containerSize?: unknown;
          identifier: string;
          isVisible: boolean;
          type: string;
          opacity: number;
          [k: string]: unknown;
        }[]
      ];
      duration: number;
      identifier: string;
      referenceImages?: {
        [k: string]: unknown;
      }[];
      [k: string]: unknown;
    },
    ...{
      layers?: [
        {
          clips?: [
            {
              range?: {
                start: number;
                end: number;
                [k: string]: unknown;
              };
              identifier: string;
              itemIdentifier: string;
              [k: string]: unknown;
            },
            ...{
              range?: {
                start: number;
                end: number;
                [k: string]: unknown;
              };
              identifier: string;
              itemIdentifier: string;
              [k: string]: unknown;
            }[]
          ];
          isVisible: boolean;
          type: string;
          name: string;
          opacity: number;
          identifier: string;
          [k: string]: unknown;
        },
        ...{
          clips?: [
            {
              range?: {
                start: number;
                end: number;
                [k: string]: unknown;
              };
              identifier: string;
              itemIdentifier: string;
              [k: string]: unknown;
            },
            ...{
              range?: {
                start: number;
                end: number;
                [k: string]: unknown;
              };
              identifier: string;
              itemIdentifier: string;
              [k: string]: unknown;
            }[]
          ];
          isVisible: boolean;
          type: string;
          name: string;
          opacity: number;
          identifier: string;
          [k: string]: unknown;
        }[]
      ];
      canvasConfiguration?: {
        previewZoomLevel: number;
        [k: string]: unknown;
      };
      timelineSelection?: {
        frame: number;
        layer: {
          indexes: {
            [k: string]: unknown;
          }[];
          [k: string]: unknown;
        };
        [k: string]: unknown;
      };
      symmetrySettings?: {
        reflectionType: number;
        isEnabled: boolean;
        position: {
          [k: string]: unknown;
        }[];
        isLocked: boolean;
        [k: string]: unknown;
      };
      size?: {
        [k: string]: unknown;
      }[];
      cels?: [
        {
          requiresTrim: boolean;
          frame?: {
            "0"?: {
              [k: string]: unknown;
            }[];
            "1"?: {
              [k: string]: unknown;
            }[];
            [k: string]: unknown;
          }[];
          containerSize?: unknown;
          identifier: string;
          isVisible: boolean;
          type: string;
          opacity: number;
          [k: string]: unknown;
        },
        ...{
          requiresTrim: boolean;
          frame?: {
            "0"?: {
              [k: string]: unknown;
            }[];
            "1"?: {
              [k: string]: unknown;
            }[];
            [k: string]: unknown;
          }[];
          containerSize?: unknown;
          identifier: string;
          isVisible: boolean;
          type: string;
          opacity: number;
          [k: string]: unknown;
        }[]
      ];
      duration: number;
      identifier: string;
      referenceImages?: {
        [k: string]: unknown;
      }[];
      [k: string]: unknown;
    }[]
  ];
  selectedColor: {
    hue: number;
    saturation: number;
    brightness: number;
    alpha: number;
    [k: string]: unknown;
  };
  animationSpeed: number;
  onionSkinSettings: {
    tintMode: number;
    keyframesBefore: number;
    keyframesAfter: number;
    loop: boolean;
    isEnabled: boolean;
    opacity: number;
    [k: string]: unknown;
  };
  selectedSpriteIdentifier: string;
  brushOptions: {
    size: number;
    usePixelPerfectSmoothing: boolean;
    selectedPatternIndex: number;
    opacity: number;
    patternAlignment: number;
    [k: string]: unknown;
  };
  eraserOptions: {
    size: number;
    usePixelPerfectSmoothing: boolean;
    selectedPatternIndex: number;
    opacity: number;
    patternAlignment: number;
    [k: string]: unknown;
  };
  eraserIdentifier: string;
  primarySpriteIdentifier: string;
  [k: string]: unknown;
}