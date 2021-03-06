// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  // Build mode
  production: false,
  // Interval in which requests are sent to the server (e.g.: for retrieving client / network data). Unit: Milliseconds
  requestIntervalTime:10000,
  // Base URL of the API
  apiURL:'https://wifipersontracker.herokuapp.com',
  // Color palette of the diagrams
  palette:[
    '#003bdb', '#831aca', '#b800b2', '#dc0095',
    '#f40074', '#ff0055', '#ff0033', '#ff3900',
    '#7cdb00', '#00c695', '#00a3ff', '#0069ff',
    '#00d453', '#00b6d9', '#008cff', '#001cff',
    '#011638', '#B76D68',
    '#360568', '#5B2A86', '#7785AC', '#A5E6BA',
    '#FF57BB', '#FF8811', '#109648', '#ff3f00',
    '#FF7F11', '#42CAFD', '#C20114', '#89FC00'
  ],
  // Interval in which old data is removed from the clients-component. Unit: Milliseconds
  sortOutTime:3000*60
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
