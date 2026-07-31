const heros = ["spiderman", "thor", "ironman"]

heros.map( (hero): string => {
    return `hero is ${hero}`
})

function consoleError(errmsg: string): void{
    console.log(errmsg);

}

function handleError(errmsg: string): never{
  throw new Error(errmsg);
}