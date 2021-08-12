// ==UserScript==
// @id             iitc-plugin-portalDateTime
// @name           IITC plugin: portalDateTime
// @category       Info
// @version        0.1.1.20210812
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @description    Date time of portal update
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
plugin_info.dateTimeVersion = '20210812';
plugin_info.pluginId = 'portalDateTime';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.portalDateTime = function() {
};

window.plugin.portalDateTime.setupCallback = function() {
    addHook('portalDetailsUpdated', window.plugin.portalDateTime.insert);
}

window.plugin.portalDateTime.insert = function(d) {
  var p = window.portals[window.selectedPortal];
  var ts = p.options.timestamp;
  var date = new Date(ts);
  var dformat = [date.getDate().padLeft(),
                (date.getMonth()+1).padLeft(),
                 date.getFullYear()].join('/') +' ' +
              [date.getHours().padLeft(),
               date.getMinutes().padLeft(),
               date.getSeconds().padLeft()].join(':');

  $('.linkdetails').append('<aside><p>Updated: '+dformat+'</p></aside>');
}

Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}


var setup = function () {
  window.plugin.portalDateTime.setupCallback();

}

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
