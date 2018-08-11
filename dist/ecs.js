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

  function SpriteComponent(size, color) {
    this.size = size;
    this.color = color;
  }

  function PositionComponent(x, y) {
    this.x = x;
    this.y = y;
  }

  function VelocityComponent(speed, direction) {
    this.speed = speed;
    this.direction = direction;
  }

  function SelectableComponent(isSelected) {
    this.isSelected = isSelected;
  }

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
          if (hasComponent(SelectableComponent)(ent) && ent.components.SelectableComponent.isSelected) {
            ctx.fillStyle = '#000000';
            ctx.strokeRect(ent.components.PositionComponent.x - 5, ent.components.PositionComponent.y - 5, ent.components.SpriteComponent.size + 10, ent.components.SpriteComponent.size + 10);
          }
        });
      }
  };

  const MovementSystem = ents => ents
    .forEach(ent => {
      const r = ent.components.VelocityComponent.direction * Math.PI / 180;
      ent.components.PositionComponent.x += Math.cos(r) * ent.components.VelocityComponent.speed;
      ent.components.PositionComponent.y += Math.sin(r) * ent.components.VelocityComponent.speed;
    });

  const MouseSelectionSystem = (canvas) => {
    let clickX = 0;
    let clickY = 0;
    let mode = 0;
    canvas.addEventListener('mousedown', (e) => {
      clickX = e.pageX - e.target.offsetLeft;
      clickY = e.pageY - e.target.offsetTop;
      mode = 1;
    });

    canvas.addEventListener('mouseup', (e) => {
      clickX = e.pageX - e.target.offsetLeft;
      clickY = e.pageY - e.target.offsetTop;
      mode = 2;
    });

    return ents => {
      if (!mode)
        return

      if (mode === 1) {
        const clickedEnt = ents.find(ent => (
          clickX >= ent.components.PositionComponent.x &&
          clickY >= ent.components.PositionComponent.y &&
          clickX <= ent.components.PositionComponent.x + ent.components.SpriteComponent.size &&
          clickY <= ent.components.PositionComponent.y + ent.components.SpriteComponent.size
        ));

        if (clickedEnt)
          clickedEnt.components.SelectableComponent.isSelected = true;
      }

      if (mode === 2) {
        ents.forEach(ent => {
          ent.components.SelectableComponent.isSelected = false;
        });
      }

      mode = 0;
    }
  };

  const wrapDir = d => (d + 360) % 360;

  const turnToDir = (startDir, targetDir, maxSpeed = 180) => {
    const targetDirDiff = startDir - targetDir;
    const turnDir = wrapDir(targetDirDiff) > 180 ? 1 : -1;
    const turnSpeed = Math.min(Math.abs(targetDirDiff), maxSpeed);
    return wrapDir(startDir + turnDir * turnSpeed)
  };

  const getTargetDir = (startX, startY, targetX, targetY) => {
    const dx = targetX - startX;
    const dy = targetY - startY;
    return Math.atan2(dy, dx) * 180 / Math.PI
  };

  const MouseTargetSystem = (canvas) => {
    let mouseX = 0;
    let mouseY = 0;
    canvas.addEventListener('mousemove', (e) => {
      mouseX = e.pageX - e.target.offsetLeft;
      mouseY = e.pageY - e.target.offsetTop;
    });

    return ents => ents.filter(ent => ent.components.SelectableComponent.isSelected).forEach(ent => {
      const offset = hasComponent(SpriteComponent)(ent) ? ent.components.SpriteComponent.size / 2 : 0;
      const targetDir = getTargetDir(
        ent.components.PositionComponent.x,
        ent.components.PositionComponent.y,
        mouseX - offset,
        mouseY - offset
      );
      ent.components.VelocityComponent.direction = turnToDir(ent.components.VelocityComponent.direction, targetDir, 6);
    })
  };

  const createGame = (canvas) => {

    const world = createWorld();

    world.createEntity()
      .addComponent(new PositionComponent(10, 10))
      .addComponent(new SpriteComponent(32, '#ff00ff'))
      .addComponent(new VelocityComponent(1, 45))
      .addComponent(new SelectableComponent());

    world.createEntity()
      .addComponent(new PositionComponent(250, 250))
      .addComponent(new SpriteComponent(59, '#00ffff'))
      .addComponent(new VelocityComponent(0.5, 200))
      .addComponent(new SelectableComponent());

    world.createEntity()
      .addComponent(new PositionComponent(280, 30))
      .addComponent(new SpriteComponent(16, '#00aaaa'))
      .addComponent(new VelocityComponent(1.5, 180))
      .addComponent(new SelectableComponent());

    world.addSystem([SpriteComponent, PositionComponent], RenderSystem(canvas, 400, 300));
    world.addSystem([PositionComponent, VelocityComponent], MovementSystem);
    world.addSystem([SelectableComponent, PositionComponent, SpriteComponent], MouseSelectionSystem(canvas));
    world.addSystem([SelectableComponent, PositionComponent, VelocityComponent], MouseTargetSystem(canvas));

    return world
  };

  exports.createGame = createGame;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
