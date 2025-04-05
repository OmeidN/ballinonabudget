import dotenv from 'dotenv';

dotenv.config();

// Check if the GOOGLE_MAPS_API_KEY is available
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

interface DistanceMatrixResult {
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
  status: string;
}

/**
 * Calculate distance and duration between user location and store
 * @param userLat User's latitude
 * @param userLng User's longitude
 * @param storeLat Store's latitude
 * @param storeLng Store's longitude
 * @returns Distance and duration
 */
export async function calculateDistanceMatrix(
  userLat: number, 
  userLng: number, 
  storeLat: number, 
  storeLng: number
): Promise<DistanceMatrixResult | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('GOOGLE_MAPS_API_KEY is not available. Please set it in your environment variables.');
    return null;
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    
    // Set query parameters
    url.searchParams.append('origins', `${userLat},${userLng}`);
    url.searchParams.append('destinations', `${storeLat},${storeLng}`);
    url.searchParams.append('mode', 'driving');
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error('Google Maps API error:', response.statusText);
      return null;
    }

    const data = await response.json();
    
    // Check if the API returned a valid response
    if (
      data.status === 'OK' && 
      data.rows && 
      data.rows.length > 0 && 
      data.rows[0].elements && 
      data.rows[0].elements.length > 0
    ) {
      const element = data.rows[0].elements[0];
      
      if (element.status === 'OK') {
        return {
          distance: element.distance,
          duration: element.duration,
          status: 'OK'
        };
      }
    }
    
    console.error('Invalid response from Google Maps API:', data);
    return null;
  } catch (error) {
    console.error('Error calling Google Maps API:', error);
    return null;
  }
}

/**
 * Convert distance matrix results to store model format
 * @param distanceMatrix Distance matrix result
 * @returns Distance in miles and travel time in minutes
 */
export function formatDistanceMatrix(distanceMatrix: DistanceMatrixResult): { distance: number, travelTime: number } {
  // Convert meters to miles (1 meter = 0.000621371 miles)
  const distanceInMiles = distanceMatrix.distance.value * 0.000621371;
  
  // Convert seconds to minutes
  const travelTimeInMinutes = Math.ceil(distanceMatrix.duration.value / 60);
  
  return {
    distance: parseFloat(distanceInMiles.toFixed(1)),
    travelTime: travelTimeInMinutes
  };
}

export default { calculateDistanceMatrix, formatDistanceMatrix };