This is a javascript library to display deepzoom tiles with [leaflet(v1.0)](http://leafletjs.com). Based on [old deepzoom library](http://leafletjs.com)

Usage:
```javascript
var map = L.map('image2d').setView(new L.LatLng(0,0), 0);

L.tileLayer.deepzoom('DeepZoomImage/hubble_files/{z}/{x}_{y}.jpg', {
    width: 2400,
    height: 3000,
    tolerance: 0.8
}).addTo(map);
```
