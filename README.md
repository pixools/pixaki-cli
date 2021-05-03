# Pixaki CLI [![NPM Version](https://img.shields.io/npm/v/pixaki.svg?style=for-the-badge&logo=npm&label=pixaki&color=dodgerblue&link=https://www.npmjs.com/package/pixaki)](https://www.npmjs.com/package/pixaki)

A CLI for [Pixaki 4](https://pixaki.com/) files. Available at https://www.npmjs.com/package/pixaki.

## ImageMagick

First download and install [ImageMagick](http://www.imagemagick.org/), this package will not work without it.

## Install Globally

```
npm install -g pixaki
```

## Setup for development

```
npm i && npm run build && npm link
```

## Usage

```
pixaki export <PATH> [--columns=COUNT] [--outDir=OUT_DIR] [--cwd=CURRENT_WORKING_DIRECTORY]
px e <PATH> [-c COUNT] [-o OUT_DIR] [--cwd=CURRENT_WORKING_DIRECTORY]
```

