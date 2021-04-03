// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  requestIntervalTime:10000,
  apiURL:'https://wifipersontracker.herokuapp.com',
  bluepalette:[
    '#3FE0D0', '#B0DFE5', '#95C8D8', '#7EF9FF', 
    '#588BAE', '#89CFF0', '#81D8D0', '#4682B4',
    '#57A0D3', '#4F97A3', '#7285A5', '#73C2FB',
    '#008081', '#4C516D', '#6593F5', '#008ECC',
    '#0F52BA', '#0080FF', '#1034A6', '#0E4D92',
    '#000080', '#003152', '#1D2951', '#111E6C'
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
