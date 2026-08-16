// src/lib/igdb/auth.ts

export async function getIGDBAccessToken(): Promise<string> {

    const accessToken = process.env.IGDB_ACCESS_TOKEN?.trim();

    if (!accessToken) {
        throw new Error(
            "IGDB_ACCESS_TOKEN is not defined in environment variables"
        );
    }

    return accessToken;

}