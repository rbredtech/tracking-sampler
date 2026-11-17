# TV-Insight Tracking Sampler

The tracking sampler can be used to only select devices within a specified percentile for tracking. After the tech cookie[^1] set by the sampler is validated, a random percentile is assigned to the device and persisted.

Integration documentation can be found at https://docs.tv-insight.com/docs/hbbtv-tracking/device-sampling.

## Development

- `yarn dev` serves `index.html` from the `/test` folder, which loads the sampler and testing module directly from the `/src` folder (accessible in the browser via `http://localhost:8000`)
- `yarn serve-scripts` serves the compiled scripts from `/src` via `http://localhost:4000`
- `yarn serve-dist` serves production build scripts from `/dist` via `http://localhost:4040` (see [Build](#build) section)

## Build

Use `yarn build` to create a production-ready, minified sampling and testing module in the `/dist` folder.

The build process requires a `build.json` file with the following structure:

```json
{
  "default": {
    "IN_SAMPLE_PERCENTILE_MIN": 1,
    "IN_SAMPLE_PERCENTILE_MAX": 10,
    "TECH_COOKIE_MIN_AGE": 172800000,
    "TECH_COOKIE_NAME": "x-sampler-t",
    "PERCENTILE_COOKIE_NAME": "x-sampler-p",
    "ELIGIBILITY_COOKIE_NAME": "x-sampler-e",
    "ELIGIBILITY_ROUND_COOKIE_NAME": "x-sampler-r",
    "IN_SAMPLE_WITHOUT_TC": false
  },
  "twenty": {
    "IN_SAMPLE_PERCENTILE_MIN": 1,
    "IN_SAMPLE_PERCENTILE_MAX": 20,
    "TECH_COOKIE_MIN_AGE": 172800000,
    "TECH_COOKIE_NAME": "x-sampler-t",
    "PERCENTILE_COOKIE_NAME": "x-sampler-p",
    "ELIGIBILITY_COOKIE_NAME": "x-sampler-e",
    "ELIGIBILITY_ROUND_COOKIE_NAME": "x-sampler-r",
    "IN_SAMPLE_WITHOUT_TC": true
  },
}
```
> [!CAUTION]
> All [config values](#config-values) are mandatory!

> [!IMPORTANT]
> `TECH_COOKIE_MIN_AGE` is in milliseconds.

By default `./build.json` is expected in the root folder, by passing e.g. `--config ./build/config.json` the path to the build config to use can be passed.

As shown in the example above, multiple build configs can be added. The example above would build two entrypoints, `sampler-default.js` (the key of the build config is added as a filename suffix) and `sampler-twenty.js`. If the key would be an empty string, no file suffix will be added.

Every config also gets it's own testing module, following the same rules (e.g. above config outputs `testing-default.js` and `testing-twenty.js` to be used with the respective entrypoints).

### Config values
| Value | Description |
| ---   | ---         |
| `SAMPLER_HOST` | Host where sampler is deployed to |
| `IN_SAMPLE_PERCENTILE_MIN` | Lowest percentile (inclusive) a device can have to be in sample |
| `IN_SAMPLE_PERCENTILE_MAX` | Highest percentile (inclusive) a device can have to be in sample |
| `TECH_COOKIE_MIN_AGE` | How long the technical cookie needs to be stored until the sampler gets active|
| `TECH_COOKIE_NAME` | Cookie name / localStorage key where technical cookie is saved |
| `PERCENTILE_COOKIE_NAME` | Cookie name / localStorage key where device percentile is saved |
| `ELIGIBILITY_COOKIE_NAME` | Cookie name / localStorage key where the eligibility flag set via `_setEligible` is saved |
| `ELIGIBILITY_ROUND_COOKIE_NAME` | Cookie name / localStorage key where the last checked eligibility round is saved |
| `IN_SAMPLE_WITHOUT_TC` | Should `checkInSample` return `true` or `false` while technical cookie evaluation is not finished |

## Eligibility

The backend can mark devices on a list eligible, so they stay in sample (see `_setEligible`). Once per list, a device that is out of sample checks whether it is on it:

1. After the sampler loaded, `sampler.js` asks `_shouldCheckEligibility`. The check is due if the device is out of sample and the round stored under `ELIGIBILITY_ROUND_COOKIE_NAME` is not `{{ELIGIBILITY_ROUND}}`.
2. If it is, `sampler.js` loads the tracking script's `eligibility.js` from `{{ELIGIBILITY_SCRIPT}}`. It reads the device ID tracking stored and calls `_checkEligibility(did)`, with `''` if there is none.
3. With a device ID, the sampler requests `set_eligible.js?did=<did>` from the backend, which answers with `_eligibilityChecked(eligible, round)`. The sampler then marks an eligible device and stores the round. Without a device ID it stores the round right away.

The backend fills in these placeholders, like `{{SAMPLER_HOST}}` and `{{SAMPLER_PATH}}`:

| Placeholder | Template | Description |
| ---   | ---   | ---         |
| `{{ELIGIBILITY_ROUND}}` | `sampler-impl.js`, `set_eligible.js` | Identifies the list of eligible devices; empty for no list, which turns the check off |
| `{{ELIGIBILITY_SCRIPT}}` | `sampler.js` | Host and path of the tracking script's `eligibility.js`, without the scheme |
| `{{ELIGIBLE}}` | `set_eligible.js` | Whether the requested device ID is on the list (true/false) |

For development, `app.ts` takes `ELIGIBILITY_ROUND`, `ELIGIBILITY_SCRIPT` and `ELIGIBLE_DEVICE_IDS` (comma-separated) from the environment, and serves a stand-in for `eligibility.js` at `/test/eligibility.js`.

[^1]: The tech cookie is a cookie/localStorage key which stores the timestamp at creation. If this cookie/localStorage can still be read after at least 2 days, it is assumed that the device can store data in cookies/localStorage and therefore the percentile of the device can be persisted. If cookies/localStorage are not available, the device will always be out-of-sample.
