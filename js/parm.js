/**
 * Created by DrTone on 04/12/2014.
 */
//Visualisation framework




//Init this app from base
function Parm() {
    BaseApp.call(this);
}

Parm.prototype = new BaseApp();

Parm.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);
    //GUI
    this.guiControls = null;
    this.gui = null;
};

Parm.prototype.createScene = function() {
    //Create scene
    BaseApp.prototype.createScene.call(this);

    //Load box model
    var width = 10, height = 10, depth = 10;
    var boxGeom = new THREE.BoxGeometry(width, height, depth);
    var boxMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    var box = new THREE.Mesh(boxGeom, boxMaterial);
    box.name = 'box';
    this.scene.add(box);
};

Parm.prototype.createGUI = function() {
    //GUI - using dat.GUI
    this.guiControls = new function() {

    };

    var gui = new dat.GUI();

    //Add some folders
    this.guiAppear = gui.addFolder("Appearance");
    this.guiData = gui.addFolder("Data");
    this.gui = gui;
};

Parm.prototype.update = function() {
    //Perform any updates

    BaseApp.prototype.update.call(this);
};

$(document).ready(function() {
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new Parm();
    app.init(container);
    app.createScene();
    app.createGUI();

    //GUI callbacks

    app.run();
});