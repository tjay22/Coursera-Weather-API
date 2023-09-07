let data = [];
let lat, lon, opt, value;
const citiesDropdown = document.querySelector('#cities');
const weatherDiv = document.querySelector('#weather');
const convertBtn = document.querySelector('#converter');

//Check if localStorage is empty, if so, set default unit to Celsius
let isCelsius;
if (localStorage.getItem('isCelsius') === null) {
  localStorage.setItem('isCelsius', true);
} else {
  isCelsius = JSON.parse(localStorage.getItem('isCelsius')); //Default unit from API is Celsius;
}

// For readability, I have created a translation and icon object for the weather types
let weatherTypeTranslation = {
  clear: {
    name: 'Clear',
    icon: 'clear.svg',
  },
  pcloudy: {
    name: 'Partly Cloudy',
    icon: 'pcloudy.svg',
  },
  cloudy: {
    name: 'Cloudy',
    icon: 'cloudy.svg',
  },
  mcloudy: {
    name: 'Mostly Cloudy',
    icon: 'cloudy.svg',
  },
  fog: {
    name: 'Fog',
    icon: 'fog.svg',
  },
  humid: {
    name: 'Humid',
    icon: 'humid.svg',
  },
  lightrain: {
    name: 'Light Rain',
    icon: 'lightrain.svg',
  },
  oshower: {
    name: 'Occasional Showers',
    icon: 'showers.svg',
  },
  ishower: {
    name: 'Isolated Showers',
    icon: 'showers.svg',
  },
  lightsnow: {
    name: 'Light Snow',
    icon: 'lightsnow.svg',
  },
  rain: {
    name: 'Rain',
    icon: 'showers.svg',
  },
  snow: {
    name: 'Snow',
    icon: 'snow.svg',
  },
  rainsnow: {
    name: 'Rain/Snow',
    icon: 'rainsnow.svg',
  },
  tstorm: {
    name: 'Thunderstorm',
    icon: 'tstorm.svg',
  },
  ts: {
    name: 'Thunderstorm',
    icons: 'tstorm.svg',
  },
  tsrain: {
    name: 'Thunderstorm with Rain',
    icon: 'tsrain.svg',
  },
  windy: {
    name: 'Windy',
    icon: 'windy.svg',
  },
};

let weatherDataParsed = {};

// Get the CSV file and parse it using Papa Parse
const csvResponse = fetch('city_coordinates.csv')
  .then((response) => response.text())
  .then((v) => Papa.parse(v))
  .catch((err) => console.error(err));

csvResponse.then((v) => {
  data = v;

  // Create the dropdown list of cities
  for (var i = 1; i < data.data.length; i++) {
    var opt = document.createElement('option');
    opt.value = data.data[i][2];
    opt.setAttribute('data-lat', data.data[i][0]);
    opt.setAttribute('data-lon', data.data[i][1]);
    opt.innerHTML = data.data[i][2];
    citiesDropdown.appendChild(opt);
  }
});

// Get the weather data from the API when city is selected
const getWeather = (select) => {
  opt = select.options[select.selectedIndex];
  lat = opt.dataset.lat;
  lon = opt.dataset.lon;
  value = opt.value;
  weatherDiv.innerHTML =
    '<div class="temp-msg"><div class="lds-ring"><div></div></div>Loading Data...</div>';
  let request = new XMLHttpRequest();
  request.open(
    'GET',
    `http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civillight&output=json&unit=metric`
  );
  request.send();
  request.onload = () => {
    if (request.status === 200) {
      const weatherData = JSON.parse(request.response);
      const objData = weatherData.dataseries;

      // Iterate through the weather data and create a new object with readable data. Farenheit is calculated from Celsius and added to the object. This is done to avoid having to calculate it every time the user switches units.
      for (var i in objData) {
        weatherDataParsed[i] = {
          date: moment(objData[i].date, 'YYYYMMDD').format('ddd, MMM DD'),
          weather: objData[i].weather,
          temp_max_celsius: objData[i].temp2m.max,
          temp_min_celsius: objData[i].temp2m.min,
          temp_max_fahrenheit: celsiusToFahrenheit(objData[i].temp2m.max),
          temp_min_fahrenheit: celsiusToFahrenheit(objData[i].temp2m.min),
        };
      }
      showWeather(weatherDataParsed);
    } else {
      console.log(`error ${request.status} ${request.statusText}`);
    }
  };
};

// Grenerate Weather Cards
const showWeather = (weatherData) => {
  const finalData = weatherData;
  weatherDiv.innerHTML = '';

  for (var i in finalData) {
    const weatherCard = document.createElement('div');
    const weatherTranslation = weatherTypeTranslation[finalData[i].weather];
    weatherCard.classList.add('weather-card');
    weatherCard.innerHTML = `
      <div class="weather-card__inner">
        <div class="weather-card__header">
          <div class="weather-card__date">${finalData[i].date}</div>
          <div class="weather-card__image weather-card__${finalData[i].weather}"><img src="images/${weatherTranslation.icon}" alt="${weatherTranslation.name}" /></div>
        </div>
        <div class="weather-card__body">
          <h3 class="weather-card__${finalData[i].weather}">${weatherTranslation.name}</h3>
          <div class="weather-card__temp_max">High: <span class="celsius">${finalData[i].temp_max_celsius}°C</span><span class="farenheit">${finalData[i].temp_max_fahrenheit}°F</span></div>
          <div class="weather-card__temp_min">Low: <span class="celsius">${finalData[i].temp_min_celsius}°C</span><span class="farenheit">${finalData[i].temp_min_fahrenheit}°F</span></div>
        </div>      
      </div>
    `;
    weatherDiv.appendChild(weatherCard);
  }
  updateTemp();
};

// Event listener for the unit converter toggle switch
const convertUnits = () => {
  isCelsius = !isCelsius;
  localStorage.setItem('isCelsius', isCelsius);
  updateTemp();
};
convertBtn.addEventListener('click', convertUnits);

// Function to update the temperature units and visual styles. This is to avoid re-rendering the entire page.
const updateTemp = () => {
  if (isCelsius) {
    console.log('in true statement');
    $('#converterCheckbox').prop('checked', true);
    $('.celsius').removeClass('visually-hidden');
    $('.farenheit').addClass('visually-hidden');
  } else {
    console.log('in false statement');
    $('#converterCheckbox').prop('checked', false);
    $('.celsius').addClass('visually-hidden');
    $('.farenheit').removeClass('visually-hidden');
  }
};

// Function to convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

// update toggle switch on first load based on localStorage
updateTemp();
