import { createWorld, hasComponent, hasComponents } from './ecs'
import { LogComponent, WarnComponent, SpriteComponent, PositionComponent, VelocityComponent } from './components'

const LogSystem = ents => ents
  .forEach(x => {
    if (hasComponent(WarnComponent)(x))
      console.warn(x.components.LogComponent.message)
    else
      console.log(x.components.LogComponent.message);
    x.removeComponent(LogComponent)
  })

const RenderSystem = (canvas, w, h) => {
  const ctx = canvas.getContext('2d')
  canvas.width = w
  canvas.height = h

  return ents => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ents
      .forEach(ent => {
        ctx.fillStyle = ent.components.SpriteComponent.color
        ctx.fillRect(ent.components.PositionComponent.x, ent.components.PositionComponent.y, ent.components.SpriteComponent.size, ent.components.SpriteComponent.size)
      })
    }
}

const MovementSystem = ents => ents
  .forEach(ent => {
    ent.components.PositionComponent.x += ent.components.VelocityComponent.vx
    ent.components.PositionComponent.y += ent.components.VelocityComponent.vy
  })

export const createGame = (canvas) => {

  const world = createWorld()

  world.createEntity()
    .addComponent(new LogComponent('Hello'))

  world.createEntity()
    .addComponent(new LogComponent('world!'))
    .addComponent(new WarnComponent)

  world.createEntity()
    .addComponent(new PositionComponent(10, 10))
    .addComponent(new SpriteComponent(32, '#ff00ff'))
    .addComponent(new VelocityComponent(1, 2))

  world.createEntity()
    .addComponent(new PositionComponent(250, 250))
    .addComponent(new SpriteComponent(32, '#00ffff'))
    .addComponent(new VelocityComponent(-0.5, -3))

  world.addSystem([SpriteComponent, PositionComponent], RenderSystem(canvas, 400, 300))
  world.addSystem(LogComponent, LogSystem)
  world.addSystem([PositionComponent, VelocityComponent], MovementSystem)

  return world
}
