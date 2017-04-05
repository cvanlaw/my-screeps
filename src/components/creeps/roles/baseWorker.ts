import * as creepActions from "../creepActions";
import { log } from "../../../lib/logger/log";

export class BaseWorker {

  constructor() {  }

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
    let container = creep.room.find<Structure>(FIND_STRUCTURES, {
      filter: (structure: Structure) => {
        return (structure.structureType == STRUCTURE_CONTAINER);
      }
    })[0];

    if (container) {
      return container as StructureContainer;
    }

    log.debug("no structure container");
    return creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
  }
}
