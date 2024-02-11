const express = require('express')

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const path = require('path')

const app = express()

const dbPath = path.join(__dirname, 'covid19India.db')

app.use(express.json())

let db = null

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`Error: ${error.message}`)

    process.exit(1)
  }
}

initializeDBandServer()

const getTheDetailsOfStates = dbObj => {
  return {
    state_id: dbObj.stateId,
    state_name: dbObj.stateName,
    population: dbObj.population,
  }
}
//API 1
app.get('/states/', async (request, response) => {
  const getAllTheStateQuery = `
    SELECT 
        * 
    FROM   
        state;
    `
  const allStatesDetailsArray = await db.all(getAllTheStateQuery)
  response.send(
    allStatesDetailsArray.map(eachState => getTheDetailsOfStates(eachState)),
  )
})
//API 2
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getAllTheStateQuery = `
    SELECT 
        * 
    FROM   
        state
    WHERE
      state_id = ${stateId};
    `
  const stateDetails = await db.get(getAllTheStateQuery)
  response.send(getTheDetailsOfStates(stateDetails))
})

//API 3
app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const postDistrictsQuery = `
  INSERT INTO 
    district(district_name, state_id, cases, cured, active, deaths)
  VALUES(
    '${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths}
  );
  `
  await db.run(postDistrictsQuery)
  response.send('District Successfully Added')
})

const getDistrictDetails = dbObj => {
  return {
    districtId: dbObj.district_id,
    districtName: dbObj.district_name,
    stateId: dbObj.state_id,
    cases: dbObj.cases,
    cured: dbObj.cured,
    active: dbObj.active,
    deaths: dbObj.deaths,
  }
}
//API 4
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictIdQuery = `
  SELECT 
    *
  FROM
    district
  WHERE
    district_id = ${districtId};
  `
  const districtDetails = await db.get(getDistrictIdQuery)
  response.send(getDistrictDetails(districtDetails))
})

//API 5
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteDistrictQuery = `
  DELETE FROM
    district 
  WHERE
    district_id = ${districtId};
  `
  await db.run(deleteDistrictQuery)
  response.send('District Removed')
})

//API 6
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const putDistrictIdQuery = `
  UPDATE 
    district
  SET 
    district_name= '${districtName}',
    state_id= ${stateId},
    cases= ${cases},
    cured= ${cured},
    active= ${active},
    deaths= ${deaths}
  WHERE 
    district_id = ${districtId};
  `
  await db.run(putDistrictIdQuery)
  response.send('District Details Updated')
})

//API 7

const getStatsResponse = dbObj => {
  return {
    totalCases: dbObj.totalCases,
    totalCured: dbObj.totalCured,
    totalActive: dbObj.totalActive,
    totalDeaths: dbObj.totalDeaths,
  }
}

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const statStateIdQuery = `
  SELECT 
    SUM(cases),
    SUM(cured),
    SUM(active),
    SUM(deaths)
  FROM 
    state
  WHERE
    state_id = ${stateId};
  `
  const statsResponse = await db.get(statStateIdQuery)
  response.send({
    totalCases: statsResponse['SUM(cases)'],
    totalCured: statsResponse['SUM(cured)'],
    totalActive: statsResponse['SUM(active)'],
    totalDeaths: statsResponse['SUM(deaths)'],
  })
})

//API 8

const getTheStateName = dbObj => {
  return {
    stateName: dbObj.stateName,
  }
}

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictIdQuery = `
    SELECT 
      state_id 
    FROM 
      district
    WHERE 
      district_id = ${districtId};
    `
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery)
  const getStateNameQuery = `
    SELECT 
      state_name as stateName 
    FROM 
      state
    WHERE
      state_id = ${getDistrictIdQueryResponse.state_id};
    `
  const getStateNameQueryResponse = await db.get(getStateNameQuery)
  response.send(getTheStateName(getStateNameQueryResponse))
})
module.exports = app
