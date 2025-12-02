const KAABA_LAT = 21.4225
const KAABA_LON = 39.8262

export function calculateQiblaDirection(latitude: number, longitude: number): number {
  const lat1 = toRadians(latitude)
  const lon1 = toRadians(longitude)
  const lat2 = toRadians(KAABA_LAT)
  const lon2 = toRadians(KAABA_LON)

  const dLon = lon2 - lon1

  const x = Math.sin(dLon)
  const y = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLon)

  let bearing = Math.atan2(x, y)
  bearing = toDegrees(bearing)
  bearing = (bearing + 360) % 360

  return bearing
}

export function getDirectionText(angleDifference: number): string {
  const normalized = ((angleDifference % 360) + 360) % 360
  const angle = normalized > 180 ? normalized - 360 : normalized

  if (Math.abs(angle) <= 5) return 'Facing Qibla'
  if (Math.abs(angle) <= 22.5) return angle > 0 ? 'Slightly Right' : 'Slightly Left'
  if (Math.abs(angle) <= 45) return angle > 0 ? 'Turn Right' : 'Turn Left'
  if (Math.abs(angle) <= 135) return angle > 0 ? 'To Your Right' : 'To Your Left'
  return 'Behind You'
}

export function isAligned(angleDifference: number): boolean {
  const normalized = ((angleDifference % 360) + 360) % 360
  const angle = normalized > 180 ? normalized - 360 : normalized
  return Math.abs(angle) <= 5
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}
