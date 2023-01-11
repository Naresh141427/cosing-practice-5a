const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbpath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let db = null;

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(e.message);
  }
};

intializeDbAndServer();

//API1 GET MOVIES DETAILS
app.get("/movies/", async (request, response) => {
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    };
  };
  const getDetailsQuery = `SELECT
            *
            FROM
                movie;`;
  const movieDetails = await db.all(getDetailsQuery);
  response.send(
    movieDetails.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//API2 CREATE DETAILS
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addQuery = `INSERT INTO
            movie(director_id,movie_name,lead_actor)
        VALUES
        (
            '${directorId}',
            '${movieName}',
            '${leadActor}'
        );`;
  await db.run(addQuery);
  response.send("Movie Successfully Added");
});

//API3 GET A PARTICULAR MOVIE DETAILS
app.get("/movies/:movieId/", async (request, response) => {
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    };
  };
  const { movieId } = request.params;
  const getQuery = `SELECT 
            *
        FROM
            movie
        WHERE
            movie_id = ${movieId};`;
  const moviedetails = await db.get(getQuery);
  response.send(convertDbObjectToResponseObject(moviedetails));
});

//API4 UPDATE DETAILS OF A PARTICULAR MOVIE
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addQuery = `UPDATE
            movie
        SET
            director_id = '${directorId}',
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE
            movie_id = ${movieId};`;
  await db.run(addQuery);
  response.send("Movie Details Updated");
});

//API5 DELETE A PARTICULAR MOVIE
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE
            FROM 
                movie
            WHERE
                movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API6 GET DIRECTOR TABLE DETAILS
app.get("/directors/", async (request, response) => {
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      directorId: dbObject.director_id,
      directorName: dbObject.director_name,
    };
  };
  const getDetailsQuery = `SELECT
            *
            FROM
                director;`;
  const movieDetails = await db.all(getDetailsQuery);
  response.send(
    movieDetails.map((eachDirector) =>
      convertDbObjectToResponseObject(eachDirector)
    )
  );
});

//API7 GET ALL MOVIES DIRECTED BY A PARTICULAR DIRECTOR
app.get("/directors/:directorId/movies/", async (request, response) => {
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    };
  };
  const { directorId } = request.params;
  const getQuery = `SELECT
            *
        FROM
            movie
        WHERE 
            director_id = ${directorId};`;
  const moviesArray = await db.all(getQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

module.exports = app;
