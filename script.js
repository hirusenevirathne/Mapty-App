'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map, mapEvent; // declare map and mapEvent variables

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    //  call the API and get the current position
    function (position) {
      // success callback
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(latitude, longitude);
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

      const coords = [latitude, longitude]; // store the coordinates in an array

      map = L.map('map').setView(coords, 16); // store map in a variable

      L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // add a marker
      map.on('click', function (mapE) {
        // listen to the click event on the map
        mapEvent = mapE; // store the map event in a variable
        form.classList.remove('hidden'); // show the form when the map is clicked
        inputDistance.focus(); // focus on the input field
      });
    },
    function () {
      // error callback
      alert('Could not get your position');
    }
  );
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // prevent the form from submitting

    //console.log(mapEvent);
    const { lat, lng } = mapEvent.latlng; // get the coordinates of the click event

    L.marker([lat, lng]) // create a marker
      .addTo(map) // add a marker to the map
      .bindPopup(
        L.popup({
          //setup popup
          maxWidth: 250,
          minWidth: 100,
          autoClose: false, // popup will not auto close
          closeOnClick: false, // popup will not close when we click on the map
          className: 'running-popup', // add class to popup
        })
      ) //bind popup to the marker
      .setPopupContent('Workout') // add content to the popup
      .openPopup(); // open the popup
  });
}
