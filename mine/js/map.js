var map;
var markers = [];

var locations = [{
    title: 'Park Ave Penthouse',
    location: {
      lat: 40.7713024,
      lng: -73.9632393
    }
  },
  {
    title: 'Chelsea Loft',
    location: {
      lat: 40.7444883,
      lng: -73.9949465
    }
  },
  {
    title: 'Union Square Open Floor Plan',
    location: {
      lat: 40.7347062,
      lng: -73.9895759
    }
  },
  {
    title: 'East Village Hip Studio',
    location: {
      lat: 40.7281777,
      lng: -73.984377
    }
  },
  {
    title: 'TriBeCa Artsy Bachelor Pad',
    location: {
      lat: 40.7195264,
      lng: -74.0089934
    }
  },
  {
    title: 'Chinatown Homey Space',
    location: {
      lat: 40.7180628,
      lng: -73.9961237
    }
  }
];


function AppViewModel() {
  var self = this;

  self.searchString = ko.observable('');
  self.locationsVisible = ko.observableArray();

  self.copyLocations = function() {
    for (var i = 0; i < locations.length; i++) {
      self.locationsVisible.push(locations[i]);
    }
  }

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

} //AppViewModel

var VM = new AppViewModel();
ko.applyBindings(VM);
VM.copyLocations();

VM.searchString.subscribe(function() {
  VM.filter();
});

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 40.7413549,
      lng: -73.9980244
    },
    zoom: 13,
    mapTypeControl: false
  });

  var defaultIcon = makeMarkerIcon('0091ff');
  var highlightedIcon = makeMarkerIcon('FFFF24');

  var largeInfowindow = new google.maps.InfoWindow();

  for (var i = 0; i < locations.length; ++i) {
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
      console.log(position);
      populateInfoWindow(this, largeInfowindow, position);
    });

    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  } //for

}

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

function populateInfoWindow(marker, infowindow, position) {
  if (infowindow.marker != marker) {
    infowindow.setContent('');
    infowindow.marker = marker;

    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    getData(position);

    //infowindow.setContent('<div>' + marker.title + '</div>');
    //infowindow.open(map, marker);




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

function getData(position) {
  //console.log(position.lat);
  //console.log(position.lng);
  $.ajax({
    type: "GET",
    url: "https://api.foursquare.com/v2/venues/search?v=20161016&ll=" + position.lat + "," + position.lng + "&limit=1&client_id=HM5U0BYQVXKL41312BNBHD5SCAMD321J2NPQDIO1W1TXUEUR&client_secret=RPHJUZVQPQIZOLQOYPT00ZEOZAW334NTHFMIFPGQX0MCXKZB",
    success: function(data) {
      var dataobj = data.response.venues[0].location.address;
      console.log(dataobj);

      /*
      $("#venues").html("");

      $.each(dataobj, function() {
        if (this.venue.categories[0]) {
          str = this.venue.categories[0].icon.prefix;
          newstr = str.substring(0, str.length - 1);
          icon = newstr + this.venue.categories[0].icon.suffix;
        } else {
          icon = "";
        }

        if (this.venue.contact.formattedPhone) {
          phone = "Phone:" + this.venue.contact.formattedPhone;
        } else {
          phone = "";
        }

        if (this.venue.location.address) {
          address = '<p class="subinfo">' + this.venue.location.address + '<br>';
        } else {
          address = "";
        }

        if (this.venue.rating) {
          rating = '<span class="rating">' + this.venue.rating + '</span>';
        }

        appendeddatahtml = '<div class="venue"><h2><span>' + this.venue.name + '<img class="icon" src="' + icon + '"> ' + rating + '</span></h2>' + address + phone + '</p><p><strong>Total Checkins:</strong> ' + this.venue.stats.checkinsCount + '</p></div>';
        $("#venues").append(appendeddatahtml);

      });

      */
    }  //success
  });  //ajax

}