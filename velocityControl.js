L.Control.Velocity = L.Control.extend({
  options: {
    position: "bottomleft",
    emptyString: "Unavailable",
    angleConvention: "bearingCCW",
    showCardinal: false,
    speedUnit: "m/s",
    directionString: "风向",
    speedString: "风速",
    onAdd: null,
    onRemove: null
  },

  onAdd: function onAdd(map) {
    this._container = L.DomUtil.create("div", "leaflet-control-velocity");
    L.DomEvent.disableClickPropagation(this._container);
    
    map.on("mousemove", this._onMouseMove, this);
    map.on("click", this._onMapClick, this);
    
    this._container.innerHTML = this.options.emptyString;
    
    if (this.options.leafletVelocity.options.onAdd) this.options.leafletVelocity.options.onAdd();
    
    return this._container;
  },

  onRemove: function onRemove(map) {
    map.off("mousemove", this._onMouseMove, this);
    map.off("click", this._onMapClick, this);
    if (this.options.leafletVelocity.options.onRemove) this.options.leafletVelocity.options.onRemove();
  },

  _onMapClick: function _onMapClick(e) {
      var self = this;
      var pos = this.options.leafletVelocity._map.containerPointToLatLng(e.containerPoint);
      var gridValue = this.options.leafletVelocity._windy.interpolatePoint(pos.lng, pos.lat);

      // 获取台风袭击概率
      var strikeProbability = findNearestProbability(pos.lat, pos.lng);

      if (gridValue && !isNaN(gridValue[0]) && !isNaN(gridValue[1])) {
        var deg = self.vectorToDegrees(gridValue[0], gridValue[1], this.options.angleConvention);
        var speed = self.vectorToSpeed(gridValue[0], gridValue[1], this.options.speedUnit).toFixed(2);
        var cardinal = this.options.showCardinal ? " (" + self.degreesToCardinalDirection(deg) + ")" : '';
        var content = `<strong>${this.options.directionString}: </strong>${deg.toFixed(2)}°${cardinal}<br>
                    <strong>${this.options.speedString}: </strong>${speed} ${this.options.speedUnit}<br>
                    <b>台风袭击概率：</b>${strikeProbability}<br>
                    <span style="font-size: smaller;"><strong>经度: </strong>${pos.lng.toFixed(3)}</span>,
                    <span style="font-size: smaller;"><strong>纬度: </strong>${pos.lat.toFixed(3)}</span>`;

        L.popup()
        .setLatLng(pos)
        .setContent(content)
        .openOn(self._map);

        // 添加闪烁的红色标记点
        var customMarker = L.circleMarker([pos.lat, pos.lng], {
          radius: 3,
          color: '#CC0000',
          fillColor: '#CC0000',
          fillOpacity: 0.8,
          className: 'blinking-marker'
        }).addTo(self._map).bindPopup(content, { offset: L.point(0, -5) }).openPopup();

        // 监听弹出关闭事件，关闭时移除标记
        customMarker.on('popupclose', function () {
          self._map.removeLayer(customMarker);
        });

      } else {
        L.popup()
        .setLatLng(pos)
        .setContent(this.options.emptyString)
        .openOn(self._map);
      }
  },

  _onMouseMove: function _onMouseMove(e) {
    var self = this;
    var pos = this.options.leafletVelocity._map.containerPointToLatLng(L.point(e.containerPoint.x, e.containerPoint.y));
    var gridValue = this.options.leafletVelocity._windy.interpolatePoint(pos.lng, pos.lat);

    var htmlOut = "";
    if (gridValue && !isNaN(gridValue[0]) && !isNaN(gridValue[1]) && gridValue[2]) {
      var deg = self.vectorToDegrees(gridValue[0], gridValue[1], this.options.angleConvention);
      var cardinal = this.options.showCardinal ? " (" + self.degreesToCardinalDirection(deg) + ") " : '';
      htmlOut = `<strong>${this.options.directionString}: </strong>${deg.toFixed(2)}°${cardinal}<b>,</b> 
                 <strong>${this.options.speedString}: </strong>${self.vectorToSpeed(gridValue[0], gridValue[1], this.options.speedUnit).toFixed(2)} ${this.options.speedUnit}`;
    } else {
      htmlOut = this.options.emptyString;
    }

    self._container.innerHTML = htmlOut;
  },

  vectorToSpeed: function vectorToSpeed(uMs, vMs, unit) {
    var velocityAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2));

    if (unit === "k/h") {
      return this.meterSec2kilometerHour(velocityAbs);
    } else if (unit === "kt") {
      return this.meterSec2Knots(velocityAbs);
    } else if (unit === "mph") {
      return this.meterSec2milesHour(velocityAbs);
    } else {
      return velocityAbs;
    }
  },

  vectorToDegrees: function vectorToDegrees(uMs, vMs, angleConvention) {
    if (angleConvention.endsWith("CCW")) {
      vMs = vMs > 0 ? vMs = -vMs : Math.abs(vMs);
    }

    var velocityAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2));
    var velocityDir = Math.atan2(uMs / velocityAbs, vMs / velocityAbs);
    var velocityDirToDegrees = velocityDir * 180 / Math.PI + 180;

    if (angleConvention === "bearingCW" || angleConvention === "meteoCCW") {
      velocityDirToDegrees += 180;
      if (velocityDirToDegrees >= 360) velocityDirToDegrees -= 360;
    }

    return velocityDirToDegrees;
  },

  degreesToCardinalDirection: function degreesToCardinalDirection(deg) {
    var cardinalDirection = '';

    if (deg >= 0 && deg < 11.25 || deg >= 348.75) {
      cardinalDirection = 'N';
    } else if (deg >= 11.25 && deg < 33.75) {
      cardinalDirection = 'NNW';
    } else if (deg >= 33.75 && deg < 56.25) {
      cardinalDirection = 'NW';
    } else if (deg >= 56.25 && deg < 78.75) {
      cardinalDirection = 'WNW';
    } else if (deg >= 78.25 && deg < 101.25) {
      cardinalDirection = 'W';
    } else if (deg >= 101.25 && deg < 123.75) {
      cardinalDirection = 'WSW';
    } else if (deg >= 123.75 && deg < 146.25) {
      cardinalDirection = 'SW';
    } else if (deg >= 146.25 && deg < 168.75) {
      cardinalDirection = 'SSW';
    } else if (deg >= 168.75 && deg < 191.25) {
      cardinalDirection = 'S';
    } else if (deg >= 191.25 && deg < 213.75) {
      cardinalDirection = 'SSE';
    } else if (deg >= 213.75 && deg < 236.25) {
      cardinalDirection = 'SE';
    } else if (deg >= 236.25 && deg < 258.75) {
      cardinalDirection = 'ESE';
    } else if (deg >= 258.75 && deg < 281.25) {
      cardinalDirection = 'E';
    } else if (deg >= 281.25 && deg < 303.75) {
      cardinalDirection = 'ENE';
    } else if (deg >= 303.75 && deg < 326.25) {
      cardinalDirection = 'NE';
    } else if (deg >= 326.25 && deg < 348.75) {
      cardinalDirection = 'NNE';
    }

    return cardinalDirection;
  },

  meterSec2kilometerHour: function meterSec2kilometerHour(meters) {
    return meters * 3.6;
  },

  meterSec2Knots: function meterSec2Knots(meters) {
    return meters / 0.514;
  },

  meterSec2milesHour: function meterSec2milesHour(meters) {
    return meters * 2.23694;
  }
});
