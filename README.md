# TV-Insight Tracking Sampler

The tracking sampler can be used to only select devices within a specified percentile for tracking.

## How to add the tracking sampler

```html
<script type="text/javascript" src="http://sampling.tvping.com/sampler.js"></script>
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

### API methods

The `window.__tvi_sampler` object exposes the following methods:

| Method | Parameters |
| ---    | ---        |
| `checkInSample(callback)` | `callback` - function with boolean parameter indicating if device is in or out of sample |

## Testing module

The tracking sampler comes with a separate testing module. Adding this module adds [methods](#testing-api-methods) to update the random percentile to a fixed value, and to check and set the tech cookie[^1].

### Adding the testing module

To enable the testing module, the following script tag has to be added:

```html
<script type="text/javascript" src="http://sampling.tvping.com/testing.js"></script>
```

It is important that the script tag is added **after** the tag loading the sampler!

### Testing API methods

Adding the testing module enhances the `window.__tvi_sampler` api with the following methods:

| Method | Parameters |
| ---    | ---        |
| `setPercentile(percentile, callback)` | `percentile` - numeric value between 0 and 100<br />`callback`- function with numeric parameter returning the new percentile |
| `isTechCookieValid(callback)`| `callback` - called with boolean parameter indicating if tech cookie is valid |
| `setValidTechCookie(callback)` | `callback` - called when the tech-cookie was set. After reloading the application, sampling takes place |

## Development

`yarn dev` serves `index.html` from the `/test` folder, which loads the sampler and testing module directly from the `/src` folder

## Build

Use `yarn build` to create a production-ready, minified sampling and testing module in the `/dist` folder.

The build process requires a `build.json` file with the following structure:

```json
{
  "20": {
    "SAMPLER_HOST": "sampling.tvping.com",
    "MAX_PERCENTILE": 20,
    "TECHNICAL_COOKIE_MIN_AGE": 172800000,
    "TECHNICAL_COOKIE_NAME": "x-sampler-20-t",
    "PERCENTILE_COOKIE_NAME": "x-sampler-20-p"
  },
  "": {
    "SAMPLER_HOST": "sampling.tvping.com",
    "MAX_PERCENTILE": 10,
    "TECHNICAL_COOKIE_MIN_AGE": 172800000,
    "TECHNICAL_COOKIE_NAME": "x-sampler-t",
    "PERCENTILE_COOKIE_NAME": "x-sampler-p"
  }
}
```

> `TECHNICAL_COOKIE_MIN_AGE` is in milliseconds

As shown in the example above, multiple build configs can be added. The example above would build two entrypoints, `sampler-20.js` (the key of the build config is added as a filename suffix) and `sampler.js` (because the key of the config is an empty string).

Every config also gets it's own testing module, following the same rules (e.g. above config outputs `testing-20.js` and `testing.js` to be used with the respective entrypoints).

[^1]: The tech cookie is a cookie/localStorage key which stores the timestamp at creation. If this cookie/localStorage can still be read after at least 2 days, it is assumed that the device can store data in cookies/localStorage and therefore the percentile of the device can be persisted. If cookies/localStorage are not available, the device will always be out-of-sample.
