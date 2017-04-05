import * as Config from "../../config/config";

import * as harvester from "./roles/harvester";
import * as upgrader from "./roles/upgrader";

import { log } from "../../lib/logger/log";


export class CreepManager {
  /**
   *
   */
  constructor(
    public creeps: Creep[] = [],
    public creepCount: number = 0,
    public harvesters: Creep[] = [],
    public upgraders: Creep[] = []
  ) {  }
  /**
   * Initialization scripts for CreepManager module.
   *
   * @export
   * @param {Room} room
   */
  public run(room: Room): void {
    this._loadCreeps(room);
    this._buildMissingCreeps(room);

    _.each(this.creeps, (creep: Creep) => {
      if (creep.memory.role === "harvester") {
        harvester.run(creep);
      }
      if (creep.memory.role === "upgrader") {
        upgrader.run(creep);
      }
    });
  }

  /**
   * Loads and counts all available creeps.
   *
   * @param {Room} room
   */
  private _loadCreeps(room: Room) {
    this.creeps = room.find<Creep>(FIND_MY_CREEPS);
    this.creepCount = _.size(this.creeps);

    // Iterate through each creep and push them into the role array.
    this.harvesters = _.filter(this.creeps, (creep) => creep.memory.role === "harvester");
    this.upgraders = _.filter(this.creeps, (creep) => creep.memory.role === "upgrader");

    if (Config.ENABLE_DEBUG_MODE) {
      log.info(this.creepCount + " creeps found in the playground.");
    }
  }

  /**
   * Creates a new creep if we still have enough space.
   *
   * @param {Room} room
   */
  private _buildMissingCreeps(room: Room) {

    let spawns: Spawn[] = room.find<Spawn>(FIND_MY_SPAWNS, {
      filter: (spawn: Spawn) => {
        return spawn.spawning === null;
      },
    });

    if (Config.ENABLE_DEBUG_MODE) {
      if (spawns[0]) {
        log.info("Spawn: " + spawns[0].name);
      }
    }

    this._spawnRole("harvester", 2, this.harvesters, room, spawns);
    this._spawnRole("upgrader", 1, this.upgraders, room, spawns);

  }

  private _spawnRole(roleName: string, maxCount: number, creeps: Creep[], room: Room, spawns: StructureSpawn[]) {
    let bodyParts: string[];
    if (creeps.length < maxCount) {
      if (creeps.length < 1 || room.energyCapacityAvailable <= 800) {
        bodyParts = [WORK, WORK, CARRY, MOVE];
      } else if (room.energyCapacityAvailable > 800) {
        bodyParts = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
      }

      _.each(spawns, (spawn: Spawn) => {
        this._spawnCreep(spawn, bodyParts, roleName);
      });
    }
  }

  /**
   * Spawns a new creep.
   *
   * @param {Spawn} spawn
   * @param {string[]} bodyParts
   * @param {string} role
   * @returns
   */
  private _spawnCreep(spawn: Spawn, bodyParts: string[], role: string) {
    let uuid: number = Memory.uuid;
    let status: number | string = spawn.canCreateCreep(bodyParts, undefined);

    let properties: { [key: string]: any } = {
      role,
      room: spawn.room.name,
    };

    status = _.isString(status) ? OK : status;
    if (status === OK) {
      Memory.uuid = uuid + 1;
      let creepName: string = spawn.room.name + " - " + role + uuid;

      log.info("Started creating new creep: " + creepName);
      if (Config.ENABLE_DEBUG_MODE) {
        log.info("Body: " + bodyParts);
      }

      status = spawn.createCreep(bodyParts, creepName, properties);

      return _.isString(status) ? OK : status;
    } else {
      if (Config.ENABLE_DEBUG_MODE) {
        log.info("Failed creating new creep: " + status);
      }

      return status;
    }
  }

}
