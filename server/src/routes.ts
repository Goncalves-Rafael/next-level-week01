import express from 'express';
import knex from './database/connection'
import multer from 'multer';
import { celebrate, Joi } from 'celebrate';


import multerConfig from './configs/multer'
import PointController from './controllers/PointController'

const pointController = new PointController();
const routes = express.Router();
const upload = multer(multerConfig);

routes.get('/item', async (request, response) => {
  const itens = await knex('item').select('*');
  const serializedItens = itens.map(item => {
    return {
      id: item.id,
      title: item.title,
      image_url: `http://192.168.100.135:8080/uploads/${item.image}`
    }
  })

  return response.json(serializedItens);
})

routes.get('/point', pointController.index);
routes.get('/point/:id', pointController.show);
routes.post(
  '/point', 
  upload.single('image'), 
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      itens: Joi.string().required(),
    })
  }, {
    abortEarly: false
  }),
  pointController.create);

export default routes;
