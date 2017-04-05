import { log } from "../../../lib/logger/log";
/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export class Transporter {
  public run(creep: Creep): void {


    let targetContainer = this.determineContainer(creep);

    if (targetContainer) {
      if (creep.withdraw(targetContainer, RESOURCE_ENERGY, creep.carryCapacity) == ERR_NOT_IN_RANGE)
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

}