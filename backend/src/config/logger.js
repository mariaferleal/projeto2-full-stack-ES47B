export function logSecurityEvent(event, details = {}) {
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    ...details,
  }

  console.log(JSON.stringify(payload))
}
