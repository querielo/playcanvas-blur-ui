# Blur UI

The repository provides the `blurImageElement` script type. It provides a way to blur background of ImageElement with iterative two-pass blurring process. `blurImageElement` assignes the blurred texture as an image of Image Element.

Playcanvas project: https://playcanvas.com/project/1075000/overview/blur-ui

<img width="1477" alt="Blur UI" src="https://github.com/querielo/playcanvas-blur-ui/assets/104348270/0e28ce53-ac58-48cf-a333-508a63888e46">

The repo is based on the [Playcanvas TypeScript Template](https://github.com/querielo/playcanvas-typescript-template). I highly recommend you to check it. Read more about building Playcanvas Blur UI in the Playcanvas TypeScript Template.

## Setup

* Place the Depth layer as close as possible before  the UI layer in the Layers list. The Depth layer is used to define the last layer that is in Color Grab and used for blurring.

<img width="460" alt="Depth Layer" src="https://github.com/querielo/playcanvas-blur-ui/assets/104348270/f955eafb-ec9b-4751-b7be-50f17f19a5b0">


* Copy a script with `blurImageElement` to you project. Options:
    * [PREFER] Copy the `blur.js` from [the Playcanvas project](https://playcanvas.com/project/1075000/overview/blur-ui) to your project.
    * Build the `blurImageElement` from this repo.
        * `npm install https://github.com/querielo/playcanvas-blur-ui.git`
        * import `src/components/blur-image` to your Typescipt project

## Usage

The repo contains the next Typescript ScriptComponents for Playcanvas:

* `blurImageElement` - assign this script type to entety with [Image Element](https://developer.playcanvas.com/en/user-manual/user-interface/image-elements/). It assign blurred texture as an image of Image Element.
    * Attributes:
        * **camera** - camera entity that will be used to render the scene for blurring
        * **iterations** - number of blur iterations. Keep it as low as possible to save performance.
        * **radiusFactor** - blur radius factor. Keep it as low as possible to have better blur quality.

**NOTE:**
* Use as little as possible `blurImageElement` with different **camera**/**iterations**/**radiusFactor**. It is GPU consuming.
* It is relatively cheap to have many `blurImageElement` with the same **camera**/**iterations**/**radiusFactor**.

<img width="1437" alt="Playcanvas Editor example" src="https://github.com/querielo/playcanvas-blur-ui/assets/104348270/b24797af-44c5-4fc0-ad23-d50a09386a88">


