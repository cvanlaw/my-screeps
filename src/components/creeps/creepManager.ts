import * as Config from "../../config/config";

import { Harvester } from "./roles/harvester";
import { Upgrader } from "./roles/upgrader";
import { Builder } from "./roles/builder";
import { Transporter } from "./roles/transporter";

import { log } from "../../lib/logger/log";


export class CreepManager {
  /**
   *
   */
  constructor(
    public creeps: Creep[] = [],
    public creepCount: number = 0,
    public harvesters: Creep[] = [],
    public upgraders: Creep[] = [],
    public builders: Creep[] = [],
    public transporters: Creep[] = [],
    public harvester: Harvester = new Harvester(),
    public transporter: Transporter = new Transporter(),
    public upgrader: Upgrader = new Upgrader(),
    public builder: Builder = new Builder()
  ) { }
  /**
   * Initialization scripts for CreepManager module.
   *
   * @export
   * @param {Room} room
   */
  public run(room: Room): void {
    this.loadCreeps(room);
    this.buildMissingCreeps(room);

    _.each(this.creeps, (creep: Creep) => {
      if (creep.memory.role === "harvester") {
        this.harvester.run(creep);
      }
      if (creep.memory.role === "upgrader") {
        this.upgrader.run(creep);
      }
      if (creep.memory.role === "builder") {
        this.builder.run(creep);
      }
      if (creep.memory.role === "transporter") {
        this.transporter.run(creep);
      }
    });
  }

  /**
   * Loads and counts all available creeps.
   *
   * @param {Room} room
   */
  private loadCreeps(room: Room) {
    this.creeps = room.find<Creep>(FIND_MY_CREEPS);
    this.creepCount = _.size(this.creeps);

    // Iterate through each creep and push them into the role array.
    this.harvesters = _.filter(this.creeps, (creep) => creep.memory.role === "harvester");
    this.upgraders = _.filter(this.creeps, (creep) => creep.memory.role === "upgrader");
    this.builders = _.filter(this.creeps, (creep) => creep.memory.role === "builder");
    this.transporters = _.filter(this.creeps, (creep) => creep.memory.role === "transporter");

    if (Config.ENABLE_DEBUG_MODE) {
      log.info(this.creepCount + " creeps found in the playground.");
    }
  }

  /**
   * Creates a new creep if we still have enough space.
   *
   * @param {Room} room
   */
  private buildMissingCreeps(room: Room) {

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

    this.spawnRole("transporter", 3, this.transporters, room, spawns);
    this.spawnRole("harvester", 6, this.harvesters, room, spawns);
    this.spawnRole("upgrader", 6, this.upgraders, room, spawns);
    this.spawnRole("builder", 3, this.builders, room, spawns);
  }

  private spawnRole(roleName: string, maxCount: number, creeps: Creep[], room: Room, spawns: StructureSpawn[]) {
    let bodyParts: string[];
    if (creeps.length < maxCount) {
      if (roleName === "transporter") {
        bodyParts = [CARRY, CARRY, MOVE, MOVE];
      }
      else if (creeps.length < 1 || room.energyAvailable <= 800) {
        bodyParts = [WORK, WORK, CARRY, MOVE];
      }
      else if (room.energyAvailable > 800) {
        bodyParts = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE];
      }

      _.each(spawns, (spawn: Spawn) => {
        this.spawnCreep(spawn, bodyParts, roleName);
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
  private spawnCreep(spawn: Spawn, bodyParts: string[], role: string) {
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
