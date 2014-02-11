Island Fever
============

Island Fever is the start of a three.js, voxel-based, island game.
Here are some of the sweet features:
  - Diverse, procedurally generated islands with island seeds.
  - A save/load/delete system for re-visiting a island that you already generated. It uses IndexedDB!
  - It works on mobile too! (May take a while to load an island).

I've always wanted to start coding some sort of three.js game that could also run in a mobile browser (specifically chrome for mobile). I tried hard to keep the code clean and fast with a sweet development environment.

[Click Here to try it out!](http://www.kylepaulsen.com/islandFever/)

Instructions
------------

If you want to try out the game, here are the controls:

**On PC/Mac**
* Left click drag to move the camera.
* Right click drag to rotate the camera.
* Mouse wheel to zoom in/out.

**On Mobile**
* Drag with one finger to move the camera.
* Drag with two fingers around a center point to rotate the camera.
* Pinch in / out to zoom in/out.

Development
-----------

Once you clone, run `npm install` to setup the environment.

After that you can `grunt watch` and start developing. You will also need a [http-server](https://npmjs.org/package/http-server) to avoid a cross origin policy problem with loading textures.

Also `grunt test` to run the tests.

Directory Structure
-------------------
* **html** - User interface HTML partials and templates
* **src** - All the main source files.
  * **ui** - The UI source files that interact with the html UI files.
* **test** - Test stuff goes here.
  * **spec** - Jasmine spec files in here.
* **textures** - Game textures.
* **vendor** - Libraries and modules that don't have a (good) npm package available.

Tech
----

Here are some of the packages I am using:

  - Grunt
  - Browserify
  - JSHint
  - Underscore
  - Q (promises)
  - Jasmine

License
----

[MIT](http://opensource.org/licenses/MIT)
