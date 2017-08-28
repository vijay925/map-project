var map;
var markers = [];
var jSonDataObj = [];
var largeInfowindow;
var fourSquareAlertFlag = true;

var locations = [
    {title: 'Hunter College', location: {lat: 40.7685406, lng: -73.9668138}, id: '49ef4d51f964a52094681fe3'},
    {title: 'Barcade', location: {lat: 40.7443363, lng: -73.9966751}, id: '518a71ab498e430858000827'},
    {title: 'SideBAR', location: {lat: 40.734929, lng: -73.9906367}, id: '49c65e83f964a5203b571fe3'},
    {title: 'Please Dont Tell', location: {lat: 40.7270921, lng: -73.9859516}, id: '4656e1ebf964a52007471fe3'},
    {title: 'Tribeca Grill', location: {lat: 40.7195638, lng: -74.0122452}, id: '3fd66200f964a52091e61ee3'},
    {title: 'Shanghai Cafe Deluxe', location: {lat: 40.717267, lng: -73.9994227}, id: '46936ee3f964a520d0481fe3'}
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

  self.itemClicked = function(data) {
    var itemClickedTitle = data.title;
    var marker;
    for(var i = 0 ; i < markers.length; i++) {
      if(itemClickedTitle == markers[i].title) {
        marker = markers[i];
        populateInfoWindow(marker, largeInfowindow);
        animateMarker(marker);
      } //if
    } //for
  };

} //AppViewModel

var VM = new AppViewModel();
ko.applyBindings(VM);
VM.copyLocations();

VM.searchString.subscribe(function() {
  VM.filter();
});

function googleApiError() {
  alert("Google maps Api failed to load");
}

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
      url: "https://api.foursquare.com/v2/venues/" + locations[index].id + "?" + "v=20170828&limit=1&client_id=W2Y5VDE05JUYUKIDVVVF15ATLRTTM40SSOV5Y0HY2W3MVGRL&client_secret=IKGFWYKIOKYJBLAKATJZAI4OXIWZ05P5XDSX3I2RNYFA5XXN",
      success: success,
      error: error
    });  //ajax
  } //for

  var defaultIcon = makeMarkerIcon('a120d8');
  var highlightedIcon = makeMarkerIcon('FFFF24');

  largeInfowindow = new google.maps.InfoWindow();

  var position;
  var title;

  locations.forEach(function(location, i) {
    position = location.location;
    title = location.title;

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
    } //callback forEach
  );
}

//Helper functions
var success = function(data) {
  var locationData = data.response.venue;

  if(locationData !== null)
    jSonDataObj.push(locationData);
};

var error = function() {
  if(fourSquareAlertFlag) {
    alert("Data from Foursquare failed to load.");
    fourSquareAlertFlag = false;
  }
};

var animateMarker = function(marker) {
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function () {marker.setAnimation(null);}, 500);
};

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
  animateMarker(marker);
  if (infowindow.marker != marker) {
    infowindow.setContent('');
    infowindow.marker = marker;

    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    var currentMarkerFourSquareID = (locations[marker.id]).id;
    var addressIndex;

    for(var i = 0; i < jSonDataObj.length; i++) {
      if(jSonDataObj[i].id == currentMarkerFourSquareID) {
        addressIndex = i;
      }
    }

    infowindow.setContent('<div class="info-window-text">' + jSonDataObj[addressIndex].location.address + '</br>' + jSonDataObj[addressIndex].location.city + '</br>' + jSonDataObj[addressIndex].location.country + '</div>');
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