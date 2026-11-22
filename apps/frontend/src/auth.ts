const TOKEN='token';

export const isSignedIn=()=>{
    const token=localStorage.getItem(TOKEN);
    if(!token) return false;

    try{
        const payload=token.split('.')[1].replace(/-/g, "+").replace(/_/g, "/");
        const {expired}=JSON.parse(atob(payload));

        return !expired || expired * 1000 > Date.now(); 
    }
    catch(err){
        return false;
    }
}