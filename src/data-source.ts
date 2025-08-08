import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { RefreshToken } from "./entity/Token";
import {
  databaseHost,
  databaseName,
  databasePassword,
  databasePort,
  databaseUser,
  localDatabasePassword,
  localDatabaseUserName,
  nodeEnv,
} from "./config/env";
import { Environments } from "./enums/env.enum";

interface IDbConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

const dbEntities = [
  User,
  RefreshToken,
];

let dbConfig: IDbConfig = {} as IDbConfig;

switch (nodeEnv) {
  case Environments.LOCAL:
    dbConfig.host = "localhost";
    dbConfig.port = 5432;
    dbConfig.username = localDatabaseUserName!;
    dbConfig.password = localDatabasePassword!;
    dbConfig.database = "postgres";
    break;
  case Environments.DEVELOPMENT:
  case Environments.PRODUCTION:
    dbConfig.host = databaseHost!;
    dbConfig.port = +databasePort!;
    dbConfig.username = databaseUser!;
    dbConfig.password = databasePassword!;
    dbConfig.database = databaseName!;
    break;
  default:
    dbConfig.host = "localhost";
    dbConfig.port = 5432;
    dbConfig.username = localDatabaseUserName!;
    dbConfig.password = localDatabasePassword!;
    dbConfig.database = "postgres";
    break;
}

export const AppDataSource = new DataSource({
  type: "postgres",
  ...dbConfig,
  logging: false,
  entities: dbEntities,
  dropSchema: false,
  synchronize: nodeEnv === Environments.LOCAL ? true : false,
  migrations: nodeEnv === Environments.LOCAL ? ["dist/migration/**/*.js"] : ["dist/migration/**/*.js"],
  subscribers: nodeEnv === Environments.LOCAL ? ["src/subscriber/**/*.js"] : ["dist/subscriber/**/*.js"],
  migrationsRun: false,
});
