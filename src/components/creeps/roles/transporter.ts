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
    let existingTargetContainer = creep.memory.existingTargetContainer;
    let spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];

    if(existingTargetContainer) {
      this.logger.debug("using existing container " + existingTargetContainer);
      targetContainer = Game.getObjectById(existingTargetContainer) as StructureContainer;
    }

    if (creepActions.needsRenew(creep) && _.sum(creep.carry) == 0) {
      creepActions.moveToRenew(creep, spawn);
    }
    if (_.sum(creep.carry) == creep.carryCapacity) {
      this.moveToDropEnergy(creep, this.determineDropOff(creep));
      //this.logger.debug("dropping off");

      if(_.sum(creep.carry) < creep.carryCapacity) {
        creep.memory.destination = null;
      }
    }
    if (_.sum(creep.carry) < creep.carryCapacity && (targetContainer)) {
      //this.logger.debug("picking up");
      this.moveToWithdrawFromContainer(creep, targetContainer);

      if(_.sum(creep.carry) == creep.carryCapacity) {
        creep.memory.existingTargetContainer = null;
      }
      else {
        creep.memory.existingTargetContainer = targetContainer.id;
      }
    }
  }

  private determineDropOff(creep: Creep): Structure {
    let spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
    let destination = creep.memory.dropOffDestination;

    if(destination) {
      this.logger.debug("using existing destination " + destination);
      return Game.getObjectById(destination) as Structure;
    }

    let structure = creep.room.find<StructureExtension>(FIND_STRUCTURES, {
      filter: (structure: StructureExtension) => {
        return (structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity)
      }
    })[0];

    if (structure) {
      creep.memory.dropOffDestination = structure.id;
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
          creep.memory.dropOffDestination = upgradeContainer.id;
          return upgradeContainer;
        }
      }
    }
    return spawn;
  }

}
