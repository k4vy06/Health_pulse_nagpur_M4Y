/**
 * HealthPulse Nagpur - Synthetic Demo Data
 * Nagpur ward coordinates and boundaries (approximate GeoJSON polygons)
 * Centered around Nagpur, Maharashtra, India (lat: 21.1458, lng: 79.0882)
 */

// Generate approximate polygon around a center point
function generatePolygon(centerLat, centerLng, sizeKm = 0.8) {
  const offset = sizeKm / 111; // rough degrees per km
  return [[
    [centerLng - offset, centerLat - offset],
    [centerLng + offset, centerLat - offset],
    [centerLng + offset, centerLat + offset],
    [centerLng - offset, centerLat + offset],
    [centerLng - offset, centerLat - offset]
  ]];
}

const WARDS = [
  // EAST NAGPUR - OUTBREAK ZONE
  {
    wardId: 'W01', name: 'Sakkardara', zone: 'East', population: 182400,
    lat: 21.1558, lng: 79.1182, area: 4.2,
    neighborWards: ['W02', 'W03', 'W08', 'W09']
  },
  {
    wardId: 'W02', name: 'Manewada', zone: 'East', population: 145200,
    lat: 21.1458, lng: 79.1282, area: 3.8,
    neighborWards: ['W01', 'W03', 'W10']
  },
  {
    wardId: 'W03', name: 'Nandanvan', zone: 'East', population: 132000,
    lat: 21.1658, lng: 79.1082, area: 3.5,
    neighborWards: ['W01', 'W02', 'W04']
  },
  {
    wardId: 'W04', name: 'Hudkeshwar', zone: 'East', population: 118500,
    lat: 21.1758, lng: 79.0982, area: 3.9,
    neighborWards: ['W03', 'W05']
  },
  {
    wardId: 'W05', name: 'Wathoda', zone: 'East', population: 95000,
    lat: 21.1858, lng: 79.1182, area: 4.5,
    neighborWards: ['W04', 'W06']
  },
  // WEST NAGPUR
  {
    wardId: 'W06', name: 'Ajni', zone: 'West', population: 128000,
    lat: 21.1258, lng: 79.0582, area: 3.2,
    neighborWards: ['W07', 'W11']
  },
  {
    wardId: 'W07', name: 'Pratap Nagar', zone: 'West', population: 156000,
    lat: 21.1158, lng: 79.0682, area: 3.7,
    neighborWards: ['W06', 'W08', 'W12']
  },
  {
    wardId: 'W08', name: 'Indora', zone: 'West', population: 141000,
    lat: 21.1358, lng: 79.0782, area: 4.1,
    neighborWards: ['W01', 'W07', 'W09']
  },
  {
    wardId: 'W09', name: 'Yashodhara Nagar', zone: 'Central', population: 98000,
    lat: 21.1458, lng: 79.0882, area: 2.8,
    neighborWards: ['W01', 'W08', 'W10']
  },
  {
    wardId: 'W10', name: 'Bhandewadi', zone: 'South', population: 87500,
    lat: 21.1058, lng: 79.1082, area: 3.3,
    neighborWards: ['W02', 'W09', 'W13']
  },
  // NORTH NAGPUR
  {
    wardId: 'W11', name: 'Kamptee Road', zone: 'North', population: 165000,
    lat: 21.1758, lng: 79.0682, area: 5.1,
    neighborWards: ['W06', 'W12', 'W14']
  },
  {
    wardId: 'W12', name: 'Rana Pratap Nagar', zone: 'North', population: 143500,
    lat: 21.1658, lng: 79.0782, area: 4.0,
    neighborWards: ['W07', 'W11', 'W15']
  },
  {
    wardId: 'W13', name: 'Pardi', zone: 'South', population: 112000,
    lat: 21.0958, lng: 79.1182, area: 3.6,
    neighborWards: ['W10', 'W14', 'W16']
  },
  {
    wardId: 'W14', name: 'Kalamna', zone: 'North', population: 124000,
    lat: 21.1858, lng: 79.0882, area: 4.8,
    neighborWards: ['W11', 'W13', 'W17']
  },
  {
    wardId: 'W15', name: 'Hingna', zone: 'West', population: 89000,
    lat: 21.1558, lng: 79.0382, area: 5.5,
    neighborWards: ['W12', 'W16']
  },
  // SOUTH NAGPUR
  {
    wardId: 'W16', name: 'Manish Nagar', zone: 'South', population: 135000,
    lat: 21.0858, lng: 79.0982, area: 3.4,
    neighborWards: ['W13', 'W15', 'W17']
  },
  {
    wardId: 'W17', name: 'Dharampeth', zone: 'Central', population: 178000,
    lat: 21.1358, lng: 79.0982, area: 4.3,
    neighborWards: ['W14', 'W16', 'W18']
  },
  {
    wardId: 'W18', name: 'Sitabuldi', zone: 'Central', population: 92000,
    lat: 21.1458, lng: 79.0982, area: 2.1,
    neighborWards: ['W17', 'W19']
  },
  {
    wardId: 'W19', name: 'Gandhibagh', zone: 'Central', population: 108500,
    lat: 21.1558, lng: 79.0882, area: 2.7,
    neighborWards: ['W18', 'W20']
  },
  {
    wardId: 'W20', name: 'Itwari', zone: 'Central', population: 123000,
    lat: 21.1458, lng: 79.0782, area: 3.0,
    neighborWards: ['W09', 'W19', 'W08']
  },
  // ADDITIONAL WARDS
  {
    wardId: 'W21', name: 'Nagpur Rural', zone: 'Periphery', population: 68000,
    lat: 21.2058, lng: 79.0882, area: 8.2,
    neighborWards: ['W14', 'W11']
  },
  {
    wardId: 'W22', name: 'Butibori', zone: 'Periphery', population: 54000,
    lat: 21.0658, lng: 79.0582, area: 9.5,
    neighborWards: ['W16', 'W15']
  }
];

module.exports = { WARDS, generatePolygon };
