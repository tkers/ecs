import { createWorld } from './ecs'
import { SpriteComponent, PositionComponent, VelocityComponent, SelectableComponent } from './components'
import { RenderSystem, MovementSystem, MouseSelectionSystem, MouseTargetSystem } from './systems'

export const createGame = (canvas) => {

  const world = createWorld()

  world.createEntity()
    .addComponent(new PositionComponent(10, 10))
    .addComponent(new SpriteComponent(32, '#ff00ff'))
    .addComponent(new VelocityComponent(1, 45))
    .addComponent(new SelectableComponent())

  world.createEntity()
    .addComponent(new PositionComponent(250, 250))
    .addComponent(new SpriteComponent(59, '#00ffff'))
    .addComponent(new VelocityComponent(0.5, 200))
    .addComponent(new SelectableComponent())

  world.createEntity()
    .addComponent(new PositionComponent(280, 30))
    .addComponent(new SpriteComponent(16, '#00aaaa'))
    .addComponent(new VelocityComponent(1.5, 180))
    .addComponent(new SelectableComponent())

  world.addSystem([SpriteComponent, PositionComponent], RenderSystem(canvas, 400, 300))
  world.addSystem([PositionComponent, VelocityComponent], MovementSystem)
  world.addSystem([SelectableComponent, PositionComponent, SpriteComponent], MouseSelectionSystem(canvas))
  world.addSystem([SelectableComponent, PositionComponent, VelocityComponent], MouseTargetSystem(canvas))

  return world
}
