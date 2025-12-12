const geoip = require('geoip-lite')

/**
 * Get country from IP address
 * @param {string} ip - IP address
 * @returns {string|null} Country code or null
 */
function getCountryFromIP(ip) {
    // Handle localhost and development
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost')) {
        return 'LOCAL'
    }

    // Extract IP from IPv6 format
    if (ip.includes('::ffff:')) {
        ip = ip.split('::ffff:')[1]
        // Re-check if it's localhost after extraction
        if (ip === '127.0.0.1') {
            return 'LOCAL'
        }
    }

    const geo = geoip.lookup(ip)
    return geo ? geo.country : null
}

/**
 * Get detailed geo information from IP
 * @param {string} ip - IP address
 * @returns {object|null} Geo information
 */
function getGeoInfo(ip) {
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost')) {
        return {
            country: 'LOCAL',
            region: 'Development',
            city: 'Localhost',
            timezone: 'UTC'
        }
    }

    if (ip.includes('::ffff:')) {
        ip = ip.split('::ffff:')[1]
    }

    const geo = geoip.lookup(ip)

    if (!geo) return null

    return {
        country: geo.country,
        region: geo.region,
        city: geo.city,
        timezone: geo.timezone,
        coordinates: geo.ll
    }
}

module.exports = {
    getCountryFromIP,
    getGeoInfo
}
