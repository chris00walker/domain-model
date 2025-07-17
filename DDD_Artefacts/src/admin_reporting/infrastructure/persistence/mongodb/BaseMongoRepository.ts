import { MongoClient, Collection, ObjectId } from 'mongodb';
import { AggregateRoot } from '../../../../../shared/domain/AggregateRoot';
import { UniqueEntityID } from '../../../../../shared/domain/UniqueEntityID';

/**
 * Base MongoDB repository with common operations for all repositories
 */
export abstract class BaseMongoRepository<T extends AggregateRoot<any>> {
  protected collection: Collection;
  
  constructor(
    protected readonly client: MongoClient,
    protected readonly dbName: string,
    protected readonly collectionName: string
  ) {
    this.collection = client.db(dbName).collection(collectionName);
  }

  /**
   * Maps a domain entity to a MongoDB document
   * @param entity Domain entity
   */
  protected abstract toPersistence(entity: T): any;

  /**
   * Maps a MongoDB document to a domain entity
   * @param record MongoDB document
   */
  protected abstract toDomain(record: any): T;

  /**
   * Saves an entity to the database (create or update)
   */
  async save(entity: T): Promise<void> {
    const persistenceData = this.toPersistence(entity);
    
    // Use entity ID as MongoDB _id
    const mongoId = new ObjectId(entity.id);
    
    await this.collection.updateOne(
      { _id: mongoId },
      { $set: persistenceData },
      { upsert: true }
    );
  }

  /**
   * Finds an entity by ID
   */
  async findById(id: UniqueEntityID): Promise<T | null> {
    try {
      const mongoId = new ObjectId(id.toString());
      const record = await this.collection.findOne({ _id: mongoId });
      
      if (!record) {
        return null;
      }
      
      return this.toDomain(record);
    } catch (err) {
      console.error(`Error finding entity by id: ${err}`);
      return null;
    }
  }

  /**
   * Deletes an entity by ID
   */
  async delete(id: UniqueEntityID): Promise<boolean> {
    try {
      const mongoId = new ObjectId(id.toString());
      const result = await this.collection.deleteOne({ _id: mongoId });
      return result.deletedCount > 0;
    } catch (err) {
      console.error(`Error deleting entity: ${err}`);
      return false;
    }
  }

  /**
   * Checks if an entity with the given ID exists
   */
  async exists(id: UniqueEntityID): Promise<boolean> {
    try {
      const mongoId = new ObjectId(id.toString());
      const count = await this.collection.countDocuments({ _id: mongoId }, { limit: 1 });
      return count > 0;
    } catch (err) {
      console.error(`Error checking entity existence: ${err}`);
      return false;
    }
  }
}
