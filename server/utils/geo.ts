// 📄 server/utils/geo.ts

export interface Coordinates {
    lat: number;
    lng: number;
  }
  
  // Haversine formula (distance in kilometers)
  export function getDistanceBetweenCoords(a: Coordinates, b: Coordinates): number {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
  
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
  
    const aVal =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return R * c;
  }
  
  function toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  