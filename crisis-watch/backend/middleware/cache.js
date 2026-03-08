const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

function cacheMiddleware(keyPrefix, ttl = 300) {
  return (req, res, next) => {
    const key = `${keyPrefix}_${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    res.sendCached = (data) => {
      const payload = {
        data,
        timestamp: new Date().toISOString(),
        cached: false
      };
      cache.set(key, payload, ttl);
      return res.json(payload);
    };

    res.sendWithFallback = (data) => {
      if (data) {
        return res.sendCached(data);
      }
      return res.json({
        data: [],
        timestamp: new Date().toISOString(),
        cached: false,
        empty: true
      });
    };

    res.sendFallback = () => {
      return res.json({
        data: [],
        timestamp: new Date().toISOString(),
        cached: false,
        error: true,
        empty: true
      });
    };

    next();
  };
}

module.exports = { cache, cacheMiddleware };
