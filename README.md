# TV-Insight Tracking Sampler

The tracking sampler can be used to only select devices within a specified percentile for tracking.

## How to add the tracking sampler

```html
<script type="text/javascript" src="http://sampling.tvping.com/sampler.js"></script>
<script type="text/javascript">
  window.__tvi_sampler.checkInSample("agtt", function (inSample) {
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
| `checkInSample(group, callback)` | `group` - either `agtt` or `agf`, defines the percentile<br />`callback` - function with boolean parameter indicating if device is in or out of sample |

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

- `yarn dev` serves `index.html` from the `/test` folder, which loads the sampler and testing module directly from the `/src` folder

## Build

- `yarn build` minifies the sampler and testing modules and writes them to `/dist`

[^1]: The tech cookie is a cookie/localStorage key which stores the timestamp at creation. If this cookie/localStorage can still be read after at least 2 days, it is assumed that the device can store data in cookies/localStorage and therefore the percentile of the device can be persisted. If cookies/localStorage are not available, the device will always be out-of-sample.
