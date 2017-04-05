import { BaseWorker } from "./baseWorker";
import * as creepActions from "../creepActions";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export class Transporter extends BaseWorker {
  public run(creep: Creep): void {
    let targetContainer = this.determineContainer(creep);
    let spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];

    if (creepActions.needsRenew(creep) && _.sum(creep.carry) == 0) {
      creepActions.moveToRenew(creep, spawn);
    }
    if (_.sum(creep.carry) == creep.carryCapacity) {
      this.moveToDropEnergy(creep, this.determineDropOff(creep));
      //this.logger.debug("dropping off");
    }
    if (_.sum(creep.carry) < creep.carryCapacity && targetContainer) {
      //this.logger.debug("picking up");
      this.moveToWithdrawFromContainer(creep, targetContainer);
    }
  }

  private determineDropOff(creep: Creep): Structure {
    let spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
    let structure = creep.room.find<StructureExtension>(FIND_STRUCTURES, {
      filter: (structure: StructureExtension) => {
        return (structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity)
      }
    })[0];

    if (structure) {
      return structure;
    }

    if (spawn.energy == spawn.energyCapacity) {
      let controller = creep.room.controller;
      if (controller) {
        let upgradeContainer = (controller as StructureController).pos.findClosestByRange<Structure>(FIND_STRUCTURES, {
          filter: (structure: StructureContainer) => {
            return (structure.structureType == STRUCTURE_CONTAINER);
          }
        });
        if (upgradeContainer) {
          return upgradeContainer;
        }
      }
    }
    return spawn;
  }

}
