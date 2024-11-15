# TV-Insight Tracking Sampler

The tracking sampler can be used to only select devices within a specified percentile for tracking. After the tech cookie[^1] set by the sampler is validated, a random percentile is assigned to the device and persisted.

## How to add the tracking sampler

```html
<script type="text/javascript" src="http://sampling.tvping.com/sampler-default.js"></script>
<script type="text/javascript">
  window.__tvi_sampler.checkInSample(function (inSample) {
    if (inSample) {
      // start tracking
    } else {
      // do nothing
    }
  })
</script>
```

> [!NOTE]
> As described in the [Build](#build) section, multiple entry points for the sample can be built/deployed, so `sampler-default.js` can also be e.g. `sampler-twenty.js`

> [!IMPORTANT]
> While the tech cookie[^1] is not yet validated, the `checkInSample` returns `true` or `false` based on the `IN_SAMPLE_WITHOUT_TC` config value (see [Build](#build) section). To check if the tech cookie evaluation is not done yet, you can use `getPercentile`, which will return `undefined` in this case.

### API methods

The `window.__tvi_sampler` object exposes the following methods:

| Method | Parameters |
| ---    | ---        |
| `checkInSample(callback)` | `callback` - function with boolean parameter indicating if device is in or out of sample |
| `getPercentile(callback)` | `callback` - function with numeric parameter returning the current percentile (`undefined` if not yet set) |

## Testing module

The tracking sampler comes with a separate testing module. Adding this module extends the `window.__tvi_sampler` object with [methods](#testing-api-methods) to update the random percentile to a user-defined value, to reset all stored values, and to check and set the tech cookie[^1].

### Adding the testing module

To enable the testing module, the following script tag has to be added:

```html
<script type="text/javascript" src="http://sampling.tvping.com/testing-default.js"></script>
```

> [!NOTE]
> As described in the [Build](#build) section, if a different entrypoint like e.g. `sampler-twenty.js` is used, also the corresponding testing module needs to be used. I the case of `sampler-twenty.js` this would be `testing-twenty.js`.

It is important that the script tag is added **after** the script tag loading the sampler!

### Testing API methods

Adding the testing module enhances the `window.__tvi_sampler` api with the following methods:

| Method | Parameters |
| ---    | ---        |
| `setPercentile(percentile, callback)` | `percentile` - numeric value between 1 and 100<br />`callback`- function with numeric parameter returning the new percentile |
| `isTechCookieValid(callback)`| `callback` - called with boolean parameter indicating if tech cookie is valid |
| `setValidTechCookie(callback)` | `callback` - called when the tech-cookie was set. After reloading the application, sampling takes place |
| `reset(callback)` | `callback` - called after technical cookie and percentile cookie were deleted |

## Integration with CMP and Tracking

The following code shows exemplary how the sampler can be used in conjunction with the TV-Insight consent library and tracking script:

```html
!DOCTYPE html PUBLIC '-//HbbTV//1.1.1//EN' 'http://www.hbbtv.org/dtd/HbbTV-1.1.1.dtd'>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <meta http-equiv="content-type" content="application/vnd.hbbtv.xhtml+xml; charset=utf-8">
  <script type="text/javascript" src="http://consent.tvping.com/v2/cmp.js?channelId=9999"></script>
  <script type="text/javascript" src="http://sampling.tvping.com/sampler-default.js"></script>
  <script type="text/javascript">
    window.__cmpapi('getTCData', 2, function (tcData) {
      if (tcData.cmpStatus === 'loaded') {
        var consent = tcData.vendor.consents[4040];
        if (consent === true) {
          window.__tvi_sampler.checkInSample(function (inSample) {
            if (inSample) {
              var trackingScriptTag = document.createElement('script');
              trackingScriptTag.type = 'text/javascript';
              trackingScripType.src = 'http://session-consent.tv-insight.com/9999/tracking.js?r=1&d=1&t=' + Date.now();
              document.getElementsByTagName('head')[0].appendChild(trackingScriptTag);
            }
          });
        }
    });
  </script>
</head>

<body></body>
</html>
```

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
    "TECHNICAL_COOKIE_MIN_AGE": 172800000,
    "TECHNICAL_COOKIE_NAME": "x-sampler-t",
    "PERCENTILE_COOKIE_NAME": "x-sampler-p",
    "IN_SAMPLE_WITHOUT_TC": false
  },
  "twenty": {
    "SAMPLER_HOST": "sampling.tvping.com",
    "IN_SAMPLE_PERCENTILE": 20,
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
