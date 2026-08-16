import { searchGames } from "@/lib/idgb/games";


export async function GET(){

 const games =
   await searchGames(
    "elden ring"
   );


 return Response.json(
   games
 );

}