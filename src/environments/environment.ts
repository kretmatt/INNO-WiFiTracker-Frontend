// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  requestIntervalTime:10000,
  apiURL:'https://wifipersontracker.herokuapp.com',
  palette:[
    '#003bdb', '#831aca', '#b800b2', '#dc0095',
    '#f40074', '#ff0055', '#ff0033', '#ff3900',
    '#7cdb00', '#00c695', '#00a3ff', '#0069ff',
    '#00d453', '#00b6d9', '#008cff', '#001cff'
  ]
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
