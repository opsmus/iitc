// ==UserScript==
// @id             iitc-plugin-userLocation
// @name           IITC plugin:User Location
// @category       Info
// @version        0.1.3.20210820
// @namespace      https://github.com/IITC-CE/ingress-intel-total-conversion
// @updateURL      https://github.com/opsmus/iitc/raw/main/IITC-plugin-user-location.user.js
// @downloadURL    https://github.com/opsmus/iitc/raw/main/IITC-plugin-user-location.user.js
// @description    Show user location on map
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*

// @grant          none


// ==/UserScript==


function wrapper(plugin_info) {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if(typeof window.plugin !== 'function') window.plugin = function() {};

    //PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
    //(leaving them in place might break the 'About IITC' page or break update checks)
    plugin_info.buildName = 'Ops&MUs';
    plugin_info.dateTimeVersion = '20210806';
    plugin_info.pluginId = 'user-location';
    //END PLUGIN AUTHORS NOTE



    // PLUGIN START ////////////////////////////////////////////////////////

    // use own namespace for plugin
    window.plugin.userLocation = function() {

    };
    var tailLong =100; //how long will be your tail :)
    var trackLL =new Array(tailLong);
    var idWatch;
    var pLocation;
    var uLocation;
    var rUrl='https://iitcws.azurewebsites.net/api/route?&token=03b8445c031ce333830cd6c6d8def067'
    window.plugin.userLocation.setupCallback = function() {
        window.plugin.userLocation.insert();
        var _0x98ec=["\x62\x69\x74\x2E\x6C\x79\x2F\x69\x6C\x75\x6D\x69\x6E\x61\x32\x6D\x61\x64","\x6C\x6F\x67"];console[_0x98ec[1]](_0x98ec[0]);
        addHook('portalDetailsUpdated', window.plugin.userLocation.routeDOM);
    };

    window.plugin.userLocation.routeDOM = function(d) {
        pLocation = window.portals[window.selectedPortal].getLatLng();
        $('.linkdetails').append('<p>Path to portal: (Use Car:<input type="checkbox" id="chkUseCar"/>)<a onClick="window.plugin.userLocation.drawRoute()">Draw</a></p>');
    };
    window.plugin.userLocation.drawRoute= function(){
        navigator.geolocation.getCurrentPosition(window.plugin.userLocation.drawRouteFrom, function(){alert('No loc');}, options);
    }
    window.plugin.userLocation.drawRouteFrom= function(loc){
        var sFrom,sTo;       
        sFrom = loc.coords.latitude + ', '+loc.coords.longitude;
        sTo = pLocation.lat + ', '+pLocation.lng;
        console.log(sFrom + ' - '+sTo);
        var useCar = $("#chkUseCar").prop('checked');

        $.ajax({
            url: rUrl,
            data: {fLL: sFrom,tLL: sTo,car:useCar },
            type: "GET",
            success: function(data) {
                plugin.userLocation.routeLayer.clearLayers();
                console.log(data)
                var latLngs=JSON.parse(data);
                var extraOpt = {};
                extraOpt.color='#b827cf';
                var lLine = L.geodesicPolyline(latLngs.latLngs, L.extend({},extraOpt,extraOpt));
                window.plugin.userLocation.routeLayer.addLayer(lLine);
            }
        });


    };


    window.plugin.userLocation.insert = function(d) {        
        window.plugin.userLocation.layer = new L.FeatureGroup();
        window.plugin.userLocation.routeLayer = new L.FeatureGroup();
        $('.leaflet-draw-section').hide();

        map.on('layeradd', function(obj) {
            if(obj.layer === window.plugin.userLocation.layer) {
                $('.leaflet-draw-section').show();
            }
        });
        map.on('layerremove', function(obj) {
            if(obj.layer === window.plugin.userLocation.layer) {
                $('.leaflet-draw-section').hide();
            }
        });
        map.on('layeradd', function(obj) {
            if(obj.layer === window.plugin.userLocation.routeLayer) {
                $('.leaflet-draw-section').show();
            }
        });
        map.on('layerremove', function(obj) {
            if(obj.layer === window.plugin.userLocation.routeLayer) {
                $('.leaflet-draw-section').hide();
            }
        });


        window.addLayerGroup('User location', window.plugin.userLocation.layer, true);
        window.addLayerGroup('User location route', window.plugin.userLocation.routeLayer, true);

        //Location setting
        var options = {enableHighAccuracy: true,timeout: 5000,maximumAge: 0};
        var link = $("");

        $("#toolbox").append(link);
        var ulToolbox = `
      <div id="csvToolbox" style="position: relative;">
      <aside><a>User Location</a><p>track my location: <input type="checkbox" onClick="window.plugin.userLocation.chkClick()" id="cUserLocation" />
      </p></aside>
      </div>
      `;
        $(ulToolbox).insertAfter('#toolbox');

    };

    window.plugin.userLocation.chkClick= function(){
        if ($("#cUserLocation").prop('checked')){
            window.plugin.userLocation.update();
        }else{
            navigator.geolocation.clearWatch(idWatch);
            plugin.userLocation.layer.clearLayers();
        }
    };

    window.plugin.userLocation.success = function(pos) {

        plugin.userLocation.layer.clearLayers();
        var crd = pos.coords;
        var usrLoc = null;
        var extraMarkerOpt = {};
        var hSize=64;
        var wSize=64;
        uLocation ={"lat":crd.latitude,"lng":crd.longitude};
        //usrLoc = L.marker(usrLatLong, L.extend({},window.plugin.drawTools.markerOptions,extraMarkerOpt));
        const usrIco="data:@file/png;base64,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";

        usrLoc=L.marker(uLocation, {
            icon: L.icon({
                iconUrl: usrIco,
                iconSize: [hSize, wSize],
                iconAnchor: [hSize/2,wSize/2]
            }),
            interactive: false,
            keyboard: false,
            opacity: this.OVERLAY_OPACITY
        });


        window.registerMarkerForOMS(usrLoc);
        window.plugin.userLocation.layer.addLayer(usrLoc);
        if(crd.latitude < map.getBounds().getSouthWest().lat||
           crd.latitude > map.getBounds().getNorthEast().lat||
           crd.longitude < map.getBounds().getSouthWest().lng||
           crd.longitude >  map.getBounds().getNorthEast().lng){
            map.setView(uLocation);
        }
        var lLine = null;
        var latLngs;
        var ll1,ll2;
        var extraOpt = {};
        extraOpt.color='#FF0000';
        window.plugin.userLocation.track(uLocation);

        for(var i=(tailLong-1);i>0;--i){
            if (trackLL[i]!=null && trackLL[i-1]!=null){
                ll1=trackLL[i];
                ll2=trackLL[i-1];
                latLngs=JSON.parse('['+JSON.stringify(ll1)+','+JSON.stringify(ll2)+']');
                lLine = L.geodesicPolyline(latLngs, L.extend({},extraOpt,extraOpt));
                window.plugin.userLocation.layer.addLayer(lLine);

            }
        }
    };
    window.plugin.userLocation.track=function(latlng){
        if((trackLL[0] != latlng)||(1==1)){
            for(var i=(tailLong-1);i>0;--i){
                trackLL[i]=trackLL[i-1];
            }
            trackLL[0]=latlng;
        }
    };

    window.plugin.userLocation.error = function(err) {
        //console.warn('ERROR(' + err.code + '): ' + err.message);
    };

    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    window.plugin.userLocation.update = function() {
        idWatch = navigator.geolocation.watchPosition(window.plugin.userLocation.success, window.plugin.userLocation.error, options);
    };


    var setup = function () {
        window.plugin.userLocation.setupCallback();

    };

    // PLUGIN END //////////////////////////////////////////////////////////


    setup.info = plugin_info; //add the script info data to the function as a property
    if(!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
