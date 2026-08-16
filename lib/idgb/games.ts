// src/lib/igdb/games.ts


import { igdbRequest } from "./client";



export interface IGDBGame {

  id:number;

  name:string;

  slug?:string;

  summary?:string;


  first_release_date?:number;


  rating?:number;

  rating_count?:number;


  cover?:{
    url:string;
  };


  genres?:{
    id:number;
    name:string;
  }[];


  platforms?:{
    id:number;
    name:string;
  }[];
}




export function normalizeImage(
  url?:string
){

  if(!url)
    return null;


  if(url.startsWith("//")){
    return `https:${url}`;
  }


  return url;
}





export async function searchGames(
  search:string
){

  const query = `

    fields
      id,
      name,
      slug,
      summary,
      first_release_date,
      rating,
      rating_count,
      cover.url,
      genres.id,
      genres.name,
      platforms.id,
      platforms.name;

    search "${search}";

    limit 10;

  `;



  const games =
    await igdbRequest<IGDBGame[]>(
      "games",
      query
    );



  return games.map((game: IGDBGame) => ({

    igdbId:game.id,

    name:game.name,

    slug:game.slug ?? null,

    summary:
      game.summary ?? null,


    coverUrl:
      normalizeImage(
        game.cover?.url
      ),


    releaseDate:
      game.first_release_date
      ?
      new Date(
        game.first_release_date * 1000
      )
      :
      null,


    rating:
      game.rating ?? null,


    ratingCount:
      game.rating_count ?? null,


    genres:
      game.genres ?? [],


    platforms:
      game.platforms ?? [],

  }));

}






export async function getGameByIGDBId(
  id:number
){

  const query = `

    fields
      id,
      name,
      slug,
      summary,
      first_release_date,
      rating,
      rating_count,
      cover.url,
      genres.id,
      genres.name,
      platforms.id,
      platforms.name;


    where id = ${id};

  `;



  const games =
    await igdbRequest<IGDBGame[]>(
      "games",
      query
    );


  if(!games.length)
    return null;


  return games[0];

}