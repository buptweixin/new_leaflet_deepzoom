L.TileLayer.DeepZoom = L.TileLayer.extend({
	options: {
		continuousWorld: true,
		tolerance: 0.8,
		imageFormat: 'jpg'
	},

	initialize: function (url, options) {
		options = L.setOptions(this, options);
		this._url = url;

    	var imageSize = L.point(options.width, options.height),
	    	tileSize = options.tileSize;

    	this._imageSize = [imageSize];
		this._gridSize = [this._getGridSize(imageSize)];
		while (imageSize.x > 0 || imageSize.y > 0) {
			imageSize = imageSize.divideBy(2).floor();
        	this._imageSize.push(imageSize);
        	this._gridSize.push(this._getGridSize(imageSize));
       }

		this._imageSize.reverse();
		this._gridSize.reverse();

        this.options.maxZoom = this._gridSize.length - 1;
	},
	
	onAdd: function (map) {
		L.TileLayer.prototype.onAdd.call(this, map);

		var mapSize = map.getSize(),
			zoom = this._getBestFitZoom(mapSize),
			imageSize = this._imageSize[zoom],
			center = map.options.crs.pointToLatLng(L.point(imageSize.x / 2, imageSize.y / 2), zoom);
		map.setView(center, zoom, true);
	},
	
	_getBestFitZoom: function (mapSize) {
		var tolerance = this.options.tolerance,
			zoom = this._imageSize.length - 1,
			imageSize, zoom;

		while (zoom) {
			imageSize = this._imageSize[zoom];
			if (imageSize.x * tolerance < mapSize.x && imageSize.y * tolerance < mapSize.y) {
				return zoom;
			}			
			zoom--;
		}
		return zoom;
	},
	
	_getGridSize: function (imageSize) {
		var tileSize = this.options.tileSize;
		return L.point(Math.ceil(imageSize.x / tileSize), Math.ceil(imageSize.y / tileSize));
	},
	
	_addTile: function (coords, container) {
		var tilePos = this._getTilePos(coords),  //像素坐标 coords = tilePoint
		    key = this._tileCoordsToKey(coords);
		var coord = this._wrapCoords(coords),
			zoom = coord.z;
//		    zoom = this._map.getZoom(),
		    imageSize = this._imageSize[zoom],
		    gridSize = this._gridSize[zoom],
		    tileSize = this.options.tileSize;
		
		if(coord.x >= 0 && coord.y >= 0 && coord.x < gridSize.x && coord.y < gridSize.y)
		{
			var tile = this.createTile(this._wrapCoords(coords), L.bind(this._tileReady, this, coords));
			this._initTile(tile);
			if (coord.x === gridSize.x - 1) {
				tile.style.width = imageSize.x - (tileSize * (gridSize.x - 1)) + 'px';
			} 
			if (coord.y === gridSize.y - 1) {
				tile.style.height = imageSize.y - (tileSize * (gridSize.y - 1)) + 'px';
			}
	
			// if createTile is defined with a second argument ("done" callback),
			// we know that tile is async and will be ready later; otherwise
			if (this.createTile.length < 2) {
				// mark tile as ready, but delay one frame for opacity animation to happen
				L.Util.requestAnimFrame(L.bind(this._tileReady, this, coords, null, tile));
			}
	
			L.DomUtil.setPosition(tile, tilePos);
	
			// save tile in cache
			this._tiles[key] = {
				el: tile,
				coords: coords,
				current: true
			};
	
			container.appendChild(tile);
			// @event tileloadstart: TileEvent
			// Fired when a tile is requested and starts loading.
			this.fire('tileloadstart', {
				tile: tile,
				coords: coords
			});
			
		}
		
	},
	
	getTileUrl: function (coords) {
		var data = {
			r: L.Browser.retina ? '@2x' : '',
			s: this._getSubdomain(coords),
			x: coords.x,
			y: coords.y,
			z: this._getZoomForUrl()
		};
		if (this._map && !this._map.options.crs.infinite) {
			var invertedY = this._globalTileRange.max.y - coords.y;
			if (this.options.tms) {
				data['y'] = invertedY;
			}
			data['-y'] = invertedY;
		}
		return L.Util.template(this._url, L.extend(data, this.options));
	},

});

L.tileLayer.deepzoom = function (url, options) {
	return new L.TileLayer.DeepZoom(url, options);
};