// Import sequelize module
import { Sequelize } from 'sequelize'

// Load environment variables
import dotenv from 'dotenv'

dotenv.config();

// Initialize Sequelize with MySQL database credentials
console.log('environment: ', process.env.DB_NAME)
export const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'mysql',
    logging: false,
  }
)

// Make a connection with database
export const connectToDB = async () => {
  try {
    console.log('Trying to connect to the database...')
    if (!sequelize) {
      throw new Error('Cannot connect to DB, sequelize instance is null.')
    }
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    if (error instanceof Error) {
      console.error('Unable to connect to the database:', error.message)
    } else {
      console.error(
        'An unknown error occurred while trying to connect to the database.'
      )
    }
  }
}

// Close the connection with database
export const closeDb = async () => {
  try {
    await sequelize.close()
    console.log('Connection has been closed successfully.')
  } catch (error) {
    if (error instanceof Error) {
      console.error('Unable to connect to the database:', error.message)
    } else {
      console.error(
        'An unknown error occurred while trying to close the database connection.'
      )
    }
  }
};
