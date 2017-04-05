import {BaseWorker} from "./baseWorker";
import { log } from "../../../lib/logger/log";
/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export class Transporter extends BaseWorker{
  public run(creep: Creep): void {
    let targetContainer = this.determineContainer(creep);

    if(_.sum(creep.carry) == creep.carryCapacity) {
      this.moveToDropEnergy(creep, this.determineDropOff(creep));
    }
    if (_.sum(creep.carry) < creep.carryCapacity && targetContainer) {
      if (creep.withdraw(targetContainer, RESOURCE_ENERGY, creep.carryCapacity - _.sum(creep.carry)) == ERR_NOT_IN_RANGE)
        creep.moveTo(targetContainer);
    }
  }

  private determineContainer(creep: Creep): StructureContainer | null {
    let containers = creep.room.find<StructureContainer>(FIND_STRUCTURES, {
      filter: (structure: StructureContainer) => {
        return (structure.structureType == STRUCTURE_CONTAINER);
      }
    });

    if (!containers) {
      log.error("No containers");
      return null;
    }

    let containerId = "";
    let maxPercentFull = 0; // 0-1

    containers.forEach(element => {
      let currentStore = _.sum(element.store);
      let percentFull = currentStore / element.storeCapacity;
      if (_.sum(element.store) > 0 && percentFull > maxPercentFull) {
        maxPercentFull = percentFull;
        containerId = element.id;
      }
    });

    return Game.getObjectById(containerId) as StructureContainer;
  }

  private determineDropOff(creep: Creep): Structure {
    let structure = creep.room.find<StructureExtension>(FIND_STRUCTURES, {
      filter: (structure: StructureExtension) => {
        return (structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity)
      }
    })[0];

    if(structure) {
      return structure;
    }

    return creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
  }

}
