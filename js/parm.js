/**
 * Created by DrTone on 04/12/2014.
 */

//Augmented reality app

//Init this app from base
function Parm() {
    BaseApp.call(this);
}

Parm.prototype = new BaseApp();

Parm.prototype.init = function(container) {
    //See if user media supported
    var hasGetUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia) ? true : false;
    if(!hasGetUserMedia) {
        alert("Browser cannot get media");
        return false;
    }
    
    BaseApp.prototype.init.call(this, container);

    //GUI
    this.guiControls = null;
    this.gui = null;

    this.detectMarkersEnabled = true;
    this.markerToObject3DEnabled = true;
    this.markerDebugEnabled = false;
    
    this.renderObjects = [];
    this.markerObjects = [];
    
    return true;
};

Parm.prototype.createScene = function() {
    //Create scene
    BaseApp.prototype.createScene.call(this);

    var manager = new THREE.LoadingManager();
    this.loader = new THREE.OBJLoader( manager );

    var models = ["", "building_one_reduced_x2.obj", "pottery.obj"];
    this.objectIDs = [1, 30, 265];
    for(var i=0; i<this.objectIDs.length; ++i) {
        this.markerObjects.push(new THREE.Object3D());
        this.markerObjects[i].markerID = this.objectIDs[i];
        scene.add(this.markerObjects[i]);
        this.setupMarkerObject(this.markerObjects[i], models[i]);
    }
};

Parm.prototype.setupMarkerObject = function(markerObject, model) {
    //Associate model with marker
    if(model !== "") {
        this.loader.load("models/"+model, function(object) {
            object.scale.set(0.1, 0.1, 0.1);
            markerObject.add(object);
        })
    } else {
        var geometry = new THREE.BoxGeometry(1,1,1);
        var boxMat = new THREE.MeshLambertMaterial({ color: 0x00ff00});
        var box = new THREE.Mesh(geometry, boxMat);
        markerObject.add(box);
    }
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
    //this.delta = this.clock.getDelta();

    BaseApp.prototype.update.call(this);

};

$(document).ready(function() {
    //Initialise app
    if(!Detector.webgl) {
        $('#notSupported').show();
    } else {
        var container = document.getElementById("WebGL-output");
        var app = new Parm();
        if(!app.init(container)) {
            //DEBUG
            console.log("Media not supported");
            return;
        }
        app.createScene();
        //app.createGUI();

        //GUI callbacks

        app.run();
    }

});