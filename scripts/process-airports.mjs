// Process airports JSON to create a filtered list of major airports
// Only includes airports with IATA codes (typically major airports)

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read the raw airports data
const rawData = JSON.parse(readFileSync(join(__dirname, '../temp_airports.json'), 'utf8'));

// Filter for airports with IATA codes and transform to our format
const airports = [];

for (const [icao, airport] of Object.entries(rawData)) {
  // Only include airports with IATA codes (major airports)
  if (airport.iata && airport.iata.length === 3) {
    airports.push({
      icao: airport.icao,
      iata: airport.iata,
      name: airport.name,
      city: airport.city || '',
      country: airport.country,
      lat: airport.lat,
      lon: airport.lon,
      tz: airport.tz || null
    });
  }
}

// Sort alphabetically by IATA code
airports.sort((a, b) => a.iata.localeCompare(b.iata));

console.log(`Total airports with IATA codes: ${airports.length}`);

// Write to public folder in web app
const outputPath = join(__dirname, '../web-app/public/data/airports.json');
writeFileSync(outputPath, JSON.stringify(airports, null, 2));

console.log(`Wrote ${airports.length} airports to ${outputPath}`);

// Create a compact version for production (minified)
const compactPath = join(__dirname, '../web-app/public/data/airports.min.json');
writeFileSync(compactPath, JSON.stringify(airports));

console.log(`Wrote compact version to ${compactPath}`);

// Show some stats
const countries = new Set(airports.map(a => a.country));
console.log(`Countries covered: ${countries.size}`);

// Show top 10 countries by airport count
const countryCount = {};
airports.forEach(a => {
  countryCount[a.country] = (countryCount[a.country] || 0) + 1;
});

const topCountries = Object.entries(countryCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

console.log('\nTop 10 countries by airport count:');
topCountries.forEach(([country, count]) => {
  console.log(`  ${country}: ${count}`);
});
