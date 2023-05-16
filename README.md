# Blur UI

The repository provides the `blurImageElement` script type. It provides a way to blur background of ImageElement with iterative two-pass blurring process.

Playcanvas project: https://playcanvas.com/project/1075000/overview/blur-ui

<img width="800" alt="Blur UI" src="https://github.com/querielo/playcanvas-blur-ui/assets/104348270/f9a16597-2957-4a56-8553-4109e499e2bb">

The repo is based on the [Playcanvas TypeScript Template](https://github.com/querielo/playcanvas-typescript-template). I highly recommend you to check it out. Read more about building Playcanvas Blur UI in the Playcanvas TypeScript Template.

## Setup

* Place the Depth layer as close as possible before  the UI layer in the Layers list. The Depth layer is used to define the last layer that is in Color Grab and used for blurring.
* Copy a script with `blurImageElement` to you project. Options:
    * [PREFER] Copy the `blur.js` from [the Playcanvas project](https://playcanvas.com/project/1075000/overview/blur-ui) to your project.
    * Build the `blurImageElement` from this repo.
        * `npm install https://github.com/querielo/playcanvas-blur-ui.git`
        * import `src/components/blur-image` to your Typescipt project


## Usage

The repo contains the next Typescript ScriptComponents for Playcanvas:

* blurImageElement - assign this script type to [Image Element](https://developer.playcanvas.com/en/user-manual/user-interface/image-elements/)
    * Attributes:
        * camera - camera entity that will be used to render the scene for blurring
        * iterations - number of blur iterations. Keep it as low as possible to save performance.
        * radiusFactor - blur radius factor. Keep it as low as possible to have better blur quality.

<img width="1067" alt="Screenshot 2023-05-16 at 22 47 51" src="https://github.com/querielo/playcanvas-blur-ui/assets/104348270/18a16558-1a97-4e66-bdba-a9947d46af14">
