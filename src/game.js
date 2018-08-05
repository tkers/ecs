import { createWorld, hasComponent, hasComponents } from './ecs'
import { LogComponent, WarnComponent, SpriteComponent, PositionComponent, VelocityComponent } from './components'
import { LogSystem, RenderSystem, MovementSystem } from './systems'

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
