import {getIGDBAccessToken} from "./auth";

const IGDB_BASE_URL = "https://api.igdb.com/v4";

export async function igdbRequest<T>(
    endpoint:string,
    query:string,
):Promise<T> {

    const clientId = process.env.TWITCH_CLIENT_ID;
    
    if(!clientId) {
        throw new Error("Missing TWITCH_CLIENT_ID in environment variables.");
    }

    const token = await getIGDBAccessToken();

     const response =
    await fetch(
      `${IGDB_BASE_URL}/${endpoint}`,
      {

        method:"POST",

        headers:{
          "Client-ID":clientId,

          "Authorization":
            `Bearer ${token}`,

          "Content-Type":
            "text/plain",
        },


        body:query,

        // Important for server requests
        cache:"no-store",
      }
    );

    if(response.status === 401) {
        throw new Error("Unauthorized: Invalid or expired access token.");
    }
    if(!response.ok) {
        throw new Error(`Failed to fetch IGDB data: ${response.statusText}`);
    }
    return response.json();
}

