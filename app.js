const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(
        'Server started at https://chettayaakashqhyvpnjscpdiitb.drops.nxtwave.tech',
      )
    })
  } catch (e) {
    console.log(`Database Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDatabaseAndServer()

// API 1: Get all movies
app.get('/movies', async (req, res) => {
  try {
    const getMoviesQuery = `
      SELECT movie_name AS movieName
      FROM movie;
    `
    const dbResponse = await db.all(getMoviesQuery)
    res.send(dbResponse)
  } catch (e) {
    console.log(e.message)
    res.status(500).send('Internal Server Error')
  }
})

// API 2: Add a movie
app.post('/movies', async (req, res) => {
  const {directorId, movieName, leadActor} = req.body
  try {
    const addMovieQuery = `
      INSERT INTO movie (director_id, movie_name, lead_actor)
      VALUES ($1, $2, $3);
    `
    await db.run(addMovieQuery, [directorId, movieName, leadActor])
    res.send('Movie Successfully Added')
  } catch (e) {
    console.log(e.message)
    res.status(500).send('Internal Server Error')
  }
})

// API 3: Get movie by ID
app.get('/movies/:movieId', async (req, res) => {
  const {movieId} = req.params
  try {
    const getMovieQuery = `
      SELECT movie_id AS movieId, director_id AS directorId, movie_name AS movieName, lead_actor AS leadActor
      FROM movie
      WHERE movie_id = $1;
    `
    const dbResponse = await db.get(getMovieQuery, [movieId])
    res.send(dbResponse)
  } catch (e) {
    console.log(e.message)
    res.status(500).send('Internal Server Error')
  }
})

// API 4: Update movie details
app.put('/movies/:movieId', async (req, res) => {
  const {movieId} = req.params
  const {directorId, movieName, leadActor} = req.body
  try {
    const updateMovieQuery = `
      UPDATE movie
      SET director_id = $1, movie_name = $2, lead_actor = $3
      WHERE movie_id = $4;
    `
    await db.run(updateMovieQuery, [directorId, movieName, leadActor, movieId])
    res.send('Movie Details Updated')
  } catch (e) {
    console.log(e.message)
    res.status(500).send('Internal Server Error')
  }
})

// API 5: Delete a movie
app.delete('/movies/:movieId', async (req, res) => {
  const {movieId} = req.params
  try {
    const deleteMovieQuery = `
      DELETE FROM movie
      WHERE movie_id = $1;
    `
    await db.run(deleteMovieQuery, [movieId])
    res.send('Movie Removed')
  } catch (e) {
    console.log(e.message)
    res.status(500).send('Internal Server Error')
  }
})

// API 6: Get all directors
app.get('/directors', async (req, res) => {
  try {
    const getDirectorsQuery = `
      SELECT director_id AS directorId, director_name AS directorName
      FROM director;
    `
    const dbResponse = await db.all(getDirectorsQuery)
    res.send(dbResponse)
  } catch (e) {
    console.log(e.message)
    res.status(500).send('Internal Server Error')
  }
})

// API 7: Get movies directed by a specific director
app.get('/directors/:directorId/movies', async (req, res) => {
  const {directorId} = req.params
  try {
    const getMoviesByDirectorQuery = `
      SELECT movie_name AS movieName
      FROM movie
      WHERE director_id = $1;
    `
    const dbResponse = await db.all(getMoviesByDirectorQuery, [directorId])
    res.send(dbResponse)
  } catch (e) {
    console.log(e.message)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = app
