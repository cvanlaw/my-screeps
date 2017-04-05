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

    if (creep.memory.building && creep.carry.energy == 0) {
      creep.memory.building = false;
      creep.say('harvest');
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
      creep.say('build');
    }

    if (creep.memory.building) {
      if (targets.length) {
        if (creep.build(targets[0] as ConstructionSite) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0] as ConstructionSite);
        }
      }
    }

    else {
      if (creepActions.needsRenew(creep)) {
        creepActions.moveToRenew(creep, spawn);
      } else if (_.sum(creep.carry) === creep.carryCapacity) {
        this.moveToDropEnergy(creep, spawn);
      } else {
        this.moveToHarvest(creep, energySource);
      }
    }
  }
}
