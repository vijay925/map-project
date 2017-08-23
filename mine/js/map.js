var map;
var markers = [];

var locations = [
    {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
    {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
    {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
    {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
    {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
    {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
];

var stringStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};

function AppViewModel() {
  var self = this;

  self.searchString = ko.observable('');
  self.locationsVisible = ko.observableArray();

  self.init = function() {
    for(var i = 0; i < locations.length; i++) {
      self.locationsVisible.push(locations[i]);
    }
  }

  self.filter = function() {
    var lowerCaseSearchString = self.searchString().toLowerCase();

    if(!lowerCaseSearchString) {
      self.locationsVisible.removeAll();
      self.init();
      self.createAndShowMarkers();
    }
    else
    {
      self.locationsVisible.removeAll();
      ko.utils.arrayFilter(locations, function(item) {
        if(stringStartsWith(item.title.toLowerCase(), lowerCaseSearchString))
          self.locationsVisible.push(item);
      });
      self.createAndShowMarkers();
    }
  };

  self.createAndShowMarkers = function() {
    for(var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }

    markers = [];

    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');

    for(var i = 0; i < self.locationsVisible().length; i++) {
      var position = self.locationsVisible()[i].location;
      var title = self.locationsVisible()[i].title;

    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });

    markers.push(marker);
    marker.setMap(map);

    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });

  } //for
  };

}

var VM = new AppViewModel();
ko.applyBindings(VM);
VM.init();

VM.searchString.subscribe(function() {
    VM.filter();
});

/*
function createAndShowMarkers() {
  //console.log("updateMarkers called");
  markers.length = 0;

  var defaultIcon = makeMarkerIcon('0091ff');
  var highlightedIcon = makeMarkerIcon('FFFF24');

  for(var i = 0; i < locationsVisible().length; i++) {
    var position = locationsVisible()[i].location;
    var title = locationsVisible()[i].title;

    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });

    markers.push(marker);
    marker.setMap(map);

    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  } //for

}
*/



function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13,
    mapTypeControl: false
  });

  var defaultIcon = makeMarkerIcon('0091ff');
  var highlightedIcon = makeMarkerIcon('FFFF24');

  var largeInfowindow = new google.maps.InfoWindow();

  for(var i = 0; i < locations.length; i++) {
    var position = locations[i].location;
    var title = locations[i].title;

    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });

    markers.push(marker);
    marker.setMap(map);

    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  } //for

}

function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

function populateInfoWindow(marker, infowindow) {
  if(infowindow.marker != marker) {
    infowindow.setContent('');
    infowindow.marker = marker;

    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
  }

}