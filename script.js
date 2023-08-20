'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10); //Usually use a libary to crete a ID

  constructor(coords, distance, duration) {
    this.coords = coords; // [lot, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      month[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running'; // create a property
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration); // from perent class
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling'; // create a property
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration); // from perent class
    this.elevation = elevation;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class App {
  // Main class
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    // constructor method

    this._getPosition(); // call the getPosition method
    form.addEventListener('submit', this._newWorkout.bind(this)); //pass the _newWorkout method
    inputType.addEventListener('change', this._toggleElevationField); //no need to bind coz this not using in the method
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this)); // add event lisner to workout form
  }

  _getPosition() {
    // get the current position from user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          // call as aregular function so need to bind this keyword
          //  call the API and get the current position
          alert('Could not get your position'); // error callback
        }
      );
    }
  }

  _loadMap(position) {
    // load the map
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    //console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude]; // store the coordinates in an array

    this.#map = L.map('map').setView(coords, 16); // store map in a variable

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // add a marker
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    // show the workout form
    this.#mapEvent = mapE; // store the map event in a variable
    form.classList.remove('hidden'); // show the form when the map is clicked
    inputDistance.focus(); // focus on the input field
  }

  _hideForm() {
    // Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    // toggle the elevation field
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden'); // toggle the hidden class on the elevation field
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden'); // toggle the hidden class on the cadence field
  }

  _newWorkout(e) {
    // create a new workout
    // Helper funtions
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp)); //return true only if all the input values are finite
    e.preventDefault(); // prevent the form from submitting
    const allPositive = (...inputs) => inputs.every(inp => inp > 0); //return true if only all values are positive

    // Get data from form
    const type = inputType.value; //get what is the workout
    const distance = +inputDistance.value; //get the distance value and convert it to a number
    const duration = +inputDuration.value; //get the duration value and convert it to a number
    const { lat, lng } = this.#mapEvent.latlng; // get the coordinates of the click event
    let workout; // create a variable to store the workout

    // if workout running create running object
    //check data validation
    if (type === 'running') {
      const cadence = +inputCadence.value; //get the cadence if its running
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        //Gurd clouser Modern JS use this commonly
        return alert('Inputs have to be positive numbers !');
      }
      workout = new Running([lat, lng], distance, duration, cadence); // create a new object from the Running
    }

    // if workout cycling create cycling object
    //check data validation
    if (type === 'cycling') {
      const elevation = +inputElevation.value; //get the elevation if its cycling
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        //Gurd clouser Modern JS use this commonly
        return alert('Inputs have to be positive numbers !');
      }
      workout = new Cycling([lat, lng], distance, duration, elevation); // create a new object from the Cycling
    }

    // add new object to workout array
    this.#workouts.push(workout); // add new object to workout array as a property
    //console.log(workout);

    // render workout on map as marker
    this._renderWorkoutMarker(workout); // call the renderWorkoutMarker method
    this._renderWorkout(workout);

    // hide form + Clear input fields
    this._hideForm();
  }
  _renderWorkoutMarker(workout) {
    // render workout on the map as marker

    L.marker(workout.coords) // create a marker
      .addTo(this.#map) // add a marker to the map
      .bindPopup(
        L.popup({
          //setup popup
          maxWidth: 250,
          minWidth: 100,
          autoClose: false, // popup will not auto close
          closeOnClick: false, // popup will not close when we click on the map
          className: `${workout.type}-popup`, // add class to popup
        })
      ) //bind popup to the marker
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      ) // add content to the popup
      .openPopup(); // open the popup
  }
  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    `;

    if (workout.type === 'running') {
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span> 
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    }
    if (workout.type === 'cycling') {
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      `;
    }
    form.insertAdjacentHTML('afterend', html); //add html element to form.
  }

  _moveToPopup(e) {
    //move to popup method
    const workoutEl = e.target.closest;
  }
}

const app = new App(); // create a new object from the App class
