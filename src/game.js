import { createWorld } from './ecs'
import { SpriteComponent, PositionComponent, VelocityComponent, SelectableComponent, WanderComponent } from './components'
import { RenderSystem, MovementSystem, WanderSystem, MouseSelectionSystem, MouseTargetSystem } from './systems'

export const createGame = (canvas) => {

  const world = createWorld()

  world.createEntity()
    .addComponent(new PositionComponent(610, 610))
    .addComponent(new SpriteComponent(32, '#ff00ff'))
    .addComponent(new VelocityComponent(60, 45))
    .addComponent(new WanderComponent(1.5, 1))
    .addComponent(new SelectableComponent())

  world.createEntity()
    .addComponent(new PositionComponent(850, 250))
    .addComponent(new SpriteComponent(59, '#00ffff'))
    .addComponent(new VelocityComponent(30, 200))
    .addComponent(new SelectableComponent())

  world.createEntity()
    .addComponent(new PositionComponent(380, 130))
    .addComponent(new SpriteComponent(16, '#00aaaa'))
    .addComponent(new VelocityComponent(90, 180))
    .addComponent(new SelectableComponent())

  world.addSystem([SpriteComponent, PositionComponent], RenderSystem(canvas, 1200, 800))
  world.addSystem([PositionComponent, VelocityComponent], MovementSystem)
  world.addSystem([VelocityComponent, WanderComponent], WanderSystem)
  world.addSystem([SelectableComponent, PositionComponent, SpriteComponent], MouseSelectionSystem(canvas))
  world.addSystem([SelectableComponent, PositionComponent, VelocityComponent], MouseTargetSystem(canvas))

  return world
}
