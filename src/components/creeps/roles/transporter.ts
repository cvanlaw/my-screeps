import {BaseWorker} from "./baseWorker";
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
      //this.logger.debug("dropping off");
    }
    if (_.sum(creep.carry) < creep.carryCapacity && targetContainer) {
      //this.logger.debug("picking up");
      this.moveToWithdrawFromContainer(creep, targetContainer);
    }
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
