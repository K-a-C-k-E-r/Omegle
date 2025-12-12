const { describe, it } = require('node:test');
const assert = require('node:assert');
const { getCountryFromIP, getGeoInfo } = require('../lib/geoLocation');

describe('GeoLocation Tests', () => {
    it('should detect localhost as LOCAL', () => {
        const country = getCountryFromIP('127.0.0.1');
        assert.strictEqual(country, 'LOCAL', 'Localhost should be detected as LOCAL');
        console.log('Localhost detected correctly');
    });

    it('should detect IPv6 localhost as LOCAL', () => {
        const country = getCountryFromIP('::1');
        assert.strictEqual(country, 'LOCAL', 'IPv6 localhost should be detected as LOCAL');
        console.log('IPv6 localhost detected correctly');
    });

    it('should handle IPv4-mapped IPv6 addresses', () => {
        const country = getCountryFromIP('::ffff:127.0.0.1');
        assert.strictEqual(country, 'LOCAL', 'IPv4-mapped localhost should be detected as LOCAL');
        console.log('IPv4-mapped address handled correctly');
    });

    it('should return country for valid public IP', () => {
        // Google DNS IP (US)
        const country = getCountryFromIP('8.8.8.8');
        assert.ok(country !== null, 'Should return a country for valid IP');
        console.log(`Country detected for 8.8.8.8: ${country}`);
    });

    it('should return geo info for localhost', () => {
        const geoInfo = getGeoInfo('127.0.0.1');
        assert.ok(geoInfo !== null, 'Should return geo info');
        assert.strictEqual(geoInfo.country, 'LOCAL', 'Country should be LOCAL');
        assert.strictEqual(geoInfo.region, 'Development', 'Region should be Development');
        console.log('Geo info for localhost:', geoInfo);
    });

    it('should return detailed geo info for public IP', () => {
        const geoInfo = getGeoInfo('8.8.8.8');
        assert.ok(geoInfo !== null, 'Should return geo info');
        assert.ok(geoInfo.country, 'Should have country');
        console.log('Detailed geo info retrieved:', geoInfo);
    });

    it('should handle null IP gracefully', () => {
        const country = getCountryFromIP(null);
        assert.strictEqual(country, 'LOCAL', 'Null IP should return LOCAL');
        console.log('Null IP handled gracefully');
    });

    it('should handle undefined IP gracefully', () => {
        const country = getCountryFromIP(undefined);
        assert.strictEqual(country, 'LOCAL', 'Undefined IP should return LOCAL');
        console.log('Undefined IP handled gracefully');
    });
});
