# Pixaki CLI

A CLI for [Pixaki 4](https://pixaki.com/) files.

## Install Globally

```
npm install -g pixaki
```

Currently, each command only exports as a spritesheet as this tool was designed, primarily, for use with [Working Copy](https://workingcopyapp.com/).

## Usage

```
pixaki export <PATH> [-c, --columns=COUNT]
```

```
px e <PATH> [-c, --columns COUNT]
```

- `COUNT`: When to "wrap" the spritesheet (defaults to `8`)
- `PATH`: The pixaki project to export from (requires `.pixaki`)

### Example

```
pixaki export my-sprite.pixaki
```

```
pixaki export my-sprite.pixaki --columns=4
```

```
px e my-sprite.pixaki -c=4
```

### Specific layer exporting

This will grab 1 layer by name and create a spritesheet out of it. It will not respect any visibility or opacity settings and will be the raw drawing. Originally designed for exporting texture mapping. (Normals, Masks etc.)

```
pixaki layer <PATH> <LAYER_NAME> [-c, --columns=COUNT]
```

```
px l <PATH> <LAYER_NAME> [-c, --columns=COUNT]
```

- `LAYER_NAME`: can be anything, it just has to match a layer name within Pixaki