# Puglia Transit

A personal, non-commercial Android app (a WebView around one HTML file) for getting around without a car:
travel mode for Puglia (day trips from Brindisi, last train back, offline maps, shops, weather, travel group)
and a home mode for the Netherlands (departures near you, A→B planner, saved routes, road traffic info).

- `app/assets/index.html`: the whole UI and logic.
- `app/src/`: small Java bridges (GPS, offline map tiles, network, notifications, encrypted group relay).
- `build.sh`: build and sign the APK (see the comments at the top).

## Data sources and attribution

- Public transport routing: [Transitous](https://transitous.org) (see [its data sources](https://transitous.org/sources/)). Consider [donating](https://transitous.org/donate/).
- Italian trains: Trenitalia (lefrecce), ViaggiaTreno.
- Road traffic in the Netherlands: [NDW open data](https://opendata.ndw.nu) (CC0).
- Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright); vector tiles from [Protomaps](https://protomaps.com); rendering by [MapLibre GL JS](https://maplibre.org) (BSD-3, see `app/assets/map/MAPLIBRE-LICENSE.txt`).
- Places and search: OpenStreetMap via Overpass, Nominatim and Photon; Wikipedia / Wikidata.
- Weather: [Open-Meteo](https://open-meteo.com) (CC BY 4.0).
- Group relay: [ntfy.sh](https://ntfy.sh); messages are end-to-end encrypted (AES-256-GCM) before they leave the phone.

Code: MIT licence (see `LICENSE`). Fonts in `app/assets/map/fonts` are Noto Sans (SIL Open Font Licence).
