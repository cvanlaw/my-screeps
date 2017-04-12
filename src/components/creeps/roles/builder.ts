import * as creepActions from "../creepActions";
import * as BaseWorker from "./baseWorker";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export class Builder extends BaseWorker.BaseWorker {
  constructor() { super(); }
  public run(creep: Creep): void {
    let spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
    let energySource = creep.room.find<Source>(FIND_SOURCES_ACTIVE)[0];
    let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    let existingTarget = Game.getObjectById(creep.memory.buildingId) as ConstructionSite;

    if (creep.memory.building && creep.carry.energy == 0) {
      creep.memory.building = false;
      creep.say('harvest');
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
      creep.say('build');
    }

    if (creep.memory.building) {
      if (targets && targets.keys) {
        if (targets.length) {
          let target: ConstructionSite = targets[0] as ConstructionSite;

          if (existingTarget) {
            target = existingTarget;
          }
          if (creep.build(target as ConstructionSite) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target as ConstructionSite);
            creep.memory.buildingId = target.id;
          }
        }
        else {
          let repairTarget = creep.pos.findClosestByRange<Structure>(FIND_STRUCTURES, {
            filter: (structure: Structure) => {
              return ((structure.structureType === STRUCTURE_WALL && structure.hits < structure.hitsMax && structure.hits < 10000) || (structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL));
            }
          });

          if (repairTarget) {
            let status = creep.repair(repairTarget);
            //this.logger.debug("repair status: " + status);

            if (status === ERR_NOT_IN_RANGE) {
              creep.moveTo(repairTarget);
            }
          }
        }
      }

    }

    else {
      if (creepActions.needsRenew(creep) && _.sum(creep.carry) == 0) {
        creepActions.moveToRenew(creep, spawn);
      } else if (_.sum(creep.carry) === creep.carryCapacity) {
        this.moveToDropEnergy(creep, spawn);
      } else {
        let container = this.determineContainer(creep);
        if (container) {
          // this.logger.debug("builder withdrawing from container.")
          this.moveToWithdrawFromContainer(creep, container);
        }
        else {
          this.moveToHarvest(creep, energySource);
        }
      }
    }
  }
}
