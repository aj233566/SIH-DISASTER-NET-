import { openDB } from 'idb'

const DB_NAME = 'disaster-net-db'
const STORE_NAME = 'incidents'

export const db = openDB(DB_NAME, 1, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      })
    }
  },
})

export async function saveIncident(incident) {
  const database = await db

  await database.add(STORE_NAME, {
    ...incident,
    synced: false,
    createdAt: new Date().toISOString(),
  })
}

export async function getIncidents() {
  const database = await db

  return database.getAll(STORE_NAME)
}

export async function getPendingIncidents() {
  const database = await db

  const incidents = await database.getAll(STORE_NAME)

  return incidents.filter(
    (incident) => incident.synced === false
  )
}

export async function markIncidentAsSynced(id) {
  const database = await db

  const incident = await database.get(STORE_NAME, id)

  if (!incident) {
    return
  }

  incident.synced = true

  await database.put(STORE_NAME, incident)
}

/* Clear all incidents - useful for removing test data */
export async function clearAllIncidents() {
  const database = await db

  await database.clear(STORE_NAME)
}