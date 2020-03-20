import { Service } from 'purple-cheetah';
import { KeyService } from './key.service';
import { Key } from './models/key.model';
import { Types } from 'mongoose';

/**
 * Used for cashing Keys in memory.
 */
export class KeyCashService {
  /** Service that handle Keys in MongoDB. */
  @Service(KeyService)
  private static keyService: KeyService;
  /** Array that holds mirror Keys from MongoDB. */
  private static keys: Key[] = [];

  /** Pulls all Keys from database and stores them in memory. */
  public static async init() {
    KeyCashService.keys = await KeyCashService.keyService.findAll();
  }

  /** Returns all Keys from the cash. */
  public static findAll(): Key[] {
    return JSON.parse(JSON.stringify(KeyCashService.keys));
  }

  /** Returns a single Key from the cash. */
  // tslint:disable-next-line:variable-name
  public static findById(_id: string): Key | null {
    const key = KeyCashService.keys.find(e => e._id.toHexString() === _id);
    return key ? key : null;
  }

  /** Adds a Key to the cash and to the database. */
  public static async add(key: Key): Promise<boolean> {
    key._id = new Types.ObjectId();
    key.createdAt = Date.now();
    key.updatedAt = Date.now();
    const result = await KeyCashService.keyService.add(key);
    if (result === false) {
      return false;
    }
    KeyCashService.keys.push(key);
    return true;
  }

  /** Updates a Key in the cash and the database. */
  public static async update(key: Key): Promise<boolean> {
    const result = await KeyCashService.keyService.updateNew(key);
    if (result === false) {
      return false;
    }
    KeyCashService.keys.forEach(e => {
      if (e._id.toHexString() === key._id.toHexString()) {
        e = JSON.parse(JSON.stringify(key));
      }
    });
    return true;
  }

  /** Removes a Key from the cash and the database. */
  // tslint:disable-next-line:variable-name
  public static async deleteById(_id: string): Promise<boolean> {
    const result = await KeyCashService.keyService.deleteById(_id);
    if (result === false) {
      return false;
    }
    KeyCashService.keys = KeyCashService.keys.filter(
      e => e._id.toHexString() !== _id,
    );
    return true;
  }
}
