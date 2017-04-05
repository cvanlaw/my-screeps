/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
  if (creep) {
    creep = creep as Creep;
    if (creep.memory.upgrading && creep.carry.energy == 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
    }

    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller as StructureController) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller as StructureController, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
    else {
      var sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0] as Source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0] as Source, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  }
}
