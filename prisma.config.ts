import 'dotenv/config'; //carga las variables de entorno desde el archivo .env
import { defineConfig } from 'prisma/config'; //herramienta para definir la configuración

export default defineConfig({
  //Ubicación del archivo de esquema de Prisma
  schema: 'prisma/schema.prisma',

  //carpeta donde prisma guardará las migraciones
  migrations: {
    path: 'prisma/migrations',
  },

  //Dirección de la base de datos, obtenida de las variables de entorno
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
