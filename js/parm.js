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

    this.jsArucoMarker	= new THREEx.JsArucoMarker();
    this.jsArucoMarker.debugEnabled = this.markerDebugEnabled;
    location.hash = '#webcam';
    this.videoGrabbing = new THREEx.WebcamGrabbing();
    this.jsArucoMarker.videoScaleDown = 2;
    document.body.appendChild(this.videoGrabbing.domElement);
    this.markerIndex = undefined;
    
    return true;
};

Parm.prototype.createScene = function() {
    //Create scene
    BaseApp.prototype.createScene.call(this);

    var manager = new THREE.LoadingManager();
    this.loader = new THREE.OBJLoader( manager );

    var models = [
        {name: "", scale: 1.0},
        {name: "building_one_reduced_x2.obj", scale: 0.01},
        {name: "pottery.obj", scale: 0.1}
    ];

    this.objectIDs = [1, 30, 265];
    this.numObjects = this.objectIDs.length;
    for(var i=0; i<this.numObjects; ++i) {
        this.markerObjects.push(new THREE.Object3D());
        this.markerObjects[i].markerID = this.objectIDs[i];
        this.scene.add(this.markerObjects[i]);
        this.markerObjects[i].visible = false;
        this.setupMarkerObject(this.markerObjects[i], models[i]);
    }
};

Parm.prototype.setupMarkerObject = function(markerObject, model) {
    //Associate model with marker
    if(model.name !== "") {
        this.loader.load("models/"+model.name, function(object) {
            object.scale.set(model.scale, model.scale, model.scale);
            object.rotation.x = Math.PI/2;
            markerObject.add(object);
        })
    } else {
        var geometry = new THREE.CircleGeometry(0.25, 16);
        var circleMat = new THREE.MeshBasicMaterial( {color: 0x000000});
        var circle = new THREE.Mesh(geometry, circleMat);
        markerObject.add(circle);
        geometry = new THREE.SphereGeometry(0.25,16,16);
        var sphereMat = new THREE.MeshLambertMaterial({ color: 0x00ff00});
        var sphere = new THREE.Mesh(geometry, sphereMat);
        sphere.position.set(0, 0, 0.5);
        markerObject.add(sphere);
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
    var _this = this, markerIndex = undefined;
    BaseApp.prototype.update.call(this);

    var domElement	= this.videoGrabbing.domElement;
    var markers	= this.jsArucoMarker.detectMarkers(domElement);
    for(var i=0; i<this.numObjects; ++i) {
        this.markerObjects[i].visible = false;
    }
    markers.forEach(function(marker){
        // if( marker.id !== 265 )	return
        for(i=0; i<_this.numObjects; ++i) {
            if(marker.id === _this.markerObjects[i].markerID) {
                markerIndex = i;
                break;
            }
        }
        if(markerIndex === undefined) return;

        _this.jsArucoMarker.markerToObject3D(marker, _this.markerObjects[markerIndex]);

        _this.markerObjects[markerIndex].visible = true;
    })
};

$(document).ready(function() {
    //Initialise app
    if(!Detector.webgl) {
        $('#notSupported').show();
    } else {
        var app = new Parm();
        if(!app.init(null)) {
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