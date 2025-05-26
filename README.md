# TV-Insight Tracking Sampler

The tracking sampler can be used to only select devices within a specified percentile for tracking. After the tech cookie[^1] set by the sampler is validated, a random percentile is assigned to the device and persisted.

Integration documentation can be found at https://docs.tv-insight.com/docs/hbbtv-tracking/device-sampling.

## Development

- `yarn dev` serves `index.html` from the `/test` folder, which loads the sampler and testing module directly from the `/src` folder (accessible in the browser via `http://localhost:8080`)
- `yarn serve-scripts` serves the compiled scripts from `/src` via `http://localhost:4000`
- `yarn serve-dist` serves production build scripts from `/dist` via `http://localhost:4040` (see [Build](#build) section)

## Build

Use `yarn build` to create a production-ready, minified sampling and testing module in the `/dist` folder.

The build process requires a `build.json` file with the following structure:

```json
{
  "default": {
    "SAMPLER_HOST": "sampling.tvping.com",
    "IN_SAMPLE_PERCENTILE": 10,
    "COOKIE_DOMAIN": "samplling.tvping.com",
    "TECHNICAL_COOKIE_MIN_AGE": 172800000,
    "TECHNICAL_COOKIE_NAME": "x-sampler-t",
    "PERCENTILE_COOKIE_NAME": "x-sampler-p",
    "IN_SAMPLE_WITHOUT_TC": false
  },
  "twenty": {
    "SAMPLER_HOST": "sampling.tvping.com",
    "IN_SAMPLE_PERCENTILE": 20,
    "COOKIE_DOMAIN": "samplling.tvping.com",
    "TECHNICAL_COOKIE_MIN_AGE": 172800000,
    "TECHNICAL_COOKIE_NAME": "x-sampler-t",
    "PERCENTILE_COOKIE_NAME": "x-sampler-p",
    "IN_SAMPLE_WITHOUT_TC": true
  },
}
```
> [!CAUTION]
> All [config values](#config-values) are mandatory!

> [!IMPORTANT]
> `TECHNICAL_COOKIE_MIN_AGE` is in milliseconds.

By default `./build.json` is expected in the root folder, by passing e.g. `--config ./build/config.json` the path to the build config to use can be passed.

As shown in the example above, multiple build configs can be added. The example above would build two entrypoints, `sampler-default.js` (the key of the build config is added as a filename suffix) and `sampler-twenty.js`. If the key would be an empty string, no file suffix will be added.

Every config also gets it's own testing module, following the same rules (e.g. above config outputs `testing-default.js` and `testing-twenty.js` to be used with the respective entrypoints).

### Config values
| Value | Description |
| ---   | ---         |
| `SAMPLER_HOST` | Host where sampler is deployed to |
| `IN_SAMPLE_PERCENTILE` | Which percentile the device needs to be in |
| `TECHNICAL_COOKIE_MIN_AGE` | How long the technical cookie needs to be stored until the sampler gets active|
| `TECHNICAL_COOKIE_NAME` | Cookie name / localStorage key where technical cookie is saved |
| `PERCENTILE_COOKIE_NAME` | Cookie name / localStorage key where device percentile is saved |
| `IN_SAMPLE_WITHOUT_TC` | Should `checkInSample` return `true` or `false` while technical cookie evaluation is not finished |

[^1]: The tech cookie is a cookie/localStorage key which stores the timestamp at creation. If this cookie/localStorage can still be read after at least 2 days, it is assumed that the device can store data in cookies/localStorage and therefore the percentile of the device can be persisted. If cookies/localStorage are not available, the device will always be out-of-sample.
