export interface GeocodeResponse {
  status: string;
  results: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }[];
}
