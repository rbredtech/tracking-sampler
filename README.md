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
