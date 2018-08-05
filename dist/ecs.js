(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.ECS = {})));
}(this, (function (exports) { 'use strict';

  const asArray = x => x ? (x instanceof Array ? x : [x]) : [];
  const hasComponents = cnames => ent => cnames.every(cname => !!ent.components[cname.name || cname]);
  const hasComponent = cname => hasComponents(asArray(cname));

  const createWorld = () => {
    const entities = [];
    const systems = [];
    let _entn = 0;

    const addComponent = (ent, comp) => {
      ent.components[comp.constructor.name] = comp;
      systems
        .filter(sys => !sys.entities.includes(ent))
        .filter(sys => hasComponents(sys.filter)(ent))
        .forEach(sys => sys.entities.push(ent));
      return ent
    };

    const removeComponent = (ent, comp) => {
      delete ent.components[comp.name];
      systems
        .filter(sys => sys.entities.includes(ent))
        .filter(sys => !hasComponents(sys.filter)(ent))
        .forEach(sys => sys.entities = sys.entities.filter(e => e !== ent));
    };

    const addEntity = ent => {
      systems
        .filter(sys => hasComponents(sys.filter)(ent))
        .forEach(sys => sys.entities.push(ent));
      entities.push(ent);
    };

    const createEntity = () => {
      const newEnt = {
        id: ++_entn,
        components: {}
      };
      newEnt.addComponent = c => addComponent(newEnt, c);
      newEnt.removeComponent = c => removeComponent(newEnt, c);
      addEntity(newEnt);
      return newEnt
    };

    const addSystem = (filter, fn) => {
      const newSys = {
        filter: asArray(filter),
        entities: entities.filter(hasComponent(filter)),
        fn
      };
      systems.push(newSys);
    };

    const update = () => {
      systems.forEach(sys => sys.fn(sys.entities));
    };

    return {
      createEntity,
      addSystem,
      update
    }
  };

  function LogComponent(msg) {
    this.message = msg;
  }

  function WarnComponent() {}

  function SpriteComponent(size, color) {
    this.size = size;
    this.color = color;
  }

  function PositionComponent(x, y) {
    this.x = x;
    this.y = y;
  }

  function VelocityComponent(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  const LogSystem = ents => ents
    .forEach(x => {
      if (hasComponent(WarnComponent)(x))
        console.warn(x.components.LogComponent.message);
      else
        console.log(x.components.LogComponent.message);
      x.removeComponent(LogComponent);
    });

  const RenderSystem = (canvas, w, h) => {
    const ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;

    return ents => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ents
        .forEach(ent => {
          ctx.fillStyle = ent.components.SpriteComponent.color;
          ctx.fillRect(ent.components.PositionComponent.x, ent.components.PositionComponent.y, ent.components.SpriteComponent.size, ent.components.SpriteComponent.size);
        });
      }
  };

  const MovementSystem = ents => ents
    .forEach(ent => {
      ent.components.PositionComponent.x += ent.components.VelocityComponent.vx;
      ent.components.PositionComponent.y += ent.components.VelocityComponent.vy;
    });

  const createGame = (canvas) => {

    const world = createWorld();

    world.createEntity()
      .addComponent(new LogComponent('Hello'));

    world.createEntity()
      .addComponent(new LogComponent('world!'))
      .addComponent(new WarnComponent);

    world.createEntity()
      .addComponent(new PositionComponent(10, 10))
      .addComponent(new SpriteComponent(32, '#ff00ff'))
      .addComponent(new VelocityComponent(1, 2));

    world.createEntity()
      .addComponent(new PositionComponent(250, 250))
      .addComponent(new SpriteComponent(32, '#00ffff'))
      .addComponent(new VelocityComponent(-0.5, -3));

    world.addSystem([SpriteComponent, PositionComponent], RenderSystem(canvas, 400, 300));
    world.addSystem(LogComponent, LogSystem);
    world.addSystem([PositionComponent, VelocityComponent], MovementSystem);

    return world
  };

  exports.createGame = createGame;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
