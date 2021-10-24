// SELECT ALL ELEMENTS
const country_name_element = document.querySelector('.country .name');
const total_cases_element = document.querySelector('.total-cases .value');
const new_cases_element = document.querySelector('.total-cases .new-value');
const recovered_element = document.querySelector('.recovered .value');
const new_recovered_element = document.querySelector('.recovered .new-value');
const deaths_element = document.querySelector('.deaths .value');
const new_deaths_element = document.querySelector('.deaths .new-value');

const ctx = document.getElementById('axes_line_chart').getContext('2d');
//ctx.height = 620;

// APP VARIABLES
let app_data = [],
  cases_list = [],
  recovered_list = [],
  deaths_list = [],
  deaths = [],
  formatedDates = [];

// GET USERS COUNTRY CODE
let country_code;
if (geoplugin_countryCode()) {
  country_code = geoplugin_countryCode();
} else {
  country_code = 'US';
}

console.log('countrycode', country_code);

let user_country;
country_list.forEach((country) => {
  if (country.code == country_code) {
    user_country = country.name;
  }
});

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

/* ---------------------------------------------- */
/*                     FETCH API                  */
/* ---------------------------------------------- */
function fetchData(country) {
  user_country = country;
  country_name_element.innerHTML = 'Loading...';

  (cases_list = []),
    (recovered_list = []),
    (deaths_list = []),
    (dates = []),
    (formatedDates = []);

  var requestOptions = {
    method: 'GET',
    redirect: 'follow',
  };

  const api_fetch = async (country) => {
    await fetch(
      'https://api.covid19api.com/total/country/' +
        country +
        '/status/confirmed',
      requestOptions
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.forEach((entry) => {
          dates.push(entry.Date);
          cases_list.push(entry.Cases);
        });
      });

    await fetch(
      'https://api.covid19api.com/total/country/' +
        country +
        '/status/recovered',
      requestOptions
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.forEach((entry) => {
          recovered_list.push(entry.Cases);
        });
      });

    await fetch(
      'https://api.covid19api.com/total/country/' + country + '/status/deaths',
      requestOptions
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.forEach((entry) => {
          deaths_list.push(entry.Cases);
        });
      });

    updateUI();
  };

  api_fetch(country);
}

fetchData(user_country);
console.log(recovered_list);
console.log(cases_list);

// UPDATE UI FUNCTION
function updateUI() {
  updateStats();
  axesLinearChart();
}

function updateStats() {
  const total_cases = cases_list[cases_list.length - 1];
  const new_confirmed_cases = total_cases - cases_list[cases_list.length - 2];

  const total_recovered = recovered_list[recovered_list.length - 1];
  const new_recovered_cases =
    total_recovered - recovered_list[recovered_list.length - 2];

  const total_deaths = deaths_list[deaths_list.length - 1];
  const new_deaths_cases = total_deaths - deaths_list[deaths_list.length - 2];

  country_name_element.innerHTML = user_country;
  total_cases_element.innerHTML = formatNumber(total_cases);
  new_cases_element.innerHTML = `+${formatNumber(new_confirmed_cases)}`;
  recovered_element.innerHTML = formatNumber(total_recovered);
  new_recovered_element.innerHTML = `+${formatNumber(new_recovered_cases)}`;
  deaths_element.innerHTML = formatNumber(total_deaths);
  new_deaths_element.innerHTML = `+${formatNumber(new_deaths_cases)}`;

  // format dates
  dates.forEach((date) => {
    formatedDates.push(formatDate(date));
  });
}

// UPDATE CHART
let my_chart;
function axesLinearChart() {
  if (my_chart) {
    my_chart.destroy();
  }

  my_chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Cases',
          data: cases_list,
          fill: false,
          borderColor: '#FFF',
          backgroundColor: '#FFF',
          borderWidth: 1,
        },
        {
          label: 'Recovered',
          data: recovered_list,
          fill: false,
          borderColor: '#009688',
          backgroundColor: '#009688',
          borderWidth: 1,
        },
        {
          label: 'Deaths',
          data: deaths_list,
          fill: false,
          borderColor: '#f44336',
          backgroundColor: '#f44336',
          borderWidth: 1,
        },
      ],
      labels: formatedDates,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        // aAxes: [{
        //     display: true,
        // }],
        yAxes: [
          {
            display: true,
            type: 'logarithmic',
            ticks: {
              beginAtZero: true,
              min: 0,

              callback: function (value, index, values) {
                return value.toLocaleString('fullwide', { useGrouping: true });
              },
            },
            afterBuildTicks: function (my_chart) {
              var maxTicks = 20;
              var maxLog = Math.log(my_chart.ticks[0]);
              var minLogDensity = maxLog / maxTicks;

              var ticks = [];
              var currLog = -Infinity;
              _.each(my_chart.ticks.reverse(), function (tick) {
                var log = Math.max(0, Math.log(tick));
                if (log - currLog > minLogDensity) {
                  ticks.push(tick);
                  currLog = log;
                }
              });
              my_chart.ticks = ticks;
            },
          },
        ],
      },
    },
  });
}

// FORMAT DATES
const monthsNames = [
  'Dec',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatDate(dateString) {
  let date = new Date(dateString);

  return `${date.getDate()} ${monthsNames[date.getMonth()]}`;
}
