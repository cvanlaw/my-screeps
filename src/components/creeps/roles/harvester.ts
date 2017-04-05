import * as creepActions from "../creepActions";
import * as BaseWorker from "./baseWorker";
import * as Config from "../../../config/config";

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
    let targetContainer = this.determineEnergyDropOff(creep);

    if (creepActions.needsRenew(creep) && _.sum(creep.carry) === 0) {
      creepActions.moveToRenew(creep, spawn);
    } else if (_.sum(creep.carry) === creep.carryCapacity) {
      //this.logger.debug(creep.name + " moving to drop off energy.");
      if(targetContainer.structureType == STRUCTURE_CONTAINER
      && _.sum((targetContainer as StructureContainer).store) == (targetContainer as StructureContainer).storeCapacity
      && (targetContainer as StructureContainer).ticksToDecay <= Config.DEFAULT_MIN_TICKS_TO_DECAY_BEFORE_REPAIR) {
        if(creep.repair(targetContainer) === ERR_NOT_IN_RANGE) {
          creep.say("moving to repair");
          creep.moveTo(targetContainer);
        }
      }
    else {
      this.moveToDropEnergy(creep, this.determineEnergyDropOff(creep));
    }
    } else {
      //this.logger.debug(creep.name + " harvesting");
      this.moveToHarvest(creep, this.determineSource(creep));
    }
  }

  private determineSource(creep: Creep): Source {
    let source = Game.getObjectById(creep.memory.sourceId);
    let creeps = creep.room.find<Creep>(FIND_MY_CREEPS);

    let harvesters = _.filter(creeps, (crp) => crp.memory.role === "harvester");

    if (source) {
      return source as Source;
    }

    let map = new Map<string, number>();
    let sources = creep.room.find<Source>(FIND_SOURCES_ACTIVE);

    if (sources) {
      sources.forEach(source => {
        let i = 0;
        map.set(source.id, i);

        harvesters.forEach(harvester => {
          if(harvester.memory.sourceId === source.id) {
            map.set(source.id, ++i);
          }
        });
      });
    }

    let min = -1;
    let sourceId = "";
    for(var key in map) {
      let value = map.get(key);
      this.logger.debug("Source " + key + " has " + value + " harvesters.");
      if(value && value < min && min > 0) {
        min = value;
        sourceId = key;
      }
    }

    if(sourceId != "") {
      creep.memory.sourceId = sourceId;
      return Game.getObjectById(sourceId) as Source;
    }

    creep.memory.sourceId = sources[0].id;
    return sources[0];
  }
}
