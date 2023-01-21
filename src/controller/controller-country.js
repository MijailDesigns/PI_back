const axios = require('axios');
const { Country } = require('../db');
const urlCountry = 'https://restcountries.com/v3/all';

async function getCountriesFromApi() {
    try {
        const isSaved = await Country.findAll();
        if (isSaved.length === 0) {
            const fromApi = (await axios(urlCountry)).data.map(el => ({
                id: el.cca3,
                name: el.name.common,
                flag: el.flags[0],
                continent: el.continents[0],
                capital: el.capital !== undefined ? el.capital[0] : 'No se encontro la capital',
                subregion: el.subregion, 
                area: el.area,
                population: el.population
            }))
            await Country.bulkCreate(fromApi);
            console.log('paises guardados en DB')
        }
        console.log('paises en DB')
        
    } catch (error) {
        console.log(error, 'no se encontro alguno de los datos en la api')
    }
}

module.exports = {getCountriesFromApi};
