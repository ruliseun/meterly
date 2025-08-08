import { In } from "typeorm";
import { AppDataSource } from "../../data-source";
import { PAGINATION } from "../../config/constants";

class AbstractService {
  public async createData(repo: any, data: { [key: string]: unknown }) {
    const repository = AppDataSource.getRepository(repo);

    const instantiateModel = new repo();

    for (const key in data) {
      instantiateModel[key] = data[key];
    }

    const newData = await repository.save(instantiateModel);

    return newData;
  }

  public async createMany(repo: any, data: { [key: string]: unknown }[]) {
    const repository = AppDataSource.getRepository(repo);
    const newData = await repository.insert(data);
    return newData;
  }

  public async getAllData(repo: any, query?: { [key: string]: unknown }) {
    const repository = AppDataSource.getRepository(repo);
    return await repository.find(query);
  }

  public async getUniqueData(repo: any, data: { [key: string]: unknown }) {
    const repository = AppDataSource.getRepository(repo);
    return await repository.findOneBy(data);
  }

  public async findMultipleIds(repo: any, ids: number[]) {
    const repository = AppDataSource.getRepository(repo);
    return await repository.findBy({ id: In(ids) });
  }

  public async findMultipleEmails(repo: any, emails: string[]) {
    const repository = AppDataSource.getRepository(repo);
    return await repository.findBy({ email: In(emails) });
  }

  public async findByEntries(repo: any, query: { [key: string]: unknown }[]) {
    const repository = AppDataSource.getRepository(repo);
    return await repository.findOne({
      where: query,
    });
  }

  public async removeData(repo: any, data: { [key: string]: unknown }) {
    const repository = AppDataSource.getRepository(repo);
    const dataToRemove = await repository.findOneBy(data);
    if (!dataToRemove) return;
    return await repository.remove(dataToRemove as any);
  }

  public async deleteAllRecords(repo: any, query: { [key: string]: unknown }) {
    const repository = AppDataSource.getRepository(repo);
    const dataToRemove = await repository.findBy(query);

    if (!dataToRemove.length) return;

    return await repository.remove(dataToRemove);
  }

  public async dropEntity(repo: any, data: { [key: string]: unknown }) {
    const repository = AppDataSource.getRepository(repo);
    return await repository.delete(data);
  }

  public async updateById(repo: any, id: number, data: { [key: string]: unknown }) {
    const repository = AppDataSource.getRepository(repo);
    return await repository.update(id, data);
  }

  public async updateByEntry(repo: any, query: { [key: string]: unknown }, data: { [key: string]: unknown }) {
    const repository = AppDataSource.getRepository(repo);
    return await repository.update(query, data);
  }

  public async findPaginatedRecords(repo: any, page: number, data: { [key: string]: unknown }) {
    const skip = (page - 1) * PAGINATION;
    const repository = AppDataSource.getRepository(repo);
    return await repository.findAndCount({
      ...data,
      skip,
      take: PAGINATION,
    });
  }

  public async findAndPopulate(repo: any, query: { [key: string]: unknown }, relations: string[]) {
    const repository = AppDataSource.getRepository(repo);
    return repository.findOne({
      where: query,
      relations: relations,
    });
  }

  public async findMultipleIdsAndPopulate(repo: any, ids: number[], relations: string[]) {
    const repository = AppDataSource.getRepository(repo);
    return await repository.find({
      where: { id: In(ids) },
      relations: relations,
    });
  }

  public async initiateCascadeDelete(repo: any, relations: { [key: string]: any }, query: { [key: string]: unknown }) {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      for (const relationName in relations) {
        const relationEntity = relations[relationName];
        const repository = transactionalEntityManager.getRepository(relationEntity);
        await repository.delete(query);
      }
    });

    const repository = AppDataSource.getRepository(repo);
    Object.keys(query).forEach(async (key) => {
      await repository.delete({ id: query[key] });
    });
    return;
  }
}

export function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as any).httpStatusCode = statusCode;
  return error;
}

const ABSTRACT_SERVICE = new AbstractService();
export default ABSTRACT_SERVICE;
