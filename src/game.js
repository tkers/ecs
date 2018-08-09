import { createWorld } from './ecs'
import { SpriteComponent, PositionComponent, VelocityComponent, TargetComponent, SelectableComponent } from './components'
import { RenderSystem, MovementSystem, TargetingSystem, MouseSelectionSystem, MouseTargetSystem } from './systems'

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

  world.createEntity()
    .addComponent(new PositionComponent(280, 30))
    .addComponent(new SpriteComponent(16, '#00aaaa'))
    .addComponent(new VelocityComponent(0, 0))
    .addComponent(new TargetComponent(150, 150, 1))
    .addComponent(new SelectableComponent())

  world.addSystem([SpriteComponent, PositionComponent], RenderSystem(canvas, 400, 300))
  world.addSystem([PositionComponent, VelocityComponent], MovementSystem)
  world.addSystem([TargetComponent, PositionComponent, VelocityComponent], TargetingSystem)
  world.addSystem([SelectableComponent, PositionComponent, SpriteComponent], MouseSelectionSystem(canvas))
  world.addSystem([SelectableComponent, TargetComponent], MouseTargetSystem(canvas))

  return world
}
