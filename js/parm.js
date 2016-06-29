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
    
    this.objectIDs = [1, 30, 265];
    var models = ["", "houseAdj.obj", "arrowAdj.obj"];
    var numObjects = this.objectIDs.length;
    for(var i=0; i<numObjects; ++i) {
        this.markerObjects.push(new THREE.Object3D());
        this.markerObjects[i].markerID = this.objectIDs[i];
        this.scene.add(this.markerObjects[i]);
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

    if (this.video.ended) this.video.play();
    if (this.video.paused) return;
    if (window.paused) return;
    if (this.video.currentTime == this.video.duration) {
        this.video.currentTime = 0;
    }
    if (this.video.currentTime == this.lastTime) return;
    this.lastTime = this.video.currentTime;

    this.vidCanvas.getContext('2d').drawImage(this.video,0,0);
    ARSystem.getCanvasContext().drawImage(this.vidCanvas, 0,0,320,240);

    this.ARCanvas.changed = true;
    this.videoTex.needsUpdate = true;

    var detected = this.detector.detectMarkerLite(this.raster, ARSystem.getThreshold());
    for (var idx = 0; idx<detected; idx++) {
        var id = this.detector.getIdMarkerData(idx);
        var currId;
        if (id.packetLength > 4) {
            currId = -1;
        }else{
            currId=0;
            for (var i = 0; i < id.packetLength; i++ ) {
                currId = (currId << 8) | id.getPacketData(i);
            }
        }
        if (!this.markers[currId]) {
            this.markers[currId] = {};
        }
        this.detector.getTransformMatrix(idx, this.resultMat);
        this.markers[currId].age = 0;
        this.markers[currId].transform = Object.asCopy(this.resultMat);
    }

    for (var i in this.markers) {
        var r = this.markers[i];
        if (r.age > 1) {
            delete this.markers[i];
            this.scene.remove(r.model);
        }
        r.age++;
    }

    for (var i in this.markers) {
        var m = this.markers[i];
        if (!m.model) {
            /*
             m.model = new THREE.Object3D();
             var cube = new THREE.Mesh(
             new THREE.BoxGeometry(100,100,100),
             new THREE.MeshLambertMaterial({color: 0x0000ff})
             );
             console.log("Triggered");
             cube.position.z = -50;
             //cube.doubleSided = true;
             m.model.matrixAutoUpdate = false;
             m.model.add(cube);
             this.scene.add(m.model);
             */
            m.model = this.loadedModel;
            m.model.matrixAutoUpdate = false;
            this.scene.add(m.model);
        }
        copyMatrix(m.transform, this.tmp);
        m.model.matrix.setFromArray(this.tmp);
        //DEBUG
        var elements = m.model.matrix.elements;
        console.log("x y z = ", elements[12], elements[13], elements[14]);
        m.model.matrixWorldNeedsUpdate = true;
    }

    this.renderer.render(this.videoScene, this.videoCam);
    this.renderer.render(this.scene, this.camera);
};

$(document).ready(function() {
    //Initialise app
    if(!Detector.webgl) {
        $('#notSupported').show();
    } else {
        //var container = document.getElementById("WebGLAR-output");
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