const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const MOVIES = require('./movies-data-small.json');

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet());
app.use(validateBearerToken);
app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

app.listen(PORT, () => {
  console.log(`The app is running at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('go to the <a href="/movie">movie page</a>');
});

app.get('/movie', handleGetMovies);

function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization');
  const apiToken = process.env.API_TOKEN;
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: "unauthorized request" });
  }
  next();
}

function handleGetMovies(req, res) {
  let response = MOVIES;

  if(req.query.genre) {
    response = response.filter(movie => {
      return movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
    });
  }
  
  if(req.query.country) {
    response = response.filter(movie => {
      return movie.country.toLowerCase().includes(req.query.country.toLowerCase())
    });
  }
  
  if(req.query.avg_vote) {
    response = response.filter(movie => {
      return movie.avg_vote >= Number(req.query.avg_vote) && movie
    });
  }
  
  res.json(response);
}