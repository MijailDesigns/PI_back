const { Router } = require('express');
const { Op } = require('sequelize');
const { Country, Activity } = require('../db')
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

// [ ] GET /countries:
// En una primera instancia deberán traer todos los países desde restcountries y guardarlos en su propia base de datos y luego ya utilizarlos desde allí (Debe retonar sólo los datos necesarios para la ruta principal)
// Obtener un listado de los paises.

// [ ] GET /countries?name="...":
// Obtener los países que coincidan con el nombre pasado como query parameter (No necesariamente tiene que ser una matcheo exacto)
// Si no existe ningún país mostrar un mensaje adecuado

router.get('/countries', async(req, res) => {
    try {
        const {name, continent, activity} = req.query;
        const condition = {};
        const whereC = {};
        let where = {};
        if (name) {
                whereC.name = {[Op.iLike]: `%${name}%`}
            }
        if (continent) {
            whereC.continent = {[Op.iLike]: continent};
        }
        
        condition.where= whereC;

        if (activity) {
            where.name = activity;
            const countries = await Country.findAll({...condition, 
                include: {
                  model: Activity,
                  where: where,
                  attributes: ['id', 'name', 'difficulty', 'duration', 'season'],
                  through: {attributes: []}
                }
              });
            return res.status(200).json(countries);
        }
        const countries = await Country.findAll({...condition, 
            include: {
              model: Activity,
            //   where: where,
              attributes: ['id', 'name', 'difficulty', 'duration', 'season'],
              through: {attributes: []}
            }
          });
        res.status(200).json(countries);
    } catch (error) {
        console.log(error);
        res.status(400).json('No se encontro informacion de acuerdo a los datos ingresados');
    }
});


// [ ] GET /countries/{idPais}:
// Obtener el detalle de un país en particular
// Debe traer solo los datos pedidos en la ruta de detalle de país
// Incluir los datos de las actividades turísticas correspondientes

router.get('/countries/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const country = await Country.findOne({
            where: {
                id: id
            }, 
            include:{
                model: Activity,
                attributes: ['id','name','difficulty','duration','season'],
                through: { attributes: [] },
            }});
        res.status(200).json(country);
    } catch (error) {
        console.log(error);
        res.status(400).json('Se ingreso un id inexistente');
    }
});




router.get('/activities', async(req, res) => {
    try {
        const {name} = req.query;
        const condition = {};
        const where = {};
        if (name) {
                where.name = {[Op.iLike]: `%${name}%`}
            }
        const activities = await Activity.findAll({...condition, 
            include: {
              model: Country,
              attributes: ['name'],
              through: {attributes: []}
            }}
          );
        res.status(200).json(activities);
    } catch (error) {
        res.status(400).json('Ha ocurrido el error', error);
    }
})

router.get('/activities/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const activity = await Activity.findOne({
            where: {
                id: id
            }, 
            include:{
                model: Country,
                attributes: ['name'],
                through: { attributes: [] },
            }});
        res.status(200).json(activity);
    } catch (error) {
        console.log(error);
        res.status(400).json('Se ingreso un id inexistente');
    }
});

// [ ] POST /activities:
// Recibe los datos recolectados desde el formulario controlado de la ruta de creación de actividad turística por body
// Crea una actividad turística en la base de datos, relacionada con los países correspondientes

router.post('/activities', async(req, res) => {
    try {
        const {name, difficulty, duration, season, country} = req.body;
        const newActivity = await Activity.create({name, difficulty, duration, season});
        countryOfActivity = await Country.findAll({
            where:{name: country}
        });
        await newActivity.addCountry(countryOfActivity);        
        res.status(200).json('Actividad creada');
    } catch (error) {
        console.log(error);
        res.status(400).json('No se pudo crear la actividad ya que faltan datos necesarios')
    }
});

router.delete('/activities/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const activityToDelete = await Activity.findByPk(id);
        if (activityToDelete === null) {
            return res.json(`No existen la actividad con id: ${id}`)
        }
        await Activity.destroy({
            where: {
            id: id
            }
            });
        res.json(`Se ha eliminado la actividad ${activityToDelete.name}`)
    } catch (error) {
        res.status(400).json('Ha ocurrido un error')
    }
});

router.put('/activities/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const {name, difficulty, duration, season, country} = req.body;
        // const activityToUpdate = await Activity.findOne({
        //     where: {id: id}
        // });

        await Activity.update(
        {
            name,
            difficulty,
            duration,
            season,
        },
        {
            where: {
                id
            }
        }
    );
        const countryOfActivity = await Country.findAll({
            where:{name: country}
        });
        const activityToUpdate = await Activity.findOne({
            where: {id: id}
        });
        //await activityToUpdate.setCountrys(countryOfActivity);
        await activityToUpdate.setCountries(countryOfActivity);
        //res.status(200).json(activityToUpdate)
        res.status(200).json('ok')

    } catch (error) {
        console.log(error)
        res.status(400).json('ocurrio un error');
    }
 })

module.exports = router;
