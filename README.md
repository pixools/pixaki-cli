# Pixaki CLI 

[![NPM Version](https://img.shields.io/npm/v/pixaki.svg?style=flat&logo=npm&label=NPM%20Package&color=dodgerblue)](https://www.npmjs.com/package/pixaki)
[![Discord](https://img.shields.io/discord/835988826006487090.svg?logo=discord&logoColor=fff&label=Pixools%20Discord)](https://discord.gg/M8MYyPdR)

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

