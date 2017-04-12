import * as creepActions from "../creepActions";
import * as BaseWorker from "./baseWorker";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export class Upgrader extends BaseWorker.BaseWorker {
  constructor() { super(); }

public run(creep: Creep): void {
  let spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
  let energySource = creep.room.find<Source>(FIND_SOURCES_ACTIVE)[0];

  if (creep.memory.upgrading && creep.carry.energy == 0) {
    creep.memory.upgrading = false;
    creep.say('harvest');
  }
  if (!creep.memory.upgrading && creep.carry.energy && creep.carry.energy > 0) {
    creep.memory.upgrading = true;
    creep.say('upgrade');
  }

  if (creep.memory.upgrading) {
    if (creep.room.controller) {
      if (creep.upgradeController(creep.room.controller as StructureController) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller as StructureController);
      }
    }
  }

  else {
    if (creepActions.needsRenew(creep)) {
      creepActions.moveToRenew(creep, spawn);
    } else if (_.sum(creep.carry) === creep.carryCapacity) {
      this.moveToDropEnergy(creep, spawn);
    } else {
      let container = this.determineContainer(creep, false);
        if (container) {
          //this.logger.debug("builder withdrawing from container.")
          this.moveToWithdrawFromContainer(creep, container);
        }
        else {
          this.moveToHarvest(creep, energySource);
        }
    }
  }
}
}
