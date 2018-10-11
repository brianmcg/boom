/**
 * Weapon names.
 * @type {Object}
 */
export const WEAPON_NAMES = {
  PISTOL: 'pistol',
  DOUBLE_SHOTGUN: 'doubleShotgun',
  CHAINGUN: 'chaingun',
};

export const SOUNDS = {
  ENEMIES: {
    AMP: {
      ALERT: 'ampAlert',
      DEATH: 'ampDeath',
      PAIN: 'ampPain',
    },
    MANCUBUS: {
      ALERT: 'mancubusAlert',
      DEATH: 'mancubusDeath',
    },
    ZOMBIE: {
      ALERT: 'zombieAlert',
      PAIN: 'zombiePain',
      DEATH: 'zombieDeath',
    },
  },
  PLAYER: {
    PAIN: 'playerPain',
    DEATH: 'playerDeath',
    WALK: 'walk',
  },
  WEAPONS: {
    CHANGE: 'weaponChange',
    PISTOL: WEAPON_NAMES.PISTOL,
    SHOTGUN: WEAPON_NAMES.SHOTGUN,
    DOUBLE_SHOTGUN: WEAPON_NAMES.DOUBLE_SHOTGUN,
  },
  WORLD: {
    DOOR_OPEN: 'doorOpen',
    DOOR_CLOSE: 'doorClose',
    ITEM_PICKUP: 'itemPickup',
  },
};

export const SOUND_FILES = [
  [SOUNDS.ENEMIES.AMP.ALERT, 'amp_alert.mp3'],
  [SOUNDS.ENEMIES.AMP.DEATH, 'amp_death.mp3'],
  [SOUNDS.ENEMIES.AMP.PAIN, 'amp_pain.mp3'],
  [SOUNDS.ENEMIES.MANCUBUS.ALERT, 'mancubus_alert.mp3'],
  [SOUNDS.ENEMIES.MANCUBUS.ALERT, 'zombie_alert.mp3'],
  [SOUNDS.ENEMIES.ZOMBIE.DEATH, 'mancubus_death.mp3'],
  [SOUNDS.ENEMIES.ZOMBIE.DEATH, 'zombie_death.mp3'],
  [SOUNDS.ENEMIES.ZOMBIE.PAIN, 'zombie_pain.mp3'],
  [SOUNDS.PLAYER.DEATH, 'player_death.mp3'],
  [SOUNDS.PLAYER.PAIN, 'player_pain.mp3'],
  [SOUNDS.PLAYER.WALK, 'player_walk.mp3', true],
  [SOUNDS.WEAPONS.CHANGE, 'weapon_pickup.mp3'],
  [SOUNDS.WEAPONS.DOUBLE_SHOTGUN, 'weapon_double_shotgun.mp3'],
  [SOUNDS.WEAPONS.PISTOL, 'weapon_pistol.mp3'],
  [SOUNDS.WEAPONS.SHOTGUN, 'weapon_shotgun.mp3'],
  [SOUNDS.WORLD.DOOR_CLOSE, 'world_door_close.mp3'],
  [SOUNDS.WORLD.DOOR_OPEN, 'world_door_open.mp3'],
  [SOUNDS.WORLD.ITEM_PICKUP, 'world_item_pickup.mp3'],
];
