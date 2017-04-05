import * as creepActions from "../creepActions";
import * as BaseWorker from "./baseWorker";
import { log } from "../../../lib/logger/log";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export class Harvester extends BaseWorker.BaseWorker {
  constructor(

  ) { super(); }

  public run(creep: Creep): void {
    let spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
    let energySource = creep.room.find<Source>(FIND_SOURCES_ACTIVE)[0];

    if (creepActions.needsRenew(creep)) {
      creepActions.moveToRenew(creep, spawn);
    } else if (_.sum(creep.carry) === creep.carryCapacity) {
      log.debug(creep.name + " moving to drop off energy.");
      this.moveToDropEnergy(creep, this.determineEnergyDropOff(creep));
    } else {
      log.debug(creep.name + " harvesting");
      this.moveToHarvest(creep, energySource);
    }
  }
}
