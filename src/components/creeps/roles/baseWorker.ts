import * as creepActions from "../creepActions";
import { log } from "../../../lib/logger/log";

export class BaseWorker {

  constructor( public logger = log) {  }

  protected tryHarvest(creep: Creep, target: Source): number {
    return creep.harvest(target);
  }

  protected moveToHarvest(creep: Creep, target: Source): void {
    if (this.tryHarvest(creep, target) === ERR_NOT_IN_RANGE) {
      creepActions.moveTo(creep, target.pos);
    }
  }

  protected tryEnergyDropOff(creep: Creep, target: Spawn | Structure): number {
    return creep.transfer(target, RESOURCE_ENERGY);
  }

  protected moveToDropEnergy(creep: Creep, target: Spawn | Structure): void {
    if (this.tryEnergyDropOff(creep, target) === ERR_NOT_IN_RANGE) {
      creepActions.moveTo(creep, target.pos);
    }
  }

  protected determineEnergyDropOff(creep: Creep): Spawn | StructureContainer {
    let container = creep.pos.findClosestByRange<Structure>(FIND_STRUCTURES, {
      filter: (structure: Structure) => {
        return (structure.structureType == STRUCTURE_CONTAINER);
      }
    });

    if (container) {
      return container as StructureContainer;
    }

    log.debug("no structure container");
    return creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
  }

  protected moveToWithdrawFromContainer(creep: Creep, container: StructureContainer) {
    if (creep.withdraw(container, RESOURCE_ENERGY, creep.carryCapacity - _.sum(creep.carry)) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container);
      }
  }

  protected determineContainer(creep: Creep, useFullest: Boolean = true): StructureContainer | null {
    if(useFullest) {
      return this.determineFullestContainer(creep);
    }

    let container = creep.pos.findClosestByRange<StructureContainer>(FIND_STRUCTURES, {
      filter: (structure: StructureContainer) => {
        return (structure.structureType == STRUCTURE_CONTAINER);
      }
    });

    if (!container) {
      log.error("No containers");
      return null;
    }

    return container;
  }

  protected determineFullestContainer(creep: Creep): StructureContainer | null {
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
      if (currentStore > 0 && currentStore >= creep.carryCapacity && percentFull > maxPercentFull) {
        maxPercentFull = percentFull;
        containerId = element.id;
      }
    });

    if(maxPercentFull === 0) {
      return null;
    }

    return Game.getObjectById(containerId) as StructureContainer;
  }
}
