
export const getIntranetAuthorizeUrl = () => {
    const url = new URL('https://api.intra.42.fr/oauth/authorize');
    const { searchParams } = url;

    /* TODO put the client id in a config file */
    searchParams.append('client_id', 'u-s4t2ud-328a99f36da9fbaa8ec156076618694cbe85f30b9e5385166d942c6aac57ae16');
    searchParams.append('redirect_uri', 'http://localhost:5173/auth/callback');
    searchParams.append('response_type', 'code');

    return url.href;
};
