const csv = require('csv-parser')
const fs = require('fs')
const { faker } = require('@faker-js/faker')
const converter = require('json-2-csv')

const INPUT_CSV = './data/in/Weekly-Attendance.csv'
const OUTPUT_CSV = './data/out/Weekly-Attendance.csv'

let results = []
const map = new Map()

const con = (column, callback = (column, value) => {}) => {
  results = results.map((v) => {
    if (!Object.keys(v).includes(column)) {
      return v
    }

    const prev = v[column]
    v[column] = map.has(prev) ? map.get(prev) : callback(column, prev)
    map.set(prev, v[column])

    return v
  })
}

fs.createReadStream(INPUT_CSV)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(`Loaded: ${INPUT_CSV}`)
    console.log(`${results.length} data`)

    // change weekending
    con('Week Ending', (column, value) => {
      return value.replace('0', '1')
    })

    // change name
    con('Employee', (column, value) => {
      return faker.person.firstName() + ' ' + faker.person.lastName()
    })

    con('Department', (column, value) => {
      return faker.commerce.department()
    })

    const out = converter.json2csv(results)

    fs.writeFileSync(OUTPUT_CSV, out)
  })
