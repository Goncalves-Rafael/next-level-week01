import { Request, Response } from 'express';
import knex from '../database/connection'

class PointController {
  async index (request: Request, response: Response) {
      const { uf, city, items } = request.query;
      const idItems = items ? String(items).split(',').map(el => Number(el.trim())) : [];
      const points = await knex('point')
        .join('point_item', 'point.id', '=', 'point_item.point_id')
        .join('item', 'item.id', '=', 'point_item.item_id')
        .where('point.uf', 'like', `${String(uf || '').trim().toLowerCase()}%`)
        .where('point.city', 'like', `${String(city || '').trim().toLowerCase()}%`)
        .where((builder) =>
          idItems.length > 0 ? builder.whereIn('item.id', idItems) : true
        )
        // .whereIn('item.id', idItems)
        .distinct()
        .select('point.*');

      const serializedItens = points.map(point => {
        return {
          ...point,
          image_url: `http://192.168.100.135:8080/uploads/${point.image}`
        }
      })

      return response.json(serializedItens);
  }

  async show (request: Request, response: Response) {
    const { id } = request.params;
    const points = await knex('point').where('id', Number(id));

    const items = await knex('item')
      .join('point_item', 'item.id', '=', 'point_item.item_id')
      .where('point_item.point_id', id)
      .select('item.id', 'item.title')
    
    const serializedItens = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.100.135:8080/uploads/${point.image}`
      }
    })

    return response.json({
      point: points[0],
      items
    })
  }
  async create (request: Request, response: Response) {
    const { name,
    email,
    whatsapp,
    city,
    uf,
    latitude,
    longitude,
    itens } = request.body;

    const trx = await knex.transaction();

    const point = {
      name,
      email,
      whatsapp,
      city,
      uf,
      latitude,
      longitude,
      itens
    };

    const insertedIds = await trx('point').insert({
      image: request.file.filename,
      name,
      email,
      whatsapp,
      city,
      uf,
      latitude,
      longitude
    });

    const pointId = insertedIds[0];
    const pointItems = itens.split(',').map((item: string) => Number(item.trim())).map((item_id: number) => {
      return {
        item_id,
        point_id: pointId
      }
    });

    await trx('point_item').insert(pointItems);
    await trx.commit();
    return response.json({
      id: pointId,
      ...point
    })
  }
}

export default PointController;
