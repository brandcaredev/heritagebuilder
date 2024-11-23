declare module "leaflet-geosearch" {
  import { Control } from "leaflet";
  import {
    SearchControlOptions,
    OpenStreetMapProviderOptions,
  } from "leaflet-geosearch/dist/providers/provider";

  export class OpenStreetMapProvider {
    constructor(options?: OpenStreetMapProviderOptions);
  }

  export class GeoSearchControl extends Control {
    constructor(options: SearchControlOptions);
  }
}
