var map;
var markers = [];
var jSonDataObj = [];
var largeInfowindow;

  var locations = [
    {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
    {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
    {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
    {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
    {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
    {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
  ];


function AppViewModel() {
  var self = this;

  self.searchString = ko.observable('');
  self.locationsVisible = ko.observableArray();

  self.copyLocations = function() {
    for (var i = 0; i < locations.length; i++) {
      self.locationsVisible.push(locations[i]);
    }
  };

  self.filter = function() {
    var lowerCaseSearchString = self.searchString().toLowerCase();

    if (!lowerCaseSearchString) {
      self.locationsVisible.removeAll();
      self.copyLocations();
      showMarkers();
    } else {
      self.locationsVisible.removeAll();
      hideMarkers();
      ko.utils.arrayFilter(markers, function(item) {
        var markerTitle = item.title;
        if (stringStartsWith(markerTitle.toLowerCase(), lowerCaseSearchString)) {
          self.locationsVisible.push(item);
          item.setMap(map);
        } //if
      });
    }
  };

  self.itemClicked = function(index) {
    var marker = markers[index];
    populateInfoWindow(markers[index], largeInfowindow);

    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    }
    else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function () {
        marker.setAnimation(null);
      }, 500); // current maps duration of one bounce (v3.13)
    }
  };

} //AppViewModel

var VM = new AppViewModel();
ko.applyBindings(VM);
VM.copyLocations();

VM.searchString.subscribe(function() {
  VM.filter();
});

var success = function(data) {
    jSonDataObj.push(data.response.venues[0].location);
};

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 40.7413549,
      lng: -73.9980244
    },
    zoom: 13,
    mapTypeControl: false
  });

  for(var index = 0; index < locations.length; ++index) {
    $.ajax({
      type: "GET",
      url: "https://api.foursquare.com/v2/venues/search?v=20161016&ll=" + locations[index].location.lat + "," + locations[index].location.lng + "&limit=1&client_id=HM5U0BYQVXKL41312BNBHD5SCAMD321J2NPQDIO1W1TXUEUR&client_secret=RPHJUZVQPQIZOLQOYPT00ZEOZAW334NTHFMIFPGQX0MCXKZB",
      success: success
    });  //ajax
  } //for

  var defaultIcon = makeMarkerIcon('a120d8');
  var highlightedIcon = makeMarkerIcon('FFFF24');

  largeInfowindow = new google.maps.InfoWindow();

  var position;
  var title;
  for (var i = 0; i < locations.length; ++i) {
    position = locations[i].location;
    title = locations[i].title;

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

//Helper functions
var stringStartsWith = function(string, startsWith) {
  string = string || "";
  if (startsWith.length > string.length)
    return false;
  return string.substring(0, startsWith.length) === startsWith;
};

function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34));
  return markerImage;
}

function populateInfoWindow(marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.setContent('');
    infowindow.marker = marker;

    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    infowindow.setContent('<div class="info-window-text">' + jSonDataObj[marker.id].address + '</br>' + jSonDataObj[marker.id].city + '</br>' + jSonDataObj[marker.id].country + '</div>');
    infowindow.open(map, marker);
  }
}

function showMarkers() {
  for (var i = 0; i < markers.length; i++)
    markers[i].setMap(map);
}

function hideMarkers() {
  for (var i = 0; i < markers.length; i++)
    markers[i].setMap(null);
}
