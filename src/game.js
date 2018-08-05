import { createWorld } from './ecs'
import { SpriteComponent, PositionComponent, VelocityComponent } from './components'
import { RenderSystem, MovementSystem } from './systems'

export const createGame = (canvas) => {

  const world = createWorld()

  world.createEntity()
    .addComponent(new PositionComponent(10, 10))
    .addComponent(new SpriteComponent(32, '#ff00ff'))
    .addComponent(new VelocityComponent(1, 2))

  world.createEntity()
    .addComponent(new PositionComponent(250, 250))
    .addComponent(new SpriteComponent(32, '#00ffff'))
    .addComponent(new VelocityComponent(-0.5, -3))

  world.addSystem([SpriteComponent, PositionComponent], RenderSystem(canvas, 400, 300))
  world.addSystem([PositionComponent, VelocityComponent], MovementSystem)

  return world
}
