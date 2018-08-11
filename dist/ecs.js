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

    const update = (ctx) => {
      systems.forEach(sys => sys.fn(sys.entities, ctx));
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

  function WanderComponent(interval, variance) {
    this.timer = 0;
    this.interval = interval;
    this.variance = variance;
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
          ctx.beginPath();
          ctx.arc(ent.components.PositionComponent.x, ent.components.PositionComponent.y, ent.components.SpriteComponent.size, 0, Math.PI * 2);
          ctx.fill();
          if (hasComponent(SelectableComponent)(ent) && ent.components.SelectableComponent.isSelected) {
            ctx.strokeStyle = '#000000';
            ctx.beginPath();
            ctx.arc(ent.components.PositionComponent.x, ent.components.PositionComponent.y, ent.components.SpriteComponent.size + 5, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
      }
  };

  const MovementSystem = (ents, dt) => ents
    .forEach(ent => {
      const r = ent.components.VelocityComponent.direction * Math.PI / 180;
      ent.components.PositionComponent.x += Math.cos(r) * ent.components.VelocityComponent.speed * dt;
      ent.components.PositionComponent.y += Math.sin(r) * ent.components.VelocityComponent.speed * dt;
    });

  const getDist = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
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
        const clickedEnt = ents.find(ent => getDist(
          clickX,
          clickY,
          ent.components.PositionComponent.x,
          ent.components.PositionComponent.y
        ) <= ent.components.SpriteComponent.size);

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

  const WanderSystem = (ents, dt) => ents
    .filter(ent => !hasComponent(SelectableComponent)(ent) || !ent.components.SelectableComponent.isSelected)
    .forEach(ent => {
      ent.components.WanderComponent.timer -= dt;
      if (ent.components.WanderComponent.timer > 0)
        return

      ent.components.WanderComponent.timer =
        ent.components.WanderComponent.interval -
        ent.components.WanderComponent.variance +
        Math.random() * 2 * ent.components.WanderComponent.variance;

      ent.components.VelocityComponent.direction = Math.random() * 360;
    });

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

    return (ents, dt) => ents.filter(ent => ent.components.SelectableComponent.isSelected).forEach(ent => {
      const targetDir = getTargetDir(
        ent.components.PositionComponent.x,
        ent.components.PositionComponent.y,
        mouseX,
        mouseY
      );
      ent.components.VelocityComponent.direction = turnToDir(ent.components.VelocityComponent.direction, targetDir, 360 * dt);
    })
  };

  const createGame = (canvas) => {

    const world = createWorld();

    world.createEntity()
      .addComponent(new PositionComponent(610, 610))
      .addComponent(new SpriteComponent(32, '#ff00ff'))
      .addComponent(new VelocityComponent(60, 45))
      .addComponent(new WanderComponent(1.5, 1))
      .addComponent(new SelectableComponent());

    world.createEntity()
      .addComponent(new PositionComponent(850, 250))
      .addComponent(new SpriteComponent(59, '#00ffff'))
      .addComponent(new VelocityComponent(30, 200))
      .addComponent(new SelectableComponent());

    world.createEntity()
      .addComponent(new PositionComponent(380, 130))
      .addComponent(new SpriteComponent(16, '#00aaaa'))
      .addComponent(new VelocityComponent(90, 180))
      .addComponent(new SelectableComponent());

    world.addSystem([SpriteComponent, PositionComponent], RenderSystem(canvas, 1200, 800));
    world.addSystem([PositionComponent, VelocityComponent], MovementSystem);
    world.addSystem([VelocityComponent, WanderComponent], WanderSystem);
    world.addSystem([SelectableComponent, PositionComponent, SpriteComponent], MouseSelectionSystem(canvas));
    world.addSystem([SelectableComponent, PositionComponent, VelocityComponent], MouseTargetSystem(canvas));

    return world
  };

  exports.createGame = createGame;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
