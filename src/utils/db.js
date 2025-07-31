import Dexie from 'dexie'

export const db = new Dexie('spcDB')
db.version(1).stores({
    records: '++id, fileName, uploadTime, data'   // data: Array<{subgroup:number,measure:number}>
})
