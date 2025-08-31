export interface AddressLocation {
  lat: number;
  lon: number;
  display_name: string;
  place_id?: string;
  licence?: string;
  osm_type?: string;
  osm_id?: string;
  boundingbox?: string[];
  class?: string;
  type?: string;
  importance?: number;
  icon?: string;
}
