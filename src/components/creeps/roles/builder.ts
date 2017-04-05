import * as creepActions from "../creepActions";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
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
        creep.moveTo(creep.room.controller as StructureController);
      }
    }
  }

  else {
    if (creepActions.needsRenew(creep)) {
      creepActions.moveToRenew(creep, spawn);
    } else if (_.sum(creep.carry) === creep.carryCapacity) {
      _moveToDropEnergy(creep, spawn);
    } else {
      _moveToHarvest(creep, energySource);
    }
  }
}

function _tryHarvest(creep: Creep, target: Source): number {
  return creep.harvest(target);
}

function _moveToHarvest(creep: Creep, target: Source): void {
  if (_tryHarvest(creep, target) === ERR_NOT_IN_RANGE) {
    creepActions.moveTo(creep, target.pos);
  }
}

function _tryEnergyDropOff(creep: Creep, target: Spawn | Structure): number {
  return creep.transfer(target, RESOURCE_ENERGY);
}

function _moveToDropEnergy(creep: Creep, target: Spawn | Structure): void {
  if (_tryEnergyDropOff(creep, target) === ERR_NOT_IN_RANGE) {
    creepActions.moveTo(creep, target.pos);
  }
}
